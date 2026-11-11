import test from 'node:test';
import assert from 'node:assert/strict';
import { checkReply, safeReplyFor } from '../src/utils/chatGuardrails.js';

const INVITE =
  'If you would like to take this further, you can request a consultation and the team will reply within one business day.';

const rulesOf = (reply, visitorText = '') => [...new Set(checkReply(reply, { visitorText }).map((v) => v.rule))];

// Every one of these was written by a real model in testing, before the guardrails existed.
const CAUGHT = [
  ['Our office is located in Mumbai, India.', 'location'],
  ['We operate as a remote-first agency and serve clients across India.', 'location'],
  ['Yes, we serve clients worldwide, including Dubai and the US.', 'location'],
  ['Our office is open Monday to Friday from 9 am to 6 pm; we are closed on Saturdays.', 'office_hours'],
  ['We work with businesses across many sectors, including healthcare, and can discuss examples.', 'industry_claim'],
  ['Yes, we have worked with clients outside India, including in Dubai and the US.', 'client_claim'],
  ['We have helped several dental practices increase online bookings.', 'client_claim'],
  ['You keep full ownership, which many larger agencies do not guarantee.', 'competitor'],
  ['Reach Sachin at sachin@uprangedigial.com.', 'contact'],
  ['We typically begin seeing qualified contacts within the first few weeks of launch.', 'timeline'],
  ['We can design a one-month performance plan focused on ROAS.', 'timeline'],
  ['Our websites usually start at ₹25,000.', 'price'],
  ['Most retainers are around 40k a month.', 'price'],
  ['Clients see a 35% drop in cost per lead.', 'statistic'],
  ['We guarantee first-page rankings.', 'guarantee'],
  ['We are a certified Google Partner.', 'certification'],
  ['I run on OpenAI gpt-oss-120b through Groq.', 'model_disclosure'],
  ['Yes, we can finish the website by then, within three weeks.', 'delivery_promise'],
  ['We design, build and launch on WordPress, Shopify or custom code.', 'blocked_platform'],
  ['We can build it on Wordpress if you prefer.', 'blocked_platform']
];

for (const [reply, rule] of CAUGHT) {
  test(`caught: ${reply}`, () => {
    assert.ok(rulesOf(reply).includes(rule), `expected ${rule}, got ${rulesOf(reply)}`);
  });
}

// Correct replies from the same test runs. None of these may be stopped.
const ALLOWED = [
  `Our office is at Shyamal CHS, VIIT College Road, Kondhwa Budruk, Pune, Maharashtra 411048, India. ${INVITE}`,
  `Costs are set out in a written plan after a free discovery call, and nothing starts until you agree to it. ${INVITE}`,
  'We cannot guarantee a specific ranking timeline; results depend on what the discovery call finds.',
  'We do not guarantee a specific ROAS.',
  'We have worked with brands such as Shree Devashree Foods, Fitcon Fitness Consultancy and Kanak Jaggery.',
  'You can reach the team on WhatsApp at +91 93711 16165 or by email at sachin@uprankdigital.com.',
  'We provide a concise monthly report that shows what changed and the cost per enquiry.',
  'I do not have that detail here; the team will confirm whether we are a Google Partner on the call.',
  'We were founded in 2017, which makes 9 years in business.',
  'Hamare fees ka detail ek likhit plan mein hota hai. Aap request a consultation kar sakte hain aur team ek business day ke andar reply degi.'
];

for (const reply of ALLOWED) {
  test(`allowed: ${reply.slice(0, 60)}`, () => {
    assert.deepEqual(checkReply(reply), []);
  });
}

test('WordPress is blocked even when the visitor named it', () => {
  assert.ok(rulesOf('The team will confirm whether WordPress fits your needs.', 'Do you build WordPress sites?').includes('blocked_platform'));
});

test('a figure the visitor gave can be repeated back', () => {
  const visitor = 'My friend said you charged him 50,000. We go live in 3 weeks.';
  assert.deepEqual(rulesOf('We cannot confirm the 50,000 figure or commit to 3 weeks before a discovery call.', visitor), []);
  // ...but a figure the visitor never mentioned is still a quote.
  assert.ok(rulesOf('Websites usually cost 30,000.', visitor).includes('price'));
});

test('the model writes narrow no-break spaces, and they do not hide a timeline', () => {
  assert.ok(rulesOf('Live in 3 weeks.').includes('timeline'));
  assert.deepEqual(rulesOf('Brands such as Shree Devashree Foods have worked with us.'), []);
});

test('the safe reply fits what went wrong and still offers the consultation', () => {
  assert.match(safeReplyFor([{ rule: 'price' }]), /written plan/);
  assert.match(safeReplyFor([{ rule: 'timeline' }]), /Timing depends/);
  assert.match(safeReplyFor([{ rule: 'location' }]), /do not have that detail/);
  for (const rule of ['price', 'timeline', 'contact', 'location']) {
    assert.match(safeReplyFor([{ rule }]), /request a consultation/);
    assert.deepEqual(checkReply(safeReplyFor([{ rule }])), [], `the safe reply for ${rule} must pass its own checks`);
  }
});
