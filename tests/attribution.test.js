import test from 'node:test';
import assert from 'node:assert/strict';

import { parseTouch, mergeAttribution, sanitizeTouch } from '../src/utils/attribution.js';

const NOW = Date.parse('2026-11-11T10:00:00Z');
const DAY = 24 * 60 * 60 * 1000;

test('a Google Ads click records its UTM tags and gclid', () => {
  const touch = parseTouch(
    'https://uprankdigital.com/?utm_source=google&utm_medium=cpc&utm_campaign=pune-web&utm_term=web+agency+pune&gclid=abc123',
    'https://www.google.com/',
    NOW
  );
  assert.equal(touch.utm_source, 'google');
  assert.equal(touch.utm_medium, 'cpc');
  assert.equal(touch.utm_campaign, 'pune-web');
  assert.equal(touch.utm_term, 'web agency pune');
  assert.equal(touch.gclid, 'abc123');
  assert.equal(touch.referrer, 'https://www.google.com/');
  assert.equal(touch.captured_at, '2026-11-11T10:00:00.000Z');
});

test('an organic visit from another site records the referrer', () => {
  const touch = parseTouch('https://uprankdigital.com/', 'https://in.linkedin.com/company/x', NOW);
  assert.deepEqual(Object.keys(touch).sort(), ['captured_at', 'landing_page', 'referrer']);
});

test('a direct visit or an internal click records nothing', () => {
  assert.equal(parseTouch('https://uprankdigital.com/', '', NOW), null);
  assert.equal(parseTouch('https://uprankdigital.com/#contact', 'https://www.uprankdigital.com/', NOW), null);
});

test('the first touch is kept and the last touch is updated', () => {
  const first = parseTouch('https://uprankdigital.com/?utm_source=google&utm_medium=cpc', '', NOW);
  const later = parseTouch('https://uprankdigital.com/?utm_source=facebook&utm_medium=paid_social', '', NOW + DAY);

  const afterFirst = mergeAttribution(null, first, NOW);
  const afterSecond = mergeAttribution(afterFirst, later, NOW + DAY);
  assert.equal(afterSecond.first.utm_source, 'google');
  assert.equal(afterSecond.last.utm_source, 'facebook');

  // A direct return visit changes nothing.
  assert.deepEqual(mergeAttribution(afterSecond, null, NOW + 2 * DAY), afterSecond);
});

test('attribution older than 90 days is dropped', () => {
  const old = mergeAttribution(null, parseTouch('https://uprankdigital.com/?utm_source=old', '', NOW), NOW);
  assert.deepEqual(mergeAttribution(old, null, NOW + 91 * DAY), {});
});

test('sanitizing keeps only known fields and trims long values', () => {
  const clean = sanitizeTouch({ utm_source: 'google', evil: 'x', gclid: 'a'.repeat(1000) });
  assert.deepEqual(Object.keys(clean).sort(), ['gclid', 'utm_source']);
  assert.equal(clean.gclid.length, 300);
  assert.equal(sanitizeTouch('nope'), null);
  assert.equal(sanitizeTouch({}), null);
});
