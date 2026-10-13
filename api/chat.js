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

import { SERVICE_PLAYBOOK } from '../src/utils/servicePlaybook.js';

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

const MAX_MESSAGES = 12;
const MAX_MESSAGE_LENGTH = 2000;

// Said back to the visitor when the model cannot be reached. `isBackendFallback` in the
// widget also matches this wording, so even a client that misses the flag replaces it.
const FALLBACK_REPLY =
  'I am having trouble connecting right now. You can WhatsApp Up Rank Digital at +91 93711 16165 or email sachin@uprankdigital.com, and the team will pick this up directly.';

const buildSystemPrompt = () => {
  const services = SERVICE_PLAYBOOK.map(
    (service) => `- ${service.title}: ${service.fit} Common scope: ${service.bullets.join(', ')}.`
  ).join('\n');

  return [
    "You are Up Rank Digital's website assistant. Up Rank Digital is a digital marketing and web agency led by Sachin, reachable on WhatsApp at +91 93711 16165 and by email at sachin@uprankdigital.com.",
    '',
    'These are the only five service lines you may offer:',
    services,
    '',
    'Rules:',
    '- Keep replies short: two or three sentences, or a few short bullets. This is a chat panel, not a page.',
    '- Stay inside the five service lines above. If something falls outside them, say so and hand off to the team.',
    '- Never quote a price, a rate or a timeline. Pricing depends on scope, so ask for the scope and offer to have the team advise.',
    '- Never invent clients, case studies, results, numbers or guarantees.',
    '- Once the visitor has a direction, ask for business name, website or social link, main goal, timeline and WhatsApp number so the team can route it.',
    '- Point to WhatsApp or email whenever the visitor wants a person.',
    '- Write plain sentences. No headings, no emoji, no markdown tables.'
  ].join('\n');
};

const sanitizeMessages = (value) => {
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
      content: message.content.trim().slice(0, MAX_MESSAGE_LENGTH)
    }));

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

const requestCompletion = (messages, model, apiKey) =>
  fetch(GROQ_ENDPOINT, {
    method: 'POST',
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
      messages: [{ role: 'system', content: buildSystemPrompt() }, ...messages]
    })
  });

export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.setHeader('Allow', 'POST');
    return response.status(405).json({ success: false, message: 'Method not allowed.' });
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

  let upstream = null;
  for (const model of MODELS) {
    try {
      const attempt = await requestCompletion(messages, model, apiKey);
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
      console.error(`[chat] Request to Groq failed for ${model}`, error);
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
