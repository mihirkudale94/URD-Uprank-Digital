// The corporate solutions assistant's backend: it forwards the conversation to Groq, reads
// the whole reply, checks it against the output guardrails in src/utils/chatGuardrails.js,
// and only then sends it to the browser in the OpenAI-style SSE frame WebsiteAssistant.jsx
// already parses. A reply that breaks a rule is rewritten once with a correction note, and
// if the rewrite still breaks one the visitor gets a safe pre-written reply instead.
//
// The key never leaves the server, and when anything here fails the endpoint still
// answers 200 with a single `urd_fallback` frame. The widget treats that frame as a
// signal to answer from its local service playbook instead, so a dead key or a
// decommissioned model degrades to the keyword replies rather than to an error.
//
// Vercel environment variables (Settings -> Environment Variables), server-side:
//   GROQ_API_KEY  required; without it every reply comes from the local playbook
//   GROQ_MODEL    optional; overrides the primary model below

import { CONSULTATION_PHRASE, FALLBACK_REPLY, SERVICE_PLAYBOOK } from '../src/utils/servicePlaybook.js';
import { trimConversation } from '../src/utils/conversationWindow.js';
import { checkReply, describeViolations, safeReplyFor, visitorTextOf } from '../src/utils/chatGuardrails.js';
import { CONTACT_EMAIL, WHATSAPP_NUMBER_DISPLAY } from '../src/utils/contactChannels.js';
import {
  BUSINESS,
  EXPERTISE,
  FOUNDER,
  FULL_ADDRESS,
  PROCESS_STEPS,
  SOCIAL_LINKS,
  WHY_US
} from '../src/data/siteContent.js';
import { clientLogos } from '../src/data/clientLogos.js';

const GROQ_ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';

