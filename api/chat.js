// The chat assistant's backend: it forwards the conversation to Groq and streams the
// reply straight through to the browser in Groq's own OpenAI-style SSE frames, which
// is exactly what WebsiteAssistant.jsx already parses.
//
// The key never leaves the server, and when anything here fails the endpoint still
// answers 200 with a single `urd_fallback` frame. The widget treats that frame as a
// signal to answer from its local service playbook instead, so a dead key or a
// decommissioned model degrades to the keyword replies rather than to an error.
//
// Vercel environment variables (Settings -> Environment Variables), server-side:
//   GROQ_API_KEY  required; without it every reply comes from the local playbook
//   GROQ_MODEL    optional; overrides the primary model below

import { FALLBACK_REPLY, SERVICE_PLAYBOOK } from '../src/utils/servicePlaybook.js';
import { trimConversation } from '../src/utils/conversationWindow.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Tried in order. Groq retires model ids from time to time, and a retired id comes back
// as a 400 or 404 rather than a hang, so the smaller siblings keep the assistant talking
// until this list is updated. Checked against the models this key can actually reach.
const MODELS = [
  process.env.GROQ_MODEL,
  'openai/gpt-oss-120b',
  'openai/gpt-oss-20b',
  'qwen/qwen3.8-27b'
].filter(Boolean);

const MAX_MESSAGE_LENGTH = 2000;

// A model that has accepted the request but gone quiet costs the visitor the whole wait,
// because nothing streams until the headers come back. Cutting the attempt off lets the
// next model in MODELS answer instead of leaving the typing dots running.
const upstreamTimeoutMs = () => Number(process.env.CHAT_UPSTREAM_TIMEOUT_MS) || 8000;

// What one visitor waits before the local playbook answers instead, counted across every
// model attempt rather than each one. Per-attempt timeouts alone multiply by the length
// of MODELS, so the wait a visitor actually experiences is not a number anyone chose.
const totalBudgetMs = () => Number(process.env.CHAT_TOTAL_BUDGET_MS) || 12000;

// This endpoint is public and every call spends Groq tokens, so one script in a loop can
// drain the quota and leave real visitors on the local playbook. Vercel keeps a warm
// instance between requests, so a counter in module scope catches that. It is per
// instance rather than global: a cost guard, not a security boundary.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = Number(process.env.CHAT_RATE_LIMIT) || 15;
const recentHits = new Map();

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

  // A long-lived instance would otherwise hold every address it has ever seen.
  if (recentHits.size > 500) {
    for (const [seen, times] of recentHits) {
      if (!times.some((at) => at > cutoff)) recentHits.delete(seen);
    }
  }

  return hits.length > RATE_LIMIT_MAX;
};

// Tests run many requests through one process from the same client key, so they need a
// way back to a clean slate.
export const __resetRateLimits = () => recentHits.clear();

// Whether this visitor has already been pointed at the form earlier in the conversation.
// A standing rule about "mentioning it once" is advice the model weighs against everything
// else in the prompt and drops more often than not; a line that only appears when it
// applies is an instruction about the conversation in front of it.
const alreadySentToForm = (messages = []) =>
  messages.some((message) => message.role === 'assistant' && /enquiry form/i.test(message.content));

const buildSystemPrompt = (messages = []) => {
  const services = SERVICE_PLAYBOOK.map(
    (service) => `- ${service.title}: ${service.fit} Common scope: ${service.bullets.join(', ')}.`
  ).join('\n');

  const formRule = alreadySentToForm(messages)
    ? [
        '- You already pointed this visitor to the enquiry form earlier in this conversation, so most of your replies from here should not mention it at all. Answer the question they asked in one or two sentences and stop there.',
        '- Decide by their latest message alone. If it asks what happens next, how to start, what you need from them, or says they are ready to go ahead, say "enquiry form" in those exact words and tell them the team replies within one business day. If it is any other kind of question, do not mention the form, the enquiry form or getting in touch.'
      ].join('\n')
    : '- Send the visitor to the enquiry form once they have a direction or ask what happens next. When you do, say the words "enquiry form" exactly, because that is what makes the page offer them the button. The form asks for name, email, phone and a line about the goal, and the team replies within one business day.';

  return [
    "You are Up Rank Digital's website assistant. Up Rank Digital is a digital marketing and web agency led by Sachin, reachable on WhatsApp at +91 93711 16165 and by email at sachin@uprankdigital.com.",
    '',
    'These are the only five service lines you may offer:',
    services,
    '',
    'Rules:',
    '- Keep replies short: two or three sentences, or a few short bullets. This is a chat panel, not a page.',
    '- Stay inside the five service lines above. If something falls outside them, say so and hand off to the team.',
    '- Describe those lines in the words above and name no other deliverable: no payment gateways, no CRM, ERP or software integrations, no mobile apps, no hosting or domains. This limits what you promise, never who you welcome. A visitor who wants one of those on a website or a campaign is still a visitor for Website Development or Performance Marketing: answer with the line that fits and let the team confirm what the scope can cover. Only call something outside the five lines when the work itself is, like building an app or filing accounts.',
    '- Never quote a price, a rate or a timeline. Pricing depends on scope, so ask for the scope and offer to have the team advise.',
    '- Never invent clients, case studies, results, numbers or guarantees.',
    formRule,
    '- When the visitor asks what you need from them, what to send, or what it takes to begin, the whole answer is the enquiry form: name, email, phone and a line about the goal. Do not list budget, timeline, audience, ad accounts, logins, links or anything else as something you need. They are not sending you those in a chat panel, and a visitor who answers a shopping list here has handed it to nobody.',
    '- Never ask the visitor to type a business name, link, budget or phone number into this chat.',
    '- Point to WhatsApp or email whenever the visitor wants a person.',
    '- Write the phone number as +91 93711 16165, with ordinary spaces and no other characters between the digits.',
    '- Write plain sentences. No headings, no emoji, no markdown tables.',
    '',
    'Reply in the language the visitor wrote in, including Hindi, Marathi and Hinglish. Every rule above applies in every language, and the words "enquiry form" stay in English even when the rest of the reply is not.'
  ].join('\n');
};

