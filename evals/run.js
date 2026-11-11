// Runs the chat assistant eval: every question in evals/questions.js, as a fresh
// conversation, through the real api/chat.js handler (prompt, guardrails and all), against
// the real Groq models.
//
//   npm run eval                                  all models, all questions
//   npm run eval -- --model openai/gpt-oss-20b    one model
//   npm run eval -- --only F1,P6,A8               some questions
//
// Needs GROQ_API_KEY in .env. Each model is forced in turn (the handler's other models are
// skipped), and a 429 from Groq's per-minute limit is waited out rather than counted as a
// failure, so on the free tier a full run takes a while.
//
// Writes evals/results/<timestamp>.json and prints a pass/fail report. A question passes
// when the reply the visitor would see is not empty, is not the connection fallback,
// breaks no guardrail, and meets the question's own must / mustNot expectations. How often
// the guardrails had to step in is reported separately: it measures the model, not the bot.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const argValue = (name) => {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
};

if (!process.env.GROQ_API_KEY) {
  console.error('GROQ_API_KEY is not set. Put it in .env (npm run eval loads it).');
  process.exit(1);
}

// Generous budgets: a slow answer is not what this measures.
process.env.CHAT_TOTAL_BUDGET_MS = '240000';
process.env.CHAT_UPSTREAM_TIMEOUT_MS = '90000';
process.env.CHAT_RATE_LIMIT = '1000000';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// One handler serves every model, so which model a request is for travels with the
// request: an async-local store would be tidier, but the forced model only has to survive
// the handler's own sequential loop.
const realFetch = globalThis.fetch;
let forcedModel = null;
globalThis.fetch = async (url, options) => {
  if (!String(url).includes('api.groq.com')) return realFetch(url, options);
  const body = JSON.parse(options.body);
  if (forcedModel && body.model !== forcedModel) return new Response('skipped by eval', { status: 404 });

  for (let attempt = 0; attempt < 20; attempt++) {
    const response = await realFetch(url, { ...options, signal: undefined });
    if (response.status !== 429) return response;
    const detail = await response.text();
    const waitMs = retryAfterMs(detail);
    console.log(`\n  (Groq rate limit on ${body.model}: waiting ${Math.round(waitMs / 1000)}s)`);
    await sleep(waitMs + 1500);
  }
  return new Response('still rate limited after 20 tries', { status: 429 });
};

// Groq writes the wait as "375ms", "12.5s", "7m12.5s" or "1h2m3s". Reading only the
// trailing seconds of "7m12.5s" retried after 12 seconds, twenty times, and then counted
// every remaining question as a connection failure.
function retryAfterMs(detail) {
  const match = detail.match(/try again in ((?:[\d.]+h)?(?:[\d.]+m(?!s))?(?:[\d.]+s)?(?:[\d.]+ms)?)/);
  if (!match || !match[1]) return 10000;
  let ms = 0;
  for (const [, value, unit] of match[1].matchAll(/([\d.]+)(ms|h|m|s)/g)) {
    ms += Number(value) * { h: 3_600_000, m: 60_000, s: 1000, ms: 1 }[unit];
  }
  return ms || 10000;
}

// Quiet the handler's own logging of skipped models; guardrail events are kept.
const originalError = console.error;
console.error = (...parts) => {
  if (String(parts[0]).includes('skipped by eval')) return;
  originalError(...parts);
};
const guardrailLog = [];
console.warn = (...parts) => guardrailLog.push(parts.join(' '));

const { default: handler, MODELS } = await import('../api/chat.js');
const { checkReply, normalizeText, visitorTextOf } = await import('../src/utils/chatGuardrails.js');
const { QUESTIONS } = await import('./questions.js');

const GREETING =
  'Welcome to Up Rank Digital. I am the corporate solutions assistant. I can outline how we support companies across web, marketing, performance and AI, help you work through a business challenge, or arrange a consultation with our team. How may I assist you today?';