// Tried in order. Groq retires model ids from time to time, and a retired id comes back
// as a 400 or 404 rather than a hang, so the smaller siblings keep the assistant talking
// until this list is updated. Checked against the models this key can actually reach.
export const MODELS = [
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

// Whether this visitor has already been invited to request a consultation earlier in the
// conversation. A standing rule about "inviting once" is advice the model weighs against
// everything else in the prompt and drops more often than not; a line that only appears
// when it applies is an instruction about the conversation in front of it.

const alreadyInvited = (messages = []) =>
  messages.some(
    (message) => message.role === 'assistant' && message.content.toLowerCase().includes(CONSULTATION_PHRASE)
  );

// Common Hindi and Marathi words as they are typed in Latin letters. Two or more of them in
// one message is Hinglish (or Romanised Marathi) in practice, and plain English almost
// never trips it. A standing "reply in the visitor's language" rule lost to the English
// greeting and prompt every time in testing; a line naming the language of the message in
// front of the model is what it actually follows.
const ROMANISED_HINDI_WORDS = new Set([
  'hai', 'hain', 'kya', 'nahi', 'nahin', 'mujhe', 'mera', 'meri', 'mere', 'aap', 'aapka', 'aapki', 'aapke',
  'kar', 'karo', 'karna', 'karte', 'sakte', 'chahiye', 'toh', 'bhi', 'kitna', 'kitni', 'kaise', 'kyun',
  'baat', 'hum', 'humara', 'humari', 'yeh', 'woh', 'kuch', 'abhi', 'bataya', 'batao', 'mahine', 'paise',
  'aahe', 'kay', 'mala', 'tumhi', 'aamhi', 'pahije', 'kasa', 'kiti', 'nahi', 'aani', 'pan', 'ho'
]);

// Words that are common in Marathi and rare or absent in Hindi. Both are written in
// Devanagari, and a Marathi question answered in Hindi is what the script check alone gave.
const MARATHI_MARKERS = /(आहे|आहेत|आहात|किती|तुमची|तुमचा|तुमचे|तुम्ही|आम्ही|आमचे|आमची|मला|नाही|काय|कसे|कसा|पाहिजे|करता|होईल)/;

export const detectVisitorLanguage = (text = '') => {
  if (/[ऀ-ॿ]/.test(text)) return MARATHI_MARKERS.test(text) ? 'marathi' : 'devanagari';
  const words = text.toLowerCase().match(/[a-z]+/g) || [];
  const hits = words.filter((word) => ROMANISED_HINDI_WORDS.has(word)).length;
  return hits >= 2 ? 'romanised' : 'english';
};

const languageRule = (messages = []) => {
  const latest = [...messages].reverse().find((message) => message.role === 'user')?.content || '';
  const language = detectVisitorLanguage(latest);
  if (language === 'romanised') {
    return `The visitor's latest message is in Hinglish or Romanised Marathi: Hindi or Marathi written in Latin letters. Reply in the same mix, in Latin letters, keeping the same courteous register (use "aap", never "tu" or "tum"). Example: "Ji, yeh Performance Marketing ka kaam hai. Aapka main challenge kya hai: leads kam aa rahe hain ya cost per lead zyada hai?" The words "${CONSULTATION_PHRASE}" stay in English.`;
  }
  if (language === 'marathi') {
    return `The visitor's latest message is in Marathi. Reply in Marathi, in Devanagari, in a courteous register (use "तुम्ही" or "आपण"). Do not reply in Hindi: Marathi and Hindi share a script but are different languages. The words "${CONSULTATION_PHRASE}" stay in English.`;
  }
  if (language === 'devanagari') {
    return `The visitor's latest message is written in Devanagari. Reply in that language (Hindi or Marathi, whichever they used), in Devanagari, in a courteous register. The words "${CONSULTATION_PHRASE}" stay in English.`;
  }
  return 'Reply in the language of the visitor\'s latest message. Visitors may write in English, Hindi, Marathi or Hinglish.';
};

// Everything the assistant may state about the company itself. A model that is asked
// "where is your office" or "how big is your team" without the answer in front of it
// guesses, and in testing it guessed wrong ("we do not have a physical office"). Facts the
// site does publish are listed; questions it does not answer are named, with what to say.
const buildFactSheet = () => {
  const brands = clientLogos.map((logo) => logo.name).filter(Boolean);
  return [
    // The model does not know today's date, so it did the subtraction itself and answered
    // "over six years" in 2026. The server knows the year.
    `- Company: ${BUSINESS.name}, the trading name of ${BUSINESS.legalName}. Founded in ${BUSINESS.foundingYear}, which makes ${new Date().getFullYear() - Number(BUSINESS.foundingYear)} years in business. Give this figure as it is; do not work it out yourself.`,
    `- Founder: ${FOUNDER.name}, ${FOUNDER.jobTitle}. The website describes the agency as founder-led, with 10+ years of experience in websites, campaigns and reporting for Indian businesses.`,
    `- Office: ${FULL_ADDRESS}. This is the only office.`,
    '- Clients served: businesses in Pune, across Maharashtra and across India.',
    `- Languages: ${BUSINESS.languages.join(', ')}.`,
    `- Contact: WhatsApp ${WHATSAPP_NUMBER_DISPLAY}, email ${CONTACT_EMAIL}.`,
    `- Online: LinkedIn ${SOCIAL_LINKS.linkedin}, Facebook ${SOCIAL_LINKS.facebook}.`,
    ...(brands.length
      ? [`- Brands shown on the website's client wall: ${brands.join(', ')}. You may name these as brands the agency has worked with, and nothing about the work, results or numbers for any of them.`]
      : []),
    '- Platforms named on the website: WordPress, Shopify and custom code for websites; Google Ads, Meta Ads and SEO for marketing; GA4, Search Console and call tracking for measurement; Instagram, Facebook and LinkedIn for social media.'
  ].join('\n');
};

// Questions the site does not answer. Named one by one because a general "do not invent"
// rule did not stop the model from supplying a plausible answer to each of them.
const UNKNOWN_TOPICS = [
  'team size or headcount',
  'office hours or walk-in visits',
  'certifications, awards or partner badges (Google Partner, Meta Business Partner or any other)',
  'GST, PAN or registration numbers',
  'other offices or branches',
  'clients or work outside India',
  'contract length, lock-in periods, notice periods, NDAs or refunds',
  'payment terms or pricing models such as retainers, commission or performance-based fees',
  'ratings, reviews or the number of clients or projects',
  'which AI model or company powers this assistant'
];

const buildSystemPrompt = (messages = []) => {
  const services = SERVICE_PLAYBOOK.map(
    (service) => `- ${service.title}: ${service.fit} Common scope: ${service.bullets.join(', ')}.`
  ).join('\n');
  const capabilities = EXPERTISE.map((item) => `- ${item.title}: ${item.text}`).join('\n');
  const reasons = WHY_US.map((item) => `- ${item.title}: ${item.text}`).join('\n');
  const process = PROCESS_STEPS.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`).join('\n');

  const inviteRule = alreadyInvited(messages)
    ? [
        `- You have already invited this visitor to ${CONSULTATION_PHRASE} earlier in this conversation, so most replies from here should not repeat it. Answer the question they asked and, where it helps, ask one qualifying question.`,
        `- Decide by their latest message alone. If it asks about cost, fees, pricing, timing, next steps, a proposal, a meeting or a call, or says they are ready to proceed, invite them to ${CONSULTATION_PHRASE} in those exact words. Otherwise do not mention it.`
      ].join('\n')
    : `- Invite the visitor to ${CONSULTATION_PHRASE}, in those exact words, once you understand their challenge, or straight away if they ask about cost, fees, pricing, timing, next steps, a proposal, a meeting or a call. Those words open a short form inside this chat that asks for name, work email, company, role and phone, and the team replies within one business day. The consultation is the free discovery call described below.`;

  return [
    languageRule(messages),
    '',
    `You are the corporate solutions assistant for ${BUSINESS.name}, a digital marketing and web agency that partners with companies and brands. The founder, ${FOUNDER.name.split(' ')[0]}, leads every engagement and is reachable on WhatsApp at ${WHATSAPP_NUMBER_DISPLAY} and by email at ${CONTACT_EMAIL}.`,
    '',
    'Your role is that of a senior business development consultant: courteous, precise and commercially minded. You help decision makers understand the problem they are facing, show how the agency can address it, qualify the opportunity, and move qualified visitors to a consultation.',
    '',
    'These are the only five service lines you may offer:',
    services,
    '',
    'The capabilities behind them. These are the only deliverables, tools and features you may describe:',
    capabilities,
    '',
    'Why companies choose us. These are the only claims you may make about the agency:',
    reasons,
    '',
    'How an engagement runs:',
    process,
    '',
    'Company facts. These are the only facts you may state about the company:',
    buildFactSheet(),
    '',
    `The website does not answer questions about: ${UNKNOWN_TOPICS.join('; ')}. If asked about any of these, say plainly that you do not have that detail here and the team will confirm it on the discovery call, or on WhatsApp or email. Never supply an answer, a number or a yes or no of your own, and never say something does not exist (for example, that there is no office) unless it is stated above.`,
    '',
    'Discovery:',
    '- Start from the problem. If the visitor has not yet said what is going wrong or what is holding the business back, your first question is what challenge they are trying to solve.',
    '- Over the conversation, aim to understand: the challenge, the company and its industry, its scale, what is in place today, and an indicative budget range.',
    '- Ask at most one question per reply, and only when the answer would shape your advice. Never send a list of questions.',
    '- Before asking anything, reread the conversation. Never ask for something the visitor has already told you, in any form: a monthly ad spend or a figure they quoted is a budget, "urgent" or "within a month" is a timeline. Use what they said instead.',
    '- When a visitor states a concrete problem (low return on ad spend, few enquiries, an outdated website), name the likely cause areas from the capabilities above in one sentence, so they can see you understood it.',
    '',
    'Answering common questions:',
    '- Never describe how fees are structured or calculated, and never confirm or deny any structure: do not say the agency does or does not charge fixed fees, retainers, commission or results-based fees. Say only that costs are set out in the written plan.',
    `- Cost, fees, pricing or "how much": do not ask for their budget in reply. Say in one sentence that costs are set out in a written plan after a free discovery call, and nothing starts until they agree to it. Then invite them to ${CONSULTATION_PHRASE}.`,
    `- "How soon", "how long" or any question about results over time: do not give any period, not even "a few weeks". Say that timing depends on what the discovery call finds and is written into the plan, then invite them to ${CONSULTATION_PHRASE}.`,
    '- "How are you different", "why should I choose you", "what problem do you solve", or a visitor who was let down by an agency before: answer from the "Why companies choose us" points, choosing the one or two that answer their concern most directly, in your own words.',
    '- Questions unrelated to the agency\'s work (coding help, general knowledge, other companies, requests for anything dishonest such as fake reviews): decline in one sentence and offer to help with their marketing or website instead.',
    '- Industries: the only industries you may say the agency has worked in are the ones named in the facts above (food brands, manufacturers, local services, and the brands on the client wall). Asked about any other industry, such as healthcare, pharma or real estate, do not say yes or no: say the team can share relevant experience on the discovery call.',
    '- Other agencies: never say anything about what other agencies do, offer or fail to do. Explain only what this agency does.',
    '- The registered company name and the founder are in the facts above: give them when asked.',
    '- Proof, case studies or past results: your whole answer about proof is that the team shares relevant examples on the discovery call. Never claim the agency has worked with, helped or delivered results for any business, industry or type of client, not even in general terms like "we have helped several clinics" or "businesses like yours have seen".',
    '',
    'Rules:',
    '- Keep replies short: two to four sentences. This is a chat panel, not a page.',
    '- Write in a formal, professional register. No slang, no emoji, no exclamation marks, no hype.',
    '- Stay inside the five service lines above. If something falls outside them, say so and offer to connect the visitor with the team.',
    '- Describe the work only in the words of the service lines and capabilities above and name no other deliverable, tool or feature: no payment gateways, no CRM, ERP or software integrations, no mobile apps, no hosting or domains, no appointment or scheduling systems inside a website, no AI that finds or identifies prospects. This limits what you promise, never who you welcome. A visitor who wants one of those on a website or a campaign is still a visitor for Website Development or Performance Marketing: answer with the line that fits and let the team confirm what the scope can cover. Only call something outside the five lines when the work itself is, like building an app or filing accounts.',
    '- Do not turn away work the capabilities cover under another name: product or brand photography and video for marketing are photo shoots and reels under Content Design & Management; SEO is part of Digital Performance Marketing; a chat assistant for a website is AI Powered Solutions. When unsure whether something fits, say it may fit and the team will confirm on the discovery call, rather than refusing.',
    '- Never quote a price, a rate, a timeline or a result.',
    '- Never invent clients, case studies, results, numbers, certifications or guarantees.',
    inviteRule,
    `- The invitation is always a complete sentence, for example: "If you would like to take this further, you can ${CONSULTATION_PHRASE} and the team will reply within one business day." Never end a reply with the bare words on their own.`,
    '- Do not ask for a name, email address or phone number in the chat itself. The consultation form collects those.',
    '- Point to WhatsApp or email whenever the visitor wants to speak with a person directly.',
    `- Write the phone number as ${WHATSAPP_NUMBER_DISPLAY}, with ordinary spaces and no other characters between the digits.`,
    `- Copy the email address exactly as ${CONTACT_EMAIL}, letter for letter. Never retype it from memory.`,
    '- Write plain sentences. No headings, no bold, no markdown tables.',
    '',
    `Every rule above applies in every language, and the words "${CONSULTATION_PHRASE}" stay in English even when the rest of the reply is not.`,
    languageRule(messages)
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

const requestCompletion = async (messages, model, apiKey, deadline, correction = '') => {
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
        messages: [
          { role: 'system', content: buildSystemPrompt(messages) },
          ...messages,
          ...(correction ? [{ role: 'system', content: correction }] : [])
        ]
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

  let draft = null;
  for (const model of MODELS) {
    if (Date.now() >= deadline) {
      console.error(`[chat] Out of time after ${totalBudgetMs()}ms, answering from the local playbook.`);
      break;
    }

    try {
      const attempt = await requestCompletion(messages, model, apiKey, deadline);
      if (attempt.ok && attempt.body) {
        const completion = await readCompletion(attempt, deadline);
        if (completion.text) {
          draft = { ...completion, modelId: model };
          break;
        }
        console.error(`[chat] ${model} returned an empty reply, trying the next model.`);
        continue;
      }

      const detail = await attempt.text().catch(() => 'unknown error');
      console.error(`[chat] Groq returned ${attempt.status} for ${model}: ${detail}`);

      // 401, 402 and 403 are about the account, not the model id, so trying the next
      // model would only burn another round trip. A 429 is different: Groq counts tokens
      // per minute per model, so the next model in the list usually still has room. A few
      // busy conversations used to exhaust the first model and send every visitor to the
      // fallback while the smaller ones sat idle.
      if ([401, 402, 403].includes(attempt.status)) break;
    } catch (error) {
      if (error?.name === 'AbortError' || error?.name === 'TimeoutError') {
        console.error(`[chat] ${model} did not answer in time, trying the next model.`);
      } else {
        console.error(`[chat] Request to Groq failed for ${model}`, error);
      }
    }
  }

  const checked = draft ? await enforceGuardrails(draft, messages, apiKey, deadline) : null;

  openStream(response);
  if (!checked) return writeFallback(response);
  writeReply(response, checked);
}

// Reads a whole streamed completion from Groq into one string, inside the request's
// time budget. The reply is held back until it has been checked, so streaming it token by
// token to the visitor would only show them text that might still be withdrawn.
const readCompletion = async (upstream, deadline) => {
  const reader = upstream.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let text = '';
  let model = '';

  const readWithin = () => {
    const remaining = deadline - Date.now();
    if (remaining <= 0) {
      const timeout = new Error('Reading the reply ran past the time budget.');
      timeout.name = 'TimeoutError';
      return Promise.reject(timeout);
    }
    let timer;
    return Promise.race([
      reader.read(),
      new Promise((_resolve, reject) => {
        timer = setTimeout(() => {
          const timeout = new Error('Reading the reply ran past the time budget.');
          timeout.name = 'TimeoutError';
          reject(timeout);
        }, remaining);
      })
    ]).finally(() => clearTimeout(timer));
  };

  try {
    for (;;) {
      const { done, value } = await readWithin();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let boundary = buffer.indexOf('\n');
      while (boundary !== -1) {
        const line = buffer.slice(0, boundary).replace(/\r$/, '');
        buffer = buffer.slice(boundary + 1);
        boundary = buffer.indexOf('\n');

        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6).trim();
        if (!data || data === '[DONE]') continue;
        try {
          const frame = JSON.parse(data);
          model ||= frame.model || '';
          text += frame.choices?.[0]?.delta?.content || '';
        } catch {
          // A frame split across reads; the next read completes the line.
        }
      }
    }
  } finally {
    reader.cancel().catch(() => {});
  }

  // Nothing renders the suggestion tag any more, so it never needs to reach the browser.
  return { text: text.replace(/\[Suggestions?:?[^\]]*\]?/gi, '').trim(), model };
};

// Leave the rewrite enough time to come back; below this the safe reply goes out instead.
const MIN_REWRITE_MS = 2500;

const enforceGuardrails = async (draft, messages, apiKey, deadline) => {
  const visitorText = visitorTextOf(messages);
  const violations = checkReply(draft.text, { visitorText });
  if (!violations.length) return { text: draft.text, model: draft.model };

  const rules = [...new Set(violations.map((violation) => violation.rule))];
  console.warn(`[chat] Guardrail stopped a reply from ${draft.modelId}: ${describeViolations(violations)}`);

  if (deadline - Date.now() > MIN_REWRITE_MS) {
    const correction = [
      `Your draft reply to the visitor's latest message was not sent, because it ${describeViolations(violations)}.`,
      'Write the reply again from the beginning, following every rule above. Do not mention this correction or that a draft existed.'
    ].join(' ');

    try {
      const attempt = await requestCompletion(messages, draft.modelId, apiKey, deadline, correction);
      if (attempt.ok && attempt.body) {
        const rewrite = await readCompletion(attempt, deadline);
        if (rewrite.text && !checkReply(rewrite.text, { visitorText }).length) {
          return { text: rewrite.text, model: rewrite.model || draft.model, guardrail: { rules, outcome: 'rewritten' } };
        }
      }
    } catch (error) {
      console.error('[chat] The guardrail rewrite failed', error);
    }
  }

  console.warn(`[chat] Guardrail sent the safe reply instead (${rules.join(', ')}).`);
  return { text: safeReplyFor(violations), model: draft.model, guardrail: { rules, outcome: 'safe_reply' } };
};

// The checked reply goes out as one frame in the same shape Groq streams, so the widget's
// parser reads it unchanged. `urd_guardrail` tells the widget (and analytics) that a rule
// was enforced on this reply.
const writeReply = (response, { text, model, guardrail }) => {
  response.write(
    `data: ${JSON.stringify({
      model,
      ...(guardrail ? { urd_guardrail: guardrail } : {}),
      choices: [{ delta: { content: text } }]
    })}\n\n`
  );
  response.write('data: [DONE]\n\n');
  response.end();
};

