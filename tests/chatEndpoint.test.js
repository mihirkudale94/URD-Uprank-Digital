import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { __resetRateLimits, detectVisitorLanguage } from '../api/chat.js';
import { FALLBACK_REPLY } from '../src/utils/servicePlaybook.js';

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

  // Every test in this file shares one process and one client key, so the limiter has to
  // start from nothing or a later test would be rejected for what an earlier one sent.
  __resetRateLimits();

  if (apiKey === null) delete process.env.GROQ_API_KEY;
  else process.env.GROQ_API_KEY = apiKey;
  // Pinned so the fallback list cannot change what the assertions count.
  process.env.GROQ_MODEL = 'stub-model';
  // Long enough to be a deliberate wait, short enough that the stall test is not one.
  process.env.CHAT_UPSTREAM_TIMEOUT_MS = '60';

  globalThis.fetch = async (url, options) => {
    const reply = replies[calls.length] || replies[replies.length - 1];
    calls.push({ url, options, body: JSON.parse(options.body) });

    // A model that accepts the request and then goes quiet. It only ever settles when
    // the endpoint's own timeout aborts it, which is the behaviour under test.
    if (reply.stall) {
      return new Promise((_resolve, reject) => {
        options.signal?.addEventListener('abort', () => {
          const aborted = new Error('The operation was aborted.');
          aborted.name = 'AbortError';
          reject(aborted);
        });
      });
    }

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
    delete process.env.CHAT_UPSTREAM_TIMEOUT_MS;
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
      // The widget compares the finished reply against this exact literal to recognise
      // the frame when it misses the flag, so the frame has to carry it verbatim.
      assert.equal(sseContent(res), FALLBACK_REPLY);
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

test('a flood from one address is turned away before it reaches Groq', async () => {
  await withGroq(async (calls) => {
    const request = () => ({
      method: 'POST',
      headers: { 'x-forwarded-for': '203.0.113.7' },
      body: { messages: conversation }
    });

    const statuses = [];
    for (let attempt = 0; attempt < 25; attempt += 1) {
      const res = mockResponse();
      await handler(request(), res);
      statuses.push(res.statusCode);
    }

    const refused = statuses.filter((status) => status === 429);
    assert.ok(refused.length > 0, 'a 25-message burst should hit the limit');
    // Only the messages that got through cost anything upstream.
    assert.equal(calls.length, statuses.length - refused.length);
  });
});

test('one visitor hitting the limit does not silence another', async () => {
  await withGroq(async () => {
    const send = async (ip) => {
      const res = mockResponse();
      await handler({ method: 'POST', headers: { 'x-forwarded-for': ip }, body: { messages: conversation } }, res);
      return res.statusCode;
    };

    for (let attempt = 0; attempt < 25; attempt += 1) await send('198.51.100.4');

    assert.equal(await send('198.51.100.9'), 200);
  });
});

test('a model that never answers is abandoned for the next one', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 2, 'the stalled attempt should not be the last word');
      assert.equal(isFallback(res), false);
      assert.equal(sseContent(res), 'Here is what we need from you.');
    },
    { replies: [{ stall: true }, { ok: true }] }
  );
});

test('the prompt tells the model to write the number in plain digits', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /\+91 93711 16165/);
    assert.match(prompt, /ordinary spaces/);
    // The widget looks for this literal to offer the consultation button, in any language.
    assert.match(prompt, /"request a consultation" stay in English/);
    assert.equal(res.ended, true);
  });
});

test('the opening message survives a conversation longer than the cap', async () => {
  await withGroq(async (calls) => {
    const opening = { role: 'user', content: 'we run a jewellery showroom in baner' };
    const long = [opening];
    for (let index = 0; index < 30; index += 1) {
      long.push({ role: index % 2 === 0 ? 'assistant' : 'user', content: `turn ${index}` });
    }
    long.push({ role: 'user', content: 'so what do i do next?' });

    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: long } }, res);

    const sent = calls[0].body.messages.filter((message) => message.role !== 'system');
    // The cap has not moved: the opening message takes a slot rather than adding one.
    assert.equal(sent.length, 12);
    assert.equal(sent[0].content, opening.content, 'the business should still be in context');
    assert.equal(sent.at(-1).content, 'so what do i do next?');
    assert.equal(res.ended, true);
  });
});

