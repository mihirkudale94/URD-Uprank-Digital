import test from 'node:test';
import assert from 'node:assert';
import { getServiceMatch } from '../src/utils/servicePlaybook.js';

test('Chatbot Service Playbook Matcher Tests', async (t) => {
  await t.test('should match website/design inputs to website-development service', () => {
    const result = getServiceMatch('I want a new website design for my shop');
    assert.ok(result);
    assert.strictEqual(result.id, 'website-development');
    assert.strictEqual(result.title, 'Website Development');
  });

  await t.test('should match seo/leads inputs to digital-marketing service', () => {
    const result = getServiceMatch('Need help with SEO and generating growth leads');
    assert.ok(result);
    assert.strictEqual(result.id, 'digital-marketing');
  });

  await t.test('should match ai/automation inputs to ai-solutions service', () => {
    const result = getServiceMatch('interested in custom AI workflow automation and chatbots');
    assert.ok(result);
    assert.strictEqual(result.id, 'ai-solutions');
  });

  await t.test('should match ads/ppc inputs to performance-marketing service', () => {
    const result = getServiceMatch('setting up google ads and facebook campaigns');
    assert.ok(result);
    assert.strictEqual(result.id, 'performance-marketing');
  });

  await t.test('should match video/content inputs to content-management service', () => {
    const result = getServiceMatch('Need brand storytelling and product video shoots');
    assert.ok(result);
    assert.strictEqual(result.id, 'content-management');
  });

  await t.test('should match custom shopify/redesign inputs to website-development service', () => {
    const result = getServiceMatch('Need to build a custom Shopify e-commerce redesign');
    assert.ok(result);
    assert.strictEqual(result.id, 'website-development');
  });

  await t.test('should return null for unmatched keywords', () => {
    const result = getServiceMatch('some completely unrelated message about weather');
    assert.strictEqual(result, null);
  });
});
