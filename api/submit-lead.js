// The contact form's backend: it takes the posted form and delivers it to two places at
// once, an email (Resend) and the HubSpot CRM. Either one arriving counts as success, so
// a Resend outage or a spent email quota no longer loses the lead.
//
// Vercel environment variables (Settings -> Environment Variables), all server-side.
// At least one of the two destinations must be configured:
//   RESEND_API_KEY      the email notification
//   CONTACT_RECIPIENT   optional; defaults to CONTACT.email in src/data/siteContent.js
//   RESEND_FROM_EMAIL   optional; must be an address on a domain verified in Resend
//   HUBSPOT_PORTAL_ID   HubSpot account ID (Settings -> Account details)
//   HUBSPOT_FORM_GUID   ID of a HubSpot form that has the fields email, firstname,
//                       lastname, phone, company, jobtitle and message
//   LEAD_RATE_LIMIT     optional; enquiries one address may send per 10 minutes (default 5)

import { sanitizeTouch } from '../src/utils/attribution.js';
import { CONTACT_EMAIL } from '../src/utils/contactChannels.js';
import { createRateLimiter } from './_rateLimit.js';
import { SERVICES } from '../src/data/siteContent.js';

// The form's service picker. Anything else posted is dropped, so the email and CRM only
// ever show one of the real service lines.
const SERVICE_CHOICES = new Set([...SERVICES.map((service) => service.title), 'Not sure yet']);

const DEFAULT_RECIPIENT = CONTACT_EMAIL;
// Resend's shared sender, which needs no DNS and works the moment a key exists. It can
// only deliver to the address that owns the Resend account, so once uprankdigital.com is
// verified in Resend, set RESEND_FROM_EMAIL to 'Up Rank Digital <leads@uprankdigital.com>'
// and the notification starts coming from our own domain.
const DEFAULT_FROM = 'Up Rank Digital <onboarding@resend.dev>';

// Every accepted call is an email and a CRM record, so a script in a loop could bury real
// leads and spend the Resend quota. A real visitor sends one or two.
const isRateLimited = createRateLimiter({
  windowMs: 10 * 60_000,
  max: Number(process.env.LEAD_RATE_LIMIT) || 5
});

export const __resetLeadLimits = () => isRateLimited.reset();

const UNAVAILABLE = 'We could not send your inquiry right now. Please WhatsApp or email us directly.';

const cleanText = (value, maxLength = 500) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const normalizeUrl = (value) => {
  const raw = cleanText(value, 300);
  if (!raw) return '';

  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString().slice(0, 300) : '';
  } catch {
    return '';
  }
};

const TOUCH_LABELS = [
  ['utm_source', 'Source'],
  ['utm_medium', 'Medium'],
  ['utm_campaign', 'Campaign'],
  ['utm_term', 'Keyword'],
  ['utm_content', 'Ad content'],
  ['gclid', 'Google Ads click ID'],
  ['gbraid', 'Google Ads gbraid'],
  ['wbraid', 'Google Ads wbraid'],
  ['fbclid', 'Meta click ID'],
  ['li_fat_id', 'LinkedIn click ID'],
  ['msclkid', 'Microsoft Ads click ID'],
  ['referrer', 'Came from'],
  ['landing_page', 'Landed on'],
  ['captured_at', 'First seen']
];

const describeTouch = (heading, touch) =>
  touch
    ? [heading, ...TOUCH_LABELS.filter(([key]) => touch[key]).map(([key, label]) => `  ${label}: ${touch[key]}`)]
    : [];

// Most leads are direct visits; say so instead of leaving the section out, so a blank
// is not mistaken for broken tracking.
const buildAttributionText = ({ first, last }) => {
  if (!first && !last) return ['Lead source: Direct / unknown (no campaign tag or referring site)'];
  const sameVisit = first && last && JSON.stringify(first) === JSON.stringify(last);
  return [
    ...describeTouch(sameVisit ? 'Lead source:' : 'First visit source:', first),
    ...(sameVisit ? [] : describeTouch('Most recent visit source:', last))
  ];
};

// Where on the site the lead was captured. Anything else posted here is ignored, so the
// subject line cannot be steered by whoever is calling the endpoint.
const LEAD_SOURCES = {
  contact_form: 'Website enquiry form',
  assistant: 'Corporate solutions assistant (chat)'
};