test('a short conversation is passed through untouched', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const sent = calls[0].body.messages.filter((message) => message.role !== 'system');
    assert.deepEqual(sent, conversation, 'nothing to pin or trim at this length');
  });
});

test('the visitor waits one budget, not one per model', async () => {
  await withGroq(
    async (calls) => {
      process.env.CHAT_TOTAL_BUDGET_MS = '150';
      process.env.CHAT_UPSTREAM_TIMEOUT_MS = '100';

      const started = Date.now();
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);
      const waited = Date.now() - started;

      // Four stalling models at 100ms each would be 400ms without a shared deadline.
      assert.ok(waited < 320, `waited ${waited}ms, which is past the budget`);
      assert.ok(calls.length >= 1, 'it should still have tried');
      assert.equal(res.statusCode, 200);
      assert.equal(isFallback(res), true, 'the playbook answers once the budget is gone');

      delete process.env.CHAT_TOTAL_BUDGET_MS;
    },
    { replies: [{ stall: true }, { stall: true }, { stall: true }, { stall: true }] }
  );
});

test('the prompt qualifies corporate visitors one question at a time', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /corporate solutions assistant/i);
    assert.match(prompt, /at most one question per reply/i);
    assert.match(prompt, /indicative budget range/i);
    // Contact details go through the in-chat form, never typed into the conversation.
    assert.match(prompt, /Do not ask for a name, email address or phone number in the chat itself/);
    assert.match(prompt, /request a consultation/);
    assert.equal(res.ended, true);
  });
});

test('the consultation invitation is not repeated once it has been made', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    const invited = [
      { role: 'user', content: 'We are a 200-person logistics firm looking at paid campaigns.' },
      { role: 'assistant', content: 'That fits Performance Marketing. You can request a consultation whenever you are ready.' },
      { role: 'user', content: 'Do you work with LinkedIn?' }
    ];
    await handler({ method: 'POST', body: { messages: invited } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /already invited this visitor/);
  });
});

test('the prompt refuses to name deliverables outside the five lines', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /name no other deliverable/i);
    for (const promise of ['payment gateways', 'mobile apps', 'hosting']) {
      assert.ok(prompt.includes(promise), `the prompt should rule out ${promise}`);
    }
    // The rule bounds what the assistant promises, not who it talks to. Listing a word
    // a whole industry uses for its goal - "booking" for travel, hotels, clinics - made
    // it turn a real buyer away, so the limit says so in as many words.
    assert.match(prompt, /limits what you promise, never who you welcome/i);
    assert.ok(!/booking/i.test(prompt), 'a visitor whose goal is bookings is still a website lead');
  });
});

test('a model at its token limit hands over to the next one', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      // Groq counts tokens per minute per model, so a 429 on one is not the end of the list.
      assert.equal(calls.length, 2);
      assert.equal(isFallback(res), false);
    },
    { replies: [{ ok: false, status: 429 }, { ok: true }] }
  );
});

test('a pricing or timing question gets the consultation, not a budget question or a period', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /Cost, fees, pricing or "how much": do not ask for their budget in reply/);
    assert.match(prompt, /do not give any period, not even "a few weeks"/);
    assert.match(prompt, /Never ask for something the visitor has already told you/);
  });
});

test('positioning comes from the site, so the bot can answer "how are you different"', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    assert.match(prompt, /Measured on enquiries, not clicks/);
    assert.match(prompt, /You own everything/);
    assert.match(prompt, /Free discovery call/);
    assert.match(prompt, /what challenge they are trying to solve/);
  });
});