const ask = async (messages) => {
  const chunks = [];
  const response = {
    statusCode: 200,
    setHeader() {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      chunks.push(JSON.stringify(body));
      return this;
    },
    write(value) {
      chunks.push(typeof value === 'string' ? value : Buffer.from(value).toString('utf8'));
    },
    end() {}
  };
  await handler({ method: 'POST', headers: { 'x-forwarded-for': 'eval' }, body: { messages } }, response);

  let reply = '';
  let fallback = false;
  let guardrail = null;
  for (const line of chunks.join('').split('\n')) {
    if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
    try {
      const frame = JSON.parse(line.slice(6));
      fallback ||= Boolean(frame.urd_fallback);
      guardrail ||= frame.urd_guardrail || null;
      reply += frame.choices?.[0]?.delta?.content || '';
    } catch {
      // not a frame
    }
  }
  return { reply: reply.trim(), fallback, guardrail };
};

const score = (question, result, visitorText) => {
  const problems = [];
  // The models put narrow no-break spaces inside names ("Sachin Raje"); compare text.
  const reply = normalizeText(result.reply);
  if (!result.reply) problems.push('empty reply');
  if (result.fallback) problems.push('connection fallback');
  for (const violation of checkReply(result.reply, { visitorText })) {
    problems.push(`guardrail: ${violation.label} ("${violation.match}")`);
  }
  for (const pattern of question.must || []) {
    if (!pattern.test(reply)) problems.push(`missing ${pattern}`);
  }
  for (const pattern of question.mustNot || []) {
    if (pattern.test(reply)) problems.push(`must not match ${pattern}`);
  }
  return problems;
};

const runModel = async (model, questions) => {
  forcedModel = model;
  const rows = [];
  for (const question of questions) {
    const messages = [{ role: 'assistant', content: GREETING }];
    let result;
    for (const turn of question.turns) {
      messages.push({ role: 'user', content: turn });
      result = await ask(messages);
      messages.push({ role: 'assistant', content: result.reply });
    }
    const problems = score(question, result, visitorTextOf(messages));
    rows.push({ id: question.id, cat: question.cat, question: question.turns.at(-1), ...result, problems });
    process.stdout.write(problems.length ? '✗' : '.');
  }
  process.stdout.write(` ${model}\n`);
  return rows;
};

const only = argValue('--only')?.split(',').map((id) => id.trim());
const questions = only ? QUESTIONS.filter((question) => only.includes(question.id)) : QUESTIONS;
const models = argValue('--model') ? [argValue('--model')] : [...new Set(MODELS)];

console.log(`Running ${questions.length} questions on ${models.join(', ')}\n`);

// Models run one after another: the handler is shared, and one forced model at a time is
// what keeps a result attributable to the model that wrote it.
const results = {};
for (const model of models) results[model] = await runModel(model, questions);

const resultsDir = path.join(root, 'evals', 'results');
fs.mkdirSync(resultsDir, { recursive: true });
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const outFile = path.join(resultsDir, `${stamp}.json`);
fs.writeFileSync(outFile, JSON.stringify({ ranAt: new Date().toISOString(), results, guardrailLog }, null, 2));

console.log('\n================ Report ================');
let allPassed = true;
for (const [model, rows] of Object.entries(results)) {
  const failed = rows.filter((row) => row.problems.length);
  const corrected = rows.filter((row) => row.guardrail);
  if (failed.length) allPassed = false;
  console.log(`\n${model}: ${rows.length - failed.length}/${rows.length} passed`);
  console.log(
    `  guardrails stepped in on ${corrected.length}` +
      (corrected.length
        ? ` (${corrected.map((row) => `${row.id}:${row.guardrail.outcome}:${row.guardrail.rules.join('+')}`).join(', ')})`
        : '')
  );
  for (const row of failed) {
    console.log(`\n  ✗ [${row.id}] ${row.question}`);
    console.log(`    reply: ${row.reply.replace(/\s+/g, ' ').slice(0, 300)}`);
    for (const problem of row.problems) console.log(`    - ${problem}`);
  }
}
console.log(`\nFull replies: ${path.relative(root, outFile)}`);
console.log('Read the replies too: the checks catch known failure shapes, not every wrong fact.');
process.exit(allPassed ? 0 : 1);
