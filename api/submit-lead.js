// The contact form's backend: it takes the posted form and emails it, the same shape
// of thing a PHP `mail()` script did. There is no database — a lead is an email in
// sachin@uprankdigital.com and nothing else, so nothing has to be kept alive or
// backed up.
//
// Vercel environment variables (Settings -> Environment Variables), all server-side:
//   RESEND_API_KEY      required; without it the endpoint reports itself unconfigured
//   CONTACT_RECIPIENT   optional; defaults to sachin@uprankdigital.com
//   RESEND_FROM_EMAIL   optional; must be an address on a domain verified in Resend

import { sanitizeTouch } from '../src/utils/attribution.js';
import { CONTACT_EMAIL } from '../src/utils/contactChannels.js';

const DEFAULT_RECIPIENT = CONTACT_EMAIL;
// Resend's shared sender, which needs no DNS and works the moment a key exists. It can
// only deliver to the address that owns the Resend account, so once uprankdigital.com is
// verified in Resend, set RESEND_FROM_EMAIL to 'Up Rank Digital <leads@uprankdigital.com>'
// and the notification starts coming from our own domain.
const DEFAULT_FROM = 'Up Rank Digital <onboarding@resend.dev>';

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

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Loud on the server, vague to the visitor: a missing key is our problem, and the
    // visitor just needs a way to reach us that still works.
    console.error('[submit-lead] RESEND_API_KEY is not set, so the inquiry was not emailed.');
    return response.status(503).json({
      success: false,
      message: 'Our contact form is temporarily unavailable. Please WhatsApp or email us directly.'
    });
  }

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
      return response.status(502).json({
        success: false,
        message: 'We could not send your inquiry right now. Please WhatsApp or email us directly.'
      });
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('[submit-lead] Request to Resend failed', error);
    return response.status(502).json({
      success: false,
      message: 'We could not send your inquiry right now. Please WhatsApp or email us directly.'
    });
  }
}