test('the language of the latest message is named in the prompt', async () => {
  const hinglish = [{ role: 'user', content: 'mera skincare brand hai, kya aap ads fix kar sakte ho?' }];
  const devanagari = [{ role: 'user', content: 'मुझे नई वेबसाइट चाहिए' }];

  for (const [messages, expected] of [
    [hinglish, /Hinglish or Romanised Marathi/],
    [devanagari, /written in Devanagari/],
    [conversation, /Reply in the language of the visitor's latest message/]
  ]) {
    await withGroq(async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages } }, res);
      assert.match(calls[0].body.messages[0].content, expected);
    });
  }
});

test('plain English is not mistaken for Hinglish', () => {
  assert.equal(detectVisitorLanguage('We need more enquiries, what is the cost per month?'), 'english');
  assert.equal(detectVisitorLanguage('jaldi chahiye, aapki fees kitni hai?'), 'romanised');
});

test('the prompt carries the company facts and names what it must not guess', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    // Without these the model invented a Mumbai office, a remote team and office hours.
    assert.match(prompt, /Kondhwa Budruk/);
    assert.match(prompt, /Founded in 2017/);
    assert.match(prompt, /URD Solutions Pvt\. Ltd\./);
    assert.match(prompt, /This is the only office/);
    for (const topic of ['team size', 'office hours', 'Google Partner', 'GST', 'outside India', 'lock-in', 'refunds']) {
      assert.ok(prompt.includes(topic), `the prompt should name "${topic}" as unknown`);
    }
    assert.match(prompt, /never say something does not exist/i);
    assert.match(prompt, /letter for letter/);
  });
});

test('Marathi is told apart from Hindi, though both use Devanagari', () => {
  assert.equal(detectVisitorLanguage('तुमची फी किती आहे?'), 'marathi');
  assert.equal(detectVisitorLanguage('मुझे नई वेबसाइट चाहिए'), 'devanagari');
});

const guardrailFrame = (res) =>
  res.chunks
    .join('')
    .split('\n')
    .filter((line) => line.startsWith('data: ') && !line.includes('[DONE]'))
    .map((line) => JSON.parse(line.slice(6)))
    .find((frame) => frame.urd_guardrail)?.urd_guardrail;

test('a reply that breaks a guardrail is rewritten before the visitor sees it', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 2, 'one draft, one rewrite');
      const correction = calls[1].body.messages.at(-1);
      assert.equal(correction.role, 'system');
      assert.match(correction.content, /quoted a price/);
      assert.equal(sseContent(res), 'Costs are set out in a written plan after a discovery call.');
      assert.deepEqual(guardrailFrame(res), { rules: ['price'], outcome: 'rewritten' });
    },
    {
      replies: [
        { ok: true, text: 'A basic website costs ₹25,000.' },
        { ok: true, text: 'Costs are set out in a written plan after a discovery call.' }
      ]
    }
  );
});

test('a rewrite that still breaks a guardrail is replaced by the safe reply', async () => {
  await withGroq(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { messages: conversation } }, res);

      assert.equal(calls.length, 2);
      const sent = sseContent(res);
      assert.ok(!sent.includes('Mumbai'));
      assert.match(sent, /do not have that detail here/);
      assert.match(sent, /request a consultation/);
      assert.equal(guardrailFrame(res).outcome, 'safe_reply');
      assert.equal(isFallback(res), false);
    },
    {
      replies: [
        { ok: true, text: 'Our office is located in Mumbai.' },
        { ok: true, text: 'Our team is based in Mumbai and Pune.' }
      ]
    }
  );
});

test('a clean reply goes out untouched, with no guardrail flag', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);
    assert.equal(calls.length, 1);
    assert.equal(guardrailFrame(res), undefined);
  });
});

test('the prompt never hands the model the word WordPress, except to forbid it', async () => {
  await withGroq(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { messages: conversation } }, res);

    const prompt = calls[0].body.messages[0].content;
    const mentions = prompt.match(/wordpress/gi) || [];
    assert.equal(mentions.length, 1, 'only the rule that forbids it may name it');
    assert.match(prompt, /Never mention WordPress/);
    assert.match(prompt, /launch on Shopify or custom code/);
  });
});
