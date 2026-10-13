import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/chat.js';

const conversation = [
  { role: 'user', content: 'can you run google ads for us?' },
  { role: 'assistant', content: 'Performance Marketing is the right line for that.' },
  { role: 'user', content: 'what do you need from me to start?' }
];

// Stand-in for Vercel's response object. Unlike the lead endpoint this one streams, so
// it has to record `write` calls as well as the status and headers.
const mockResponse = () => ({
  statusCode: null,
  body: null,
  headers: {},
  chunks: [],
  ended: false,
  setHeader(key, value) {
    this.headers[key] = value;
  },
  status(code) {
    this.statusCode = code;
    return this;
  },
  json(body) {
    this.body = body;
    return this;
  },
  write(chunk) {
    this.chunks.push(typeof chunk === 'string' ? chunk : new TextDecoder().decode(chunk));
  },
  end() {
    this.ended = true;
  }
});

const streamOf = (text) =>
  new ReadableStream({
    start(controller) {
      controller.enqueue(
        new TextEncoder().encode(
          `data: ${JSON.stringify({
            model: 'stub-model',
            choices: [{ delta: { content: text } }]
          })}\n\ndata: [DONE]\n\n`
        )
      );
      controller.close();
    }
  });

// Swaps in a fake Groq and restores the real fetch and env afterwards. `replies` is one
// entry per expected call, so a run can hand back a failure and then a success.
const withGroq = async (run, { apiKey = 'test-key', replies = [{ ok: true }] } = {}) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.GROQ_API_KEY;
  const originalModel = process.env.GROQ_MODEL;
  const calls = [];

  if (apiKey === null) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = apiKey;
  // Pinned so the fallback list cannot change what the assertions count.
  process.env.GROQ_MODEL = 'stub-model';

  globalThis.fetch = async (url, options) => {
    const reply = replies[calls.length] || replies[replies.length - 1];
    calls.push({ url, options, body: JSON.parse(options.body) });

    return {
      ok: Boolean(reply.ok),
      status: reply.status ?? (reply.ok ? 200 : 500),
      body: reply.ok ? streamOf(reply.text ?? 'Here is what we need from you.') : null,
      text: async () => 'stub error'
    };
  };

  try {
    return await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.GROQ_API_KEY;
    else process.env.GROQ_API_KEY = originalKey;
    if (originalModel === undefined) delete process.env.GROQ_MODEL;
    else process.env.GROQ_MODEL = originalModel;
  }
};

const sseContent = (res) =>
  res.chunks
    .join('')
    .split('\n')
    .filter((line) => line.startsWith('data: ') && !line.includes('[DONE]'))
    .map((line) => JSON.parse(line.slice(6)))
    .map((frame) => frame.choices?.[0]?.delta?.content ?? '')
    .join('');

const isFallback = (res) => res.chunks.join('').includes('"urd_fallback":true');

test('a conversation is streamed back from Groq as it arrives', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, 'https://api.groq.com/openai/v1/chat/completions');
    assert.equal(calls[0].options.headers.Authorization, 'Bearer test-key');
    assert.equal(calls[0].body.stream, true);

    // The system prompt leads, and the five service lines travel with it.
    assert.equal(calls[0].body.messages[0].role, 'system');
    assert.match(calls[0].body.messages[0].content, /Performance Marketing/);
    assert.deepEqual(calls[0].body.messages.slice(1), conversation);

    assert.equal(res.statusCode, 200);
    assert.match(res.headers['Content-Type'], /text\/event-stream/);
    assert.equal(sseContent(res), 'Here is what we need from you.');
    assert.equal(isFallback(res), false);
    assert.equal(res.ended, true);
  });
});

test('the request body never carries the conversation past the message cap', async () => {
  await withGroq(async (calls) => {
    const long = Array.from({ length: 20 }, (_, index) => ({
      role: index % 2 === 0 ? 'user' : 'assistant',
      content: `turn ${index}`
    }));
    // The cap counts from the end, so make the last turn the visitor's.
    long.push({ role: 'user', content: 'and the timeline?' });

    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: long } }, res);

    // 12 turns of history plus the system prompt.
    assert.equal(calls[0].body.messages.length, 13);
    assert.equal(calls[0].body.messages.at(-1).content, 'and the timeline?');
    assert.equal(res.ended, true);
  });
});

test('a missing key answers 200 with a fallback frame the widget can swap out', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 0);
      assert.equal(res.statusCode, 200);
      assert.equal(isFallback(res), true);
      assert.match(sseContent(res), /having trouble connecting/i);
      assert.equal(res.ended, true);
    },
    { apiKey: null, replies: [{ ok: true }] }
  );
});

test('a retired model id falls through to the next one', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 2);
      assert.equal(isFallback(res), false);
      assert.equal(sseContent(res), 'Here is what we need from you.');
    },
    { replies: [{ ok: false, status: 404 }, { ok: true }] }
  );
});

test('a rejected key stops after one attempt and falls back', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 1);
      assert.equal(res.statusCode, 200);
      assert.equal(isFallback(res), true);
    },
    { replies: [{ ok: false, status: 401 }] }
  );
});

test('a payload that does not end with the visitor speaking is rejected', async () => {
  await withGroq(async (calls) => {
    for (const messages of [[], [{ role: 'assistant', content: 'hello' }], 'not an array']) {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages } }, res);
      assert.equal(res.statusCode, 400);
      assert.equal(res.body.success, false);
    }

    assert.equal(calls.length, 0);
  });
});

test('only POST is allowed', async () => {
  await withGroq(async () => {
    const res = mockResponse();
    await handler({ method: 'GET' }, res);

    assert.equal(res.statusCode, 405);
    assert.equal(res.headers.Allow, 'POST');
  });
});
