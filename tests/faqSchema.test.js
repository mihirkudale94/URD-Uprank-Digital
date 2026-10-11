import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

import { faqItems } from '../src/data/faq.js';

const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

const extractJsonLd = () =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1])
  );

test('index.html contains valid JSON-LD blocks', () => {
  const blocks = extractJsonLd();
  assert.ok(blocks.length >= 2, 'expected Organization and FAQPage schema');
});

test('FAQPage schema stays in sync with the rendered FAQ', () => {
  const faqSchema = extractJsonLd().find((block) => block['@type'] === 'FAQPage');
  assert.ok(faqSchema, 'FAQPage schema is missing from index.html');

  assert.equal(
    faqSchema.mainEntity.length,
    faqItems.length,
    'FAQPage schema has a different number of questions than the FAQ section'
  );

  faqItems.forEach((item, index) => {
    const entry = faqSchema.mainEntity[index];
    assert.equal(entry['@type'], 'Question');
    assert.equal(entry.name, item.question, `question ${index + 1} differs from the schema`);
    assert.equal(
      entry.acceptedAnswer.text,
      item.answer,
      `answer ${index + 1} differs from the schema`
    );
  });
});

test('every FAQ entry has non-empty content', () => {
  faqItems.forEach((item, index) => {
    assert.ok(item.question?.trim(), `question ${index + 1} is empty`);
    assert.ok(item.answer?.trim(), `answer ${index + 1} is empty`);
  });
});
