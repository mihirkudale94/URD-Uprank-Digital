import test from 'node:test';
import assert from 'node:assert/strict';
import handler from '../api/submit-lead.js';

const validLead = {
  name: 'Asha Kulkarni',
  email: 'Asha@Example.com',
  phone: '+91 98765 43210',
  message: 'We need a new site.',
  page_url: 'https://uprankdigital.com/',
  user_agent: 'Mozilla/5.0'
};

// Minimal stand-in for Vercel's response object: it only has to record what the
// handler tried to send back.
const mockResponse = () => {
  const recorded = { statusCode: null, body: null, headers: {} };
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
    }
  };
};

// Swaps in a fake Resend and restores the real fetch and env afterwards.
const withResend = async (run, { apiKey = 'test-key', ok = true, status = 200 } = {}) => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.RESEND_API_KEY;
  const calls = [];

  if (apiKey === null) delete process.env.RESEND_API_KEY;
  else process.env.RESEND_API_KEY = apiKey;

  globalThis.fetch = async (url, options) => {
    calls.push({ url, options, body: JSON.parse(options.body) });
    return { ok, status, text: async () => 'stub error' };
  };

  try {
    return await run(calls);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = originalKey;
  }
};

test('a valid lead is emailed and acknowledged', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: validLead }, res);

    assert.equal(res.recorded.statusCode, 200);
    assert.deepEqual(res.recorded.body, { success: true });
    assert.equal(calls.length, 1, 'expected exactly one call to Resend');

    const sent = calls[0].body;
    assert.equal(calls[0].url, 'https://api.resend.com/emails');
    assert.equal(sent.subject, 'New website inquiry from Asha Kulkarni');
    // Replying to the notification must reach the visitor, lowercased on the way in.
    assert.equal(sent.reply_to, 'asha@example.com');
    assert.match(sent.text, /Phone: \+91 98765 43210/);
    assert.match(sent.text, /We need a new site\./);
    assert.match(sent.text, /Submitted from: https:\/\/uprankdigital\.com\//);
    // The inbox the inquiry has to land in.
    assert.equal(sent.to, 'sachin@uprankdigital.com');
  });
});

test('HTML in a field is stripped before it reaches the inbox', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler(
      { method: 'POST', body: { ...validLead, message: 'Hi <script>alert(1)</script> there' } },
      res
    );

    assert.equal(res.recorded.statusCode, 200);
    assert.doesNotMatch(calls[0].body.text, /<script>/);
    assert.match(calls[0].body.text, /Hi alert\(1\) there/);
  });
});

test('a filled honeypot is accepted silently and sends nothing', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { ...validLead, website_confirmation: 'bot' } }, res);

    // The bot must not learn that it was caught.
    assert.equal(res.recorded.statusCode, 200);
    assert.deepEqual(res.recorded.body, { success: true });
    assert.equal(calls.length, 0, 'a honeypot hit must not send an email');
  });
});

test('an incomplete lead is rejected without contacting Resend', async () => {
  for (const [field, value] of [
    ['name', '   '],
    ['email', 'not-an-email'],
    ['phone', '']
  ]) {
    await withResend(async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: { ...validLead, [field]: value } }, res);

      assert.equal(res.recorded.statusCode, 422, `${field} should be rejected`);
      assert.equal(res.recorded.body.success, false);
      assert.equal(calls.length, 0);
    });
  }
});

test('a non-POST request is refused', async () => {
  await withResend(async () => {
    const res = mockResponse();
    await handler({ method: 'GET' }, res);

    assert.equal(res.recorded.statusCode, 405);
    assert.equal(res.recorded.headers.Allow, 'POST');
  });
});

test('an unparseable body is rejected', async () => {
  await withResend(async () => {
    const res = mockResponse();
    await handler({ method: 'POST', body: 'not json' }, res);

    assert.equal(res.recorded.statusCode, 400);
  });
});

test('a string body of valid JSON is still accepted', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: JSON.stringify(validLead) }, res);

    assert.equal(res.recorded.statusCode, 200);
    assert.equal(calls.length, 1);
  });
});

test('a missing API key reports unavailable rather than pretending to succeed', async () => {
  await withResend(
    async (calls) => {
      const res = mockResponse();
      await handler({ method: 'POST', body: validLead }, res);

      assert.equal(res.recorded.statusCode, 503);
      assert.equal(res.recorded.body.success, false);
      // The visitor is pointed at a channel that does work.
      assert.match(res.recorded.body.message, /WhatsApp/);
      assert.equal(calls.length, 0);
    },
    { apiKey: null }
  );
});

test('a Resend failure is surfaced as a failure', async () => {
  await withResend(
    async () => {
      const res = mockResponse();
      await handler({ method: 'POST', body: validLead }, res);

      assert.equal(res.recorded.statusCode, 502);
      assert.equal(res.recorded.body.success, false);
    },
    { ok: false, status: 422 }
  );
});
