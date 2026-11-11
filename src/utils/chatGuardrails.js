// Output guardrails for the chat assistant. The system prompt asks the model not to quote
// prices, promise timelines, invent clients and so on; these checks make sure it did not,
// before the reply reaches a visitor. api/chat.js runs them on every reply, and the eval
// suite in evals/ scores replies with the same functions, so a rule that is enforced live
// is also the rule that is measured.
//
// Plain JS with relative imports: api/chat.js and the evals load this under Node.
//
// The checks are deliberately narrow. Each one looks for a specific kind of claim the
// agency cannot stand behind, and lets through anything the visitor said first (a visitor
// who mentions "3 weeks" or "50,000" can have it repeated back in a refusal).

import { CONTACT_EMAIL, WHATSAPP_NUMBER_DISPLAY, WHATSAPP_NUMBER_E164 } from './contactChannels.js';
import { clientLogos } from '../data/clientLogos.js';

const CLIENT_BRANDS = clientLogos.map((logo) => logo.name).filter(Boolean);

// The invitation every reply may end with. Its "one business day" is the agency's
// published reply time, not a delivery promise.
const ALLOWED_PERIODS = /\bone business day\b|\bek business day\b|एक (कार्य|व्यावसायिक) (दिवस|दिवसात)/gi;

const NEGATION = /\b(not|no|never|cannot|unable|neither|nor|without)\b|n['’]t\b|\bनहीं\b|\bनाही\b|\bnahi\b|\bnahin\b/i;

const splitSentences = (text) =>
  text
    .split(/(?<=[.!?।])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const digitsOf = (value) => value.replace(/\D/g, '');

// A figure the visitor typed themselves may be repeated back.
const visitorSaid = (match, visitorText) => {
  const digits = digitsOf(match);
  if (digits && digitsOf(visitorText).includes(digits)) return true;
  return visitorText.toLowerCase().includes(match.toLowerCase().trim());
};

const RULES = [
  {
    id: 'price',
    label: 'quoted a price or amount',
    pattern: /(₹|\brs\.?|\binr\b|\$)\s?\d[\d,.]*|\b\d[\d,.]*\s?(k|lakh|lakhs|lac|lacs|crore|crores|cr|thousand)\b/gi,
    allowVisitorEcho: true
  },
  {
    // A bare amount ("costs 30,000") after a word about money. Years and the postcode
    // have no price word in front of them, so they are left alone.
    id: 'price',
    label: 'quoted a price or amount',
    pattern:
      /\b(?:costs?|price[sd]?|pricing|fees?|charges?|charged|retainers?|rates?|budgets?|starts? at|starting at|around|about|approximately|roughly|only)\b[^.?!\d]{0,25}\d[\d,]{3,}/gi,
    allowVisitorEcho: true
  },
  {
    id: 'timeline',
    label: 'gave a time period',
    pattern:
      /\b(\d+|one|two|three|four|five|six|eight|ten|twelve|a few|few|a couple of|couple of)\s*(?:-|to)?\s*\d*\s*(?:business\s+)?(day|days|week|weeks|month|months)\b|\bwithin (a|the) (week|month|fortnight)\b/gi,
    allowVisitorEcho: true,
    ignore: ALLOWED_PERIODS
  },
  {
    id: 'delivery_promise',
    label: 'promised to deliver by a date',
    sentence: /\b(we|i)\s+(can|will|could)\s+(definitely\s+)?(finish|deliver|complete|launch|build it|have it ready|be ready|go live)[^.?!]*\b(by|within|in)\b/i,
    skipNegated: true
  },
  {
    id: 'statistic',
    label: 'quoted a percentage or multiple',
    pattern: /\b\d+(\.\d+)?\s?%|\b\d+(\.\d+)?\s?x\b/gi,
    allowVisitorEcho: true
  },
  {
    id: 'guarantee',
    label: 'made a guarantee',
    sentence: /\bguarantee(d|s)?\b|गारंटी/i,
    skipNegated: true
  },
  {
    id: 'certification',
    label: 'claimed a certification or partner badge',
    sentence: /\b(google|meta|facebook|microsoft|hubspot)\s+(premier\s+)?(partner|certified)\b|\bcertified\s+(google|meta|partner)\b|\baward[- ]winning\b/i,
    skipNegated: true
  },
  {
    id: 'client_claim',
    label: 'claimed past clients or results',
    sentence:
      /\b(we|i)\s*(have|['’]ve)\s+(already\s+)?(worked|helped|partnered|delivered|served|grown|scaled)\b|\bour clients (include|such as|like)\b|\bclients like\b|\bbusinesses like yours have\b|\b(we|i)\s+(worked|helped|partnered)\s+with\b/i,
    skipNegated: true,
    // Brands on the website's client wall are public, so naming them is allowed.
    allowIf: (sentence) => CLIENT_BRANDS.some((brand) => sentence.toLowerCase().includes(brand.toLowerCase()))
  },
  {
    id: 'office_hours',
    label: 'stated office hours',
    pattern: /\b\d{1,2}(:\d{2})?\s?(am|pm|a\.m\.|p\.m\.)\b|\bmonday (to|through|-) (friday|saturday)\b/gi,
    allowVisitorEcho: true
  },
  {
    id: 'location',
    label: 'placed the agency somewhere other than its Pune office',
    sentence:
      /\b(office|branch|branches|based|headquartered|located|team is)\b[^.?!]*\b(mumbai|bombay|bangalore|bengaluru|delhi|gurgaon|gurugram|noida|hyderabad|chennai|kolkata|ahmedabad|dubai|london|singapore|usa|united states|remote[- ]first|fully remote)\b|\b(serve|work with|have) clients (worldwide|globally|internationally|abroad|across the world)\b|\bremote[- ]first\b/i,
    skipNegated: true
  },
  {
    id: 'industry_claim',
    label: 'claimed experience in an industry the website does not name',
    sentence:
      /\b(including|such as|especially|particularly|with)\b[^.?!]*\b(healthcare|hospitals?|pharma|pharmaceuticals?|real estate|banking|finance|fintech|insurance|education|edtech|automotive|hospitality|government|legal|it companies|saas)\b/i,
    skipNegated: true,
    // Only a claim when it is about the agency's own track record.
    allowIf: (sentence) => !/\b(we|our)\b[^.?!]*\b(work|worked|served|clients|experience|helped)\b/i.test(sentence)
  },
  {
    id: 'competitor',
    label: 'made a claim about other agencies',
    sentence: /\b(other|larger|big|bigger|many|most|typical|traditional)\s+agencies\b/i
  },
  {
    id: 'model_disclosure',
    label: 'named an AI model or provider',
    pattern: /\b(gpt[-\s]?\w*|openai|groq|llama|qwen|mistral|chatgpt|anthropic|claude|gemini)\b/gi,
    allowVisitorEcho: true
  }
];

const findContactProblems = (reply, visitorText) => {
  const problems = [];
  for (const email of reply.match(/[^\s@<>()"'`]+@[^\s@<>()"'`]+\.[a-z]{2,}/gi) || []) {
    const clean = email.replace(/[.,;:]+$/, '').toLowerCase();
    if (clean !== CONTACT_EMAIL.toLowerCase() && !visitorText.toLowerCase().includes(clean)) {
      problems.push({ rule: 'contact', label: 'wrote a wrong email address', match: email });
    }
  }
  for (const phone of reply.match(/\+?\d[\d\s().-]{8,}\d/g) || []) {
    const digits = digitsOf(phone);
    if (digits.length < 10) continue;
    if (WHATSAPP_NUMBER_E164.endsWith(digits.slice(-10)) || digitsOf(visitorText).includes(digits)) continue;
    problems.push({ rule: 'contact', label: 'wrote a wrong phone number', match: phone });
  }
  return problems;
};

/**
 * Returns the rules a reply breaks, as [{ rule, label, match }]. Empty means it may be sent.
 * `visitorText` is everything the visitor has typed in the conversation.
 */
// The models write narrow no-break spaces between words and digit groups, and
// non-breaking hyphens inside words, far more often than a person types them. Left in,
// "Shree Devashree" with a U+202F is not the brand on the client wall, and "3 weeks" with
// one slips past the timeline check.
export const normalizeText = (value) =>
  String(value || '')
    .replace(/[    ]/g, ' ')
    .replace(/[‐‑‒–]/g, '-');

export const checkReply = (reply, { visitorText: rawVisitorText = '' } = {}) => {
  const text = normalizeText(reply);
  const visitorText = normalizeText(rawVisitorText);
  const violations = [];

  for (const rule of RULES) {
    if (rule.pattern) {
      const scanned = rule.ignore ? text.replace(rule.ignore, ' ') : text;
      for (const match of scanned.match(rule.pattern) || []) {
        if (rule.allowVisitorEcho && visitorSaid(match, visitorText)) continue;
        violations.push({ rule: rule.id, label: rule.label, match: match.trim() });
      }
    }

    if (rule.sentence) {
      for (const sentence of splitSentences(text)) {
        if (!rule.sentence.test(sentence)) continue;
        if (rule.skipNegated && NEGATION.test(sentence)) continue;
        if (rule.allowIf?.(sentence)) continue;
        violations.push({ rule: rule.id, label: rule.label, match: sentence.slice(0, 160) });
      }
    }
  }

  return [...violations, ...findContactProblems(text, visitorText)];
};

export const visitorTextOf = (messages = []) =>
  messages
    .filter((message) => message.role === 'user')
    .map((message) => message.content)
    .join('\n');

// Sent instead of a reply that still broke a rule after one rewrite. Plain and safe, and
// each ends with the consultation invitation so the visitor still has a next step.
const INVITE =
  'If you would like to take this further, you can request a consultation and the team will reply within one business day.';

export const safeReplyFor = (violations = []) => {
  const rules = new Set(violations.map((violation) => violation.rule));
  if (rules.has('price')) {
    return `Costs are set out in a written plan after a free discovery call, and nothing starts until you agree to it. ${INVITE}`;
  }
  if (rules.has('timeline') || rules.has('delivery_promise')) {
    return `Timing depends on what the discovery call finds, and it is written into the plan before any work starts. ${INVITE}`;
  }
  if (rules.has('contact')) {
    return `You can reach the team on WhatsApp at ${WHATSAPP_NUMBER_DISPLAY} or by email at ${CONTACT_EMAIL}. ${INVITE}`;
  }
  return `I do not have that detail here, and I would rather not guess. The team will confirm it on the free discovery call. ${INVITE}`;
};

export const describeViolations = (violations = []) =>
  [...new Map(violations.map((violation) => [violation.rule, violation])).values()]
    .map((violation) => `${violation.label} ("${violation.match}")`)
    .join('; ');
