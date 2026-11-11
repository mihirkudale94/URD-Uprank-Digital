import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { __resetChatLogLimits, redactContactDetails } from '../api/chat-log.js';

const transcript = [
  { role: 'assistant', content: 'Welcome to Up Rank Digital.' },
  { role: 'user', content: 'Do you build Shopify stores? Mail me at asha@example.com or call 98765 43210.' },
  { role: 'assistant', content: 'Yes. You can WhatsApp the team at +91 93711 16165.' }
];

const mockResponse = () => {
  const recorded = { statusCode: null, body: null, headers: {}, ended: false };
  return {
    recorded,
    setHeader(key, value) {
      recorded.headers[key] = value;
    },
    status(code) {
      recorded.statusCode = code;
      return this;
    },
    json(body) {
      recorded.body = body;
      return this;
    },
    end() {
      recorded.ended = true;
      return this;
    }
  };
};

const withResend = async (run, { apiKey = 'test-key', ok = true } = {}) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const calls = [];
  __resetChatLogLimits();

  if (apiKey === null) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = apiKey;

  globalThis.fetch = async (url, options) => {
    calls.push({ url, body: JSON.parse(options.body) });
    return { ok, status: ok ? 200 : 500, text: async () => 'stub error' };
  };

  try {
    return await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
};

const post = (body, ip = '203.0.113.7') => ({ method: 'POST', headers: { 'x-forwarded-for': ip }, body });

test('a conversation is emailed with the visitor contact details removed', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler(post({ messages: transcript, page_url: 'https://www.uprankdigital.com/', lead_submitted: false }), res);

    assert.equal(res.recorded.statusCode, 200);
    assert.equal(calls.length, 1);
    const { subject, text, to } = calls[0].body;
    assert.equal(to, 'sachin@uprankdigital.com');
    assert.match(subject, /^Chat: Do you build Shopify stores\?/);
    assert.match(text, /VISITOR:/);
    assert.match(text, /ASSISTANT:/);
    assert.ok(!text.includes('asha@example.com'), 'visitor email must be removed');
    assert.ok(!text.includes('98765 43210'), 'visitor phone must be removed');
    assert.match(text, /\[email removed\]/);
    assert.match(text, /\[phone removed\]/);
    // The agency's own number stays, so the reply can still be reviewed as it was sent.
    assert.match(text, /\+91 93711 16165/);
    assert.match(text, /Requested a consultation: No/);
  });
});

test('a sendBeacon body that arrives as a string or a Buffer is still read', async () => {
  for (const body of [JSON.stringify({ messages: transcript }), Buffer.from(JSON.stringify({ messages: transcript }))]) {
    await withResend(async (calls) => {
      const res = mockResponse();
      await handler(post(body), res);
      assert.equal(res.recorded.statusCode, 200);
      assert.equal(calls.length, 1);
    });
  }
});

test('a conversation the visitor never spoke in is not sent', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler(post({ messages: [transcript[0]] }), res);
    assert.equal(res.recorded.statusCode, 400);
    assert.equal(calls.length, 0);
  });
});

test('one address cannot flood the inbox', async () => {
  await withResend(async (calls) => {
    const statuses = [];
    for (let i = 0; i < 8; i++) {
      const res = mockResponse();
      await handler(post({ messages: transcript }, '198.51.100.9'), res);
      statuses.push(res.recorded.statusCode);
    }
    assert.equal(calls.length, 5);
    assert.ok(statuses.slice(5).every((status) => status === 429));
  });
});

test('logging can be switched off without a deploy of the widget', async () => {
  process.env.CHAT_LOG_DISABLED = 'true';
  try {
    await withResend(async (calls) => {
      const res = mockResponse();
      await handler(post({ messages: transcript }), res);
      assert.equal(res.recorded.statusCode, 204);
      assert.equal(calls.length, 0);
    });
  } finally {
    delete process.env.CHAT_LOG_DISABLED;
  }
});

test('a missing key drops the transcript without contacting Resend', async () => {
  await withResend(
    async (calls) => {
      const res = mockResponse();
      await handler(post({ messages: transcript }), res);
      assert.equal(res.recorded.statusCode, 503);
      assert.equal(calls.length, 0);
    },
    { apiKey: null }
  );
});

test('only POST is allowed', async () => {
  const res = mockResponse();
  await handler({ method: 'GET', headers: {} }, res);
  assert.equal(res.recorded.statusCode, 405);
});

test('redaction leaves ordinary numbers alone', () => {
  assert.equal(redactContactDetails('We spend 300000 a month on 3 brands'), 'We spend 300000 a month on 3 brands');
  assert.equal(redactContactDetails('call +91-98765-43210'), 'call [phone removed]');
  assert.equal(redactContactDetails('ceo@acme.co.in'), '[email removed]');
});