const sanitizeMessages = (value) => {
  if (!Array.isArray(value)) return null;

  const usable = value
    .filter(
      (message) =>
        message &&
        typeof message === 'object' &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim()
    )
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH)
    }));

  // Trimmed again here because the payload is whatever was posted, not whatever the
  // widget meant to post.
  const messages = trimConversation(usable);

  // A conversation the model can answer always ends with something the visitor said.
  if (!messages.length || messages[messages.length - 1].role !== 'user') return null;

  return messages;
};

const openStream = (response) => {
  response.statusCode = 200;
  response.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  response.setHeader('Cache-Control', 'no-cache, no-transform');
  response.setHeader('Connection', 'keep-alive');
  // Vercel's edge cache buffers a response it thinks it can hold on to; this keeps the
  // frames flowing as they arrive.
  response.setHeader('X-Accel-Buffering', 'no');
};

const writeFallback = (response) => {
  response.write(
    `data: ${JSON.stringify({
      urd_fallback: true,
      choices: [{ delta: { content: FALLBACK_REPLY } }]
    })}\n\n`
  );
  response.write('data: [DONE]\n\n');
  response.end();
};

const requestCompletion = async (messages, model, apiKey, deadline) => {
  const controller = new AbortController();
  // Two bounds, whichever comes first: this attempt's own patience, and what is left of
  // the budget for the whole request. Without the second one a visitor behind three
  // stalling models waits three timeouts, and the number they experience is not the one
  // configured anywhere.
  const remaining = Math.max(0, deadline - Date.now());
  const timer = setTimeout(() => controller.abort(), Math.min(upstreamTimeoutMs(), remaining));

  try {
    return await fetch(GROQ_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        stream: true,
        temperature: 0.4,
        // These are reasoning models, and the thinking is billed against the same token
        // budget as the answer. Keep the thinking short, keep it out of the stream so it
        // never reaches the browser, and leave enough headroom that a reply finishes.
        reasoning_effort: 'low',
        reasoning_format: 'hidden',
        max_tokens: 700,
        messages: [{ role: 'system', content: buildSystemPrompt(messages) }, ...messages]
      })
    });
  } finally {
    clearTimeout(timer);
  }
};

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, message: 'Method not allowed.' });
  }

  // Checked before the body is read, so a flood costs as little as possible. The widget
  // treats a non-stream answer as a dead endpoint and replies from its local playbook,
  // which is a better thing for a real visitor to hit than a spent quota.
  if (isRateLimited(clientKey(request))) {
    response.setHeader('Retry-After', String(Math.ceil(RATE_LIMIT_WINDOW_MS / 1000)));
    return response
      .status(429)
      .json({ success: false, message: 'Too many messages. Please wait a moment and try again.' });
  }

  let body = request.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch {
      body = null;
    }
  }

  const messages = sanitizeMessages(body?.messages);
  if (!messages) {
    return response.status(400).json({ success: false, message: 'Invalid chat payload.' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.error('[chat] GROQ_API_KEY is not set, so the local playbook answered instead.');
    openStream(response);
    return writeFallback(response);
  }

  // One number for the visitor's worst case, however many models are in the list and
  // however many of them stall. Past it the local playbook answers, which beats a panel
  // that has been thinking for half a minute.
  const deadline = Date.now() + totalBudgetMs();

  let upstream = null;
  for (const model of MODELS) {
    if (Date.now() >= deadline) {
      console.error(`[chat] Out of time after ${totalBudgetMs()}ms, answering from the local playbook.`);
      break;
    }

    try {
      const attempt = await requestCompletion(messages, model, apiKey, deadline);
      if (attempt.ok && attempt.body) {
        upstream = attempt;
        break;
      }

      const detail = await attempt.text().catch(() => 'unknown error');
      console.error(`[chat] Groq returned ${attempt.status} for ${model}: ${detail}`);

      // 401, 402 and 429 are about the account, not the model id, so trying the next
      // model would only burn another round trip.
      if ([401, 402, 403, 429].includes(attempt.status)) break;
    } catch (error) {
      if (error?.name === 'AbortError') {
        console.error(`[chat] ${model} did not answer within ${upstreamTimeoutMs()}ms, trying the next model.`);
      } else {
        console.error(`[chat] Request to Groq failed for ${model}`, error);
      }
    }
  }

  openStream(response);

  if (!upstream) return writeFallback(response);

  try {
    const reader = upstream.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      response.write(value);
    }
    response.end();
  } catch (error) {
    // The stream died partway. Whatever reached the visitor stays on screen; the
    // fallback frame tells the widget to swap in a reply it can stand behind.
    console.error('[chat] Streaming from Groq was interrupted', error);
    writeFallback(response);
  }
}
