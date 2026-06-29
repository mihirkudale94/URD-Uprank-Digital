import test from 'node:test';
import assert from 'node:assert';
import { getServiceMatch } from '../src/utils/servicePlaybook.js';

test('Chatbot Service Playbook Matcher Tests', async (t) => {
  await t.test('should match website/design inputs to digital service', () => {
    const result = getServiceMatch('I want a new website design for my shop');
    assert.ok(result);
    assert.strictEqual(result.id, 'digital');
    assert.strictEqual(result.title, 'Digital & UI/UX');
  });

  await t.test('should match seo/leads inputs to marketing service', () => {
    const result = getServiceMatch('Need help with SEO and generating growth leads');
    assert.ok(result);
    assert.strictEqual(result.id, 'marketing');
  });

  await t.test('should match ai/automation inputs to ai-growth service', () => {
    const result = getServiceMatch('interested in custom AI workflow automation and CRO');
    assert.ok(result);
    assert.strictEqual(result.id, 'ai-growth');
  });

  await t.test('should match ads/ppc inputs to advertising service', () => {
    const result = getServiceMatch('setting up google ads and facebook campaigns');
    assert.ok(result);
    assert.strictEqual(result.id, 'advertising');
  });

  await t.test('should match video/content inputs to content service', () => {
    const result = getServiceMatch('Need brand storytelling and product video shoots');
    assert.ok(result);
    assert.strictEqual(result.id, 'content');
  });

  await t.test('should match app/code/lms inputs to software service', () => {
    const result = getServiceMatch('Need to build a custom React app and LMS portal');
    assert.ok(result);
    assert.strictEqual(result.id, 'software');
  });

  await t.test('should return null for unmatched keywords', () => {
    const result = getServiceMatch('some completely unrelated message about weather');
    assert.strictEqual(result, null);
  });
});
