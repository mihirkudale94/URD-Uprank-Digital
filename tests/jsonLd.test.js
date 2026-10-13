import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

const extractJsonLd = () =>
  [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((match) =>
    JSON.parse(match[1])
  );

test('index.html contains valid JSON-LD blocks', () => {
  const blocks = extractJsonLd();
  assert.ok(blocks.length >= 1, 'expected at least the Organization schema');
  assert.ok(
    blocks.some((block) => block['@type'] === 'Organization'),
    'Organization schema is missing from index.html'
  );
});