const buildEmailText = (lead) =>
  [
    'New inquiry from the Up Rank Digital website',
    `Captured by: ${LEAD_SOURCES[lead.leadSource]}`,
    '',
    `Name: ${lead.name}`,
    ...(lead.jobTitle ? [`Role: ${lead.jobTitle}`] : []),
    ...(lead.service ? [`Interested in: ${lead.service}`] : []),
    ...(lead.company ? [`Company: ${lead.company}`] : []),
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    '',
    'Message:',
    lead.message || 'Not provided',
    '',
    ...buildAttributionText(lead.attribution),
    '',
    `Submitted from: ${lead.pageUrl || 'Not provided'}`,
    `Browser: ${lead.userAgent || 'Not provided'}`
  ].join('\n');

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Checked before the body is read, so a flood costs as little as possible.
  if (isRateLimited(request)) {
    response.setHeader('Retry-After', '600');
    return response.status(429).json({
      success: false,
      message: 'Too many enquiries from this connection. Please WhatsApp or email us directly.'
    });
  }

  // Vercel parses an application/json body for us, but a client that sends the type
  // wrong hands over a string instead, and that is worth surviving.
  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  if (!body || typeof body !== 'object') {
    return response.status(400).json({ success: false, message: 'Invalid form payload.' });
  }

  // The honeypot field is hidden from people and irresistible to bots. The form also
  // checks it in the browser; this catches anything posting here directly. Answer 200
  // so the bot has no signal that it was caught.
  if (cleanText(body.website_confirmation, 100)) {
    return response.status(200).json({ success: true });
  }

  const lead = {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 254).toLowerCase(),
    phone: cleanText(body.phone, 40),
    company: cleanText(body.company, 160),
    jobTitle: cleanText(body.job_title, 120),
    service: SERVICE_CHOICES.has(cleanText(body.service, 80)) ? cleanText(body.service, 80) : '',
    leadSource: LEAD_SOURCES[body.lead_source] ? body.lead_source : 'contact_form',
    message: cleanText(body.message, 3000),
    pageUrl: normalizeUrl(body.page_url),
    userAgent: cleanText(body.user_agent, 500),
    attribution: {
      first: sanitizeTouch(body.attribution?.first),
      last: sanitizeTouch(body.attribution?.last)
    }
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.phone) {
    return response
      .status(422)
      .json({ success: false, message: 'Please enter a valid name, email, and phone number.' });
  }

  const results = await Promise.all([sendEmail(lead), sendToHubSpot(lead)]);
  const configured = results.filter((result) => result !== null);

  if (!configured.length) {
    // Loud on the server, vague to the visitor: missing keys are our problem, and the
    // visitor just needs a way to reach us that still works.
    console.error('[submit-lead] Neither RESEND_API_KEY nor HUBSPOT_PORTAL_ID/HUBSPOT_FORM_GUID is set, so the inquiry went nowhere.');
    return response.status(503).json({
      success: false,
      message: 'Our contact form is temporarily unavailable. Please WhatsApp or email us directly.'
    });
  }

  if (!configured.includes(true)) {
    return response.status(502).json({ success: false, message: UNAVAILABLE });
  }

  return response.status(200).json({ success: true });
}

// Each sender returns null when it is not configured, true when the lead arrived, false
// when it failed. Failures are logged, never thrown, so one destination failing cannot
// stop the other.
const sendEmail = async (lead) => {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: process.env.CONTACT_RECIPIENT || DEFAULT_RECIPIENT,
        subject: lead.company
          ? `New website inquiry from ${lead.name}, ${lead.company}`
          : `New website inquiry from ${lead.name}`,
        text: buildEmailText(lead),
        // Replying to the notification replies to the visitor.
        reply_to: lead.email
      })
    });

    if (!result.ok) {
      const detail = await result.text().catch(() => 'unknown error');
      console.error(`[submit-lead] Resend returned ${result.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[submit-lead] Request to Resend failed', error);
    return false;
  }
};

// HubSpot's form submission API: no key needed, the lead lands as a contact with the
// form submission on its timeline. The message carries the lead source too, so the CRM
// record shows which campaign brought the visitor.
export const buildHubSpotSubmission = (lead) => {
  const [firstname, ...rest] = lead.name.split(' ');
  const fields = {
    email: lead.email,
    firstname,
    lastname: rest.join(' '),
    phone: lead.phone,
    company: lead.company,
    jobtitle: lead.jobTitle,
    message: [lead.message, lead.service && `Interested in: ${lead.service}`, `Captured by: ${LEAD_SOURCES[lead.leadSource]}`, ...buildAttributionText(lead.attribution)]
      .filter(Boolean)
      .join('\n')
  };

  return {
    fields: Object.entries(fields)
      .filter(([, value]) => value)
      .map(([name, value]) => ({ objectTypeId: '0-1', name, value })),
    context: {
      ...(lead.pageUrl ? { pageUri: lead.pageUrl } : {}),
      pageName: LEAD_SOURCES[lead.leadSource]
    }
  };
};

const sendToHubSpot = async (lead) => {
  const portalId = process.env.HUBSPOT_PORTAL_ID;
  const formGuid = process.env.HUBSPOT_FORM_GUID;
  if (!portalId || !formGuid) return null;

  try {
    const result = await fetch(
      `https://api.hsforms.com/submissions/v3/integration/submit/${encodeURIComponent(portalId)}/${encodeURIComponent(formGuid)}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildHubSpotSubmission(lead))
      }
    );

    if (!result.ok) {
      const detail = await result.text().catch(() => 'unknown error');
      console.error(`[submit-lead] HubSpot returned ${result.status}: ${detail}`);
      return false;
    }
    return true;
  } catch (error) {
    console.error('[submit-lead] Request to HubSpot failed', error);
    return false;
  }
};
