// Chat transcripts for review. When a visitor leaves the page, the assistant widget sends
// the conversation here once, and it arrives in the inbox as an email, the same way an
// enquiry does. There is no database: a transcript is an email and nothing else.
//
// The point is to see what visitors actually ask, so weak or missing answers can be fixed.
// Contact details are not the point, so email addresses and phone numbers the visitor
// typed are removed before anything is sent.
//
// Vercel environment variables (Settings -> Environment Variables), all server-side:
//   RESEND_API_KEY       required; without it transcripts are dropped quietly
//   CHAT_LOG_RECIPIENT   optional; defaults to CONTACT_RECIPIENT, then the contact email
//   CHAT_LOG_DISABLED    optional; set to "true" to stop sending transcripts
//   RESEND_FROM_EMAIL    optional; as for the enquiry form

import { sanitizeTouch } from '../src/utils/attribution.js';
import { CONTACT_EMAIL, WHATSAPP_NUMBER_E164 } from '../src/utils/contactChannels.js';

const DEFAULT_FROM = 'Up Rank Digital <onboarding@resend.dev>';
const MAX_MESSAGES = 40;
const MAX_MESSAGE_LENGTH = 2000;

// The endpoint is public and every accepted call is an email in someone's inbox, so one
// address gets a handful per window. A real visitor sends one per page visit.
const RATE_LIMIT_WINDOW_MS = 10 * 60_000;
const RATE_LIMIT_MAX = Number(process.env.CHAT_LOG_RATE_LIMIT) || 5;
const recentHits = new Map();

export const __resetChatLogLimits = () => recentHits.clear();

const clientKey = (request) => {
  const headers = request.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0];
  return first.trim() || headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown';
};

const isRateLimited = (key, now = Date.now()) => {
  const cutoff = now - RATE_LIMIT_WINDOW_MS;
  const hits = (recentHits.get(key) || []).filter((at) => at > cutoff);
  hits.push(now);
  recentHits.set(key, hits);
  if (recentHits.size > 500) {
    for (const [seen, times] of recentHits) {
      if (!times.some((at) => at > cutoff)) recentHits.delete(seen);
    }
  }
  return hits.length > RATE_LIMIT_MAX;
};

const cleanText = (value, maxLength) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim()
    .slice(0, maxLength);

// Email addresses, and digit runs long enough to be a phone number (ten or more digits,
// allowing spaces, dashes and brackets between them). The agency's own number is left
// alone, because the assistant quotes it and a redacted reply cannot be reviewed.
export const redactContactDetails = (text) =>
  text
    .replace(/[^\s@<>()]+@[^\s@<>()]+\.[a-z]{2,}/gi, '[email removed]')
    .replace(/\+?\d[\d\s().-]{8,}\d/g, (match) =>
      match.replace(/\D/g, '').endsWith(WHATSAPP_NUMBER_E164.slice(-10)) || match.replace(/\D/g, '').length < 10
        ? match
        : '[phone removed]'
    );

export const sanitizeTranscript = (value) => {
  if (!Array.isArray(value)) return null;

  const messages = value
    .filter(
      (message) =>
        message &&
        typeof message === 'object' &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
    )
    .slice(-MAX_MESSAGES)
    .map((message) => ({
      role: message.role,
      content: redactContactDetails(cleanText(message.content, MAX_MESSAGE_LENGTH))
    }));

  // Nothing to learn from a conversation the visitor never spoke in.
  if (!messages.some((message) => message.role === 'user')) return null;
  return messages;
};

const describeSource = (touch) => {
  if (!touch) return 'Direct / unknown';
  const parts = [touch.utm_source, touch.utm_medium, touch.utm_campaign].filter(Boolean);
  if (parts.length) return parts.join(' / ');
  if (touch.gclid || touch.gbraid || touch.wbraid) return 'Google Ads';
  return touch.referrer || 'Direct / unknown';
};

export const buildTranscriptEmail = ({ messages, pageUrl, leadSubmitted, source }) => {
  const firstQuestion = messages.find((message) => message.role === 'user').content;
  const visitorTurns = messages.filter((message) => message.role === 'user').length;
  const subjectLine = firstQuestion.replace(/\s+/g, ' ').slice(0, 70);

  return {
    subject: `Chat: ${subjectLine}${firstQuestion.length > 70 ? '…' : ''}`,
    text: [
      'A visitor chatted with the website assistant.',
      '',
      `Visitor messages: ${visitorTurns}`,
      `Requested a consultation: ${leadSubmitted ? 'Yes (the enquiry arrives as a separate email)' : 'No'}`,
      `Came from: ${source}`,
      `Page: ${pageUrl || 'Not provided'}`,
      '',
      'Email addresses and phone numbers the visitor typed have been removed.',
      '',
      '----- Conversation -----',
      '',
      ...messages.flatMap((message) => [
        `${message.role === 'user' ? 'VISITOR' : 'ASSISTANT'}:`,
        message.content,
        ''
      ])
    ].join('\n')
  };
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false });
  }

  if (process.env.CHAT_LOG_DISABLED === 'true') {
    return response.status(204).end();
  }

  if (isRateLimited(clientKey(request))) {
    return response.status(429).json({ success: false });
  }

  // sendBeacon posts the body as a Blob; depending on the runtime it arrives parsed, as a
  // string, or as a Buffer.
  let body = request.body;
  if (Buffer.isBuffer(body)) body = body.toString('utf8');
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const messages = sanitizeTranscript(body?.messages);
  if (!messages) {
    return response.status(400).json({ success: false });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[chat-log] RESEND_API_KEY is not set, so the transcript was not emailed.');
    return response.status(503).json({ success: false });
  }

  let pageUrl = cleanText(body.page_url, 300);
  if (pageUrl && !/^https?:\/\//i.test(pageUrl)) pageUrl = '';

  const email = buildTranscriptEmail({
    messages,
    pageUrl,
    leadSubmitted: body.lead_submitted === true,
    source: describeSource(sanitizeTouch(body.attribution?.last) || sanitizeTouch(body.attribution?.first))
  });

  try {
    const result = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.RESEND_FROM_EMAIL || DEFAULT_FROM,
        to: process.env.CHAT_LOG_RECIPIENT || process.env.CONTACT_RECIPIENT || CONTACT_EMAIL,
        subject: email.subject,
        text: email.text
      })
    });

    if (!result.ok) {
      const detail = await result.text().catch(() => 'unknown error');
      console.error(`[chat-log] Resend returned ${result.status}: ${detail}`);
      return response.status(502).json({ success: false });
    }

    return response.status(200).json({ success: true });
  } catch (error) {
    console.error('[chat-log] Request to Resend failed', error);
    return response.status(502).json({ success: false });
  }
}
