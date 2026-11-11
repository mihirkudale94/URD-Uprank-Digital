import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildOrganizationJsonLd, renderJsonLdScript } from '../src/data/structuredData.js';
import { ADDRESS, CONTACT, EXPERTISE, SERVICES } from '../src/data/siteContent.js';

const html = fs.readFileSync(path.resolve('index.html'), 'utf8');
const typesOf = (block) => [].concat(block['@type']);

test('index.html takes its JSON-LD from siteContent.js, not a hand-written copy', () => {
  assert.ok(html.includes('<!--site:json-ld-->'), 'the JSON-LD placeholder is missing from index.html');
  assert.ok(
    !html.includes('<script type="application/ld+json">'),
    'index.html has a hand-written JSON-LD block that would drift from the page'
  );
});

test('the rendered JSON-LD script is valid JSON', () => {
  const script = renderJsonLdScript();
  const body = script.replace(/^<script type="application\/ld\+json">/, '').replace(/<\/script>$/, '');
  const block = JSON.parse(body);
  assert.ok(typesOf(block).includes('Organization'));
});

test('the business is marked up as a local service with a full address', () => {
  const business = buildOrganizationJsonLd();
  assert.ok(typesOf(business).includes('ProfessionalService'));
  for (const field of ['streetAddress', 'addressLocality', 'postalCode', 'addressCountry']) {
    assert.ok(business.address?.[field], `address.${field} is missing`);
  }
  assert.ok(business.telephone, 'telephone is missing');
  // sameAs is for profiles of the business, not chat links.
  assert.ok(business.sameAs.every((url) => !url.includes('wa.me')));
});

test('the structured data matches the details the page shows', () => {
  const business = buildOrganizationJsonLd();
  assert.equal(business.email, CONTACT.email);
  assert.equal(business.telephone, `+${CONTACT.phoneE164}`);
  assert.equal(business.address.streetAddress, ADDRESS.streetAddress);
  assert.equal(business.address.postalCode, ADDRESS.postalCode);
  assert.deepEqual(
    business.hasOfferCatalog.itemListElement.map((offer) => offer.itemOffered.name),
    SERVICES.map((service) => service.title)
  );
  assert.deepEqual(business.knowsAbout, EXPERTISE.map((item) => item.title));
});
