import test from 'node:test';
import assert from 'node:assert/strict';
import handler, { __resetLeadLimits } from '../api/submit-lead.js';

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
  // Every test posts from the same (missing) address, so the rate limit starts clean.
  __resetLeadLimits();

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

test('a lead from the assistant carries company, role and source', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler(
      {
        method: 'POST',
        body: { ...validLead, company: 'Kulkarni Logistics', job_title: 'Head of Marketing', lead_source: 'assistant' }
      },
      res
    );

    assert.equal(res.recorded.statusCode, 200);
    const sent = calls[0].body;
    assert.equal(sent.subject, 'New website inquiry from Asha Kulkarni, Kulkarni Logistics');
    assert.match(sent.text, /Captured by: Corporate solutions assistant \(chat\)/);
    assert.match(sent.text, /Company: Kulkarni Logistics/);
    assert.match(sent.text, /Role: Head of Marketing/);
  });
});

test('an unknown lead source is labelled as the enquiry form', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { ...validLead, lead_source: '<b>spoofed</b>' } }, res);

    assert.match(calls[0].body.text, /Captured by: Website enquiry form/);
    assert.doesNotMatch(calls[0].body.text, /spoofed/);
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

test('the lead email says which campaign brought the visitor', async () => {
  await withResend(async (calls) => {
    const res = mockResponse();
    const touch = {
      utm_source: 'google',
      utm_medium: 'cpc',
      utm_campaign: 'pune-web',
      gclid: 'abc123',
      landing_page: 'https://uprankdigital.com/?utm_source=google',
      injected: 'ignored'
    };
    await handler({ method: 'POST', body: { ...validLead, attribution: { first: touch, last: touch } } }, res);

    assert.equal(res.recorded.statusCode, 200);
    const text = calls[0].body.text;
    assert.match(text, /Lead source:/);
    assert.match(text, /Campaign: pune-web/);
    assert.match(text, /Google Ads click ID: abc123/);
    assert.doesNotMatch(text, /injected|ignored/);
  });
});

test('a lead without attribution is labelled direct', async () => {
  await withResend(async (calls) => {
    await handler({ method: 'POST', body: validLead }, mockResponse());
    assert.match(calls[0].body.text, /Direct \/ unknown/);
  });
});

// Swaps in HubSpot form settings next to the fake Resend; `failing` picks which hosts error.
const withHubSpot = async (run, failing = []) => {
  process.env.HUBSPOT_PORTAL_ID = '123';
  process.env.HUBSPOT_FORM_GUID = 'form-guid';
  try {
    return await withResend(async (calls) => {
      globalThis.fetch = async (url, options) => {
        calls.push({ url, body: JSON.parse(options.body) });
        const ok = !failing.some((host) => url.includes(host));
        return { ok, status: ok ? 200 : 500, text: async () => 'stub error' };
      };
      return run(calls);
    });
  } finally {
    delete process.env.HUBSPOT_PORTAL_ID;
    delete process.env.HUBSPOT_FORM_GUID;
  }
};

test('a lead goes to HubSpot as well as the inbox, with its source in the message', async () => {
  await withHubSpot(async (calls) => {
    const res = mockResponse();
    await handler({ method: 'POST', body: { ...validLead, company: 'Kulkarni Logistics' } }, res);

    assert.equal(res.recorded.statusCode, 200);
    const hubspot = calls.find((call) => call.url.includes('api.hsforms.com'));
    assert.match(hubspot.url, /\/submit\/123\/form-guid$/);
    const fields = Object.fromEntries(hubspot.body.fields.map((field) => [field.name, field.value]));
    assert.equal(fields.email, 'asha@example.com');
    assert.equal(fields.firstname, 'Asha');
    assert.equal(fields.lastname, 'Kulkarni');
    assert.equal(fields.company, 'Kulkarni Logistics');
    assert.match(fields.message, /We need a new site\.[\s\S]*Direct \/ unknown/);
  });
});

test('HubSpot keeps the lead when the email fails, and both failing is an error', async () => {
  await withHubSpot(async () => {
    const res = mockResponse();
    await handler({ method: 'POST', body: validLead }, res);
    assert.equal(res.recorded.statusCode, 200);
  }, ['api.resend.com']);

  await withHubSpot(async () => {
    const res = mockResponse();
    await handler({ method: 'POST', body: validLead }, res);
    assert.equal(res.recorded.statusCode, 502);
  }, ['api.resend.com', 'api.hsforms.com']);
});

test('the chosen service reaches the email, and a made-up one is dropped', async () => {
  await withResend(async (calls) => {
    await handler({ method: 'POST', body: { ...validLead, service: 'Website Development' } }, mockResponse());
    assert.match(calls[0].body.text, /Interested in: Website Development/);

    await handler({ method: 'POST', body: { ...validLead, service: 'Free iPhone' } }, mockResponse());
    assert.doesNotMatch(calls[1].body.text, /Interested in/);
  });
});

test('HubSpot gets the service as its own field and Indian mobiles with +91', async () => {
  const { withIndianCountryCode } = await import('../api/submit-lead.js');
  assert.equal(withIndianCountryCode('98765 43210'), '+91 9876543210');
  assert.equal(withIndianCountryCode('+91 98765 43210'), '+91 98765 43210');
  assert.equal(withIndianCountryCode('+1 415 555 0100'), '+1 415 555 0100');
  assert.equal(withIndianCountryCode('020 2612 3456'), '020 2612 3456');

  await withHubSpot(async (calls) => {
    await handler(
      { method: 'POST', body: { ...validLead, phone: '9876543210', service: 'Performance Marketing' } },
      mockResponse()
    );
    const hubspot = calls.find((call) => call.url.includes('api.hsforms.com'));
    const fields = Object.fromEntries(hubspot.body.fields.map((field) => [field.name, field.value]));
    assert.equal(hubspot.body.context.ipAddress, undefined, 'no address known, none sent');
    assert.equal(fields.service_interest, 'Performance Marketing');
    assert.equal(fields.phone, '+91 9876543210');
  });
});

test("HubSpot is told the visitor's IP so it sets their location, and the email is not", async () => {
  await withHubSpot(async (calls) => {
    await handler(
      { method: 'POST', headers: { 'x-forwarded-for': '49.36.10.20, 10.0.0.1' }, body: validLead },
      mockResponse()
    );
    const hubspot = calls.find((call) => call.url.includes('api.hsforms.com'));
    assert.equal(hubspot.body.context.ipAddress, '49.36.10.20');
    const email = calls.find((call) => call.url.includes('api.resend.com'));
    assert.doesNotMatch(email.body.text, /49\.36\.10\.20/);
  });
});

test('one address sending a flood of leads is cut off', async () => {
  await withResend(async (calls) => {
    const statuses = [];
    for (let i = 0; i < 7; i += 1) {
      const res = mockResponse();
      await handler({ method: 'POST', headers: { 'x-forwarded-for': '198.51.100.9' }, body: validLead }, res);
      statuses.push(res.recorded.statusCode);
    }
    assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429, 429]);
    assert.equal(calls.length, 5);
  });
});
