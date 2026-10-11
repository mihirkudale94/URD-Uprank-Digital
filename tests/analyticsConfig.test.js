import test from 'node:test';
import assert from 'node:assert/strict';

import { resolveAnalyticsConfig, isValidGa4Id, isValidGtmId } from '../src/utils/analyticsLoader.js';

test('no tag is loaded when nothing is configured', () => {
  assert.deepEqual(resolveAnalyticsConfig({}), { mode: 'none', id: '', warning: '' });
  assert.equal(resolveAnalyticsConfig({ VITE_GTM_ID: '   ' }).mode, 'none');
});

test('a Tag Manager container is used when configured', () => {
  const config = resolveAnalyticsConfig({ VITE_GTM_ID: 'GTM-ABCD123' });
  assert.equal(config.mode, 'gtm');
  assert.equal(config.id, 'GTM-ABCD123');
  assert.equal(config.warning, '');
});

test('a GA4 measurement ID is used when configured', () => {
  const config = resolveAnalyticsConfig({ VITE_GA_MEASUREMENT_ID: 'G-AB12CD34' });
  assert.equal(config.mode, 'ga4');
  assert.equal(config.id, 'G-AB12CD34');
});

test('configuring both prefers Tag Manager and warns, so events are not counted twice', () => {
  const config = resolveAnalyticsConfig({
    VITE_GTM_ID: 'GTM-ABCD123',
    VITE_GA_MEASUREMENT_ID: 'G-AB12CD34'
  });
  assert.equal(config.mode, 'gtm');
  assert.match(config.warning, /twice/i);
});

test('a malformed ID is rejected rather than silently loading a broken tag', () => {
  const gtm = resolveAnalyticsConfig({ VITE_GTM_ID: 'G-WRONGPREFIX' });
  assert.equal(gtm.mode, 'none');
  assert.match(gtm.warning, /not a valid container ID/);

  const ga4 = resolveAnalyticsConfig({ VITE_GA_MEASUREMENT_ID: 'GTM-WRONGPREFIX' });
  assert.equal(ga4.mode, 'none');
  assert.match(ga4.warning, /not a valid measurement ID/);

  const placeholder = resolveAnalyticsConfig({ VITE_GA_MEASUREMENT_ID: 'G-XXXXXXX_REPLACE_ME' });
  assert.equal(placeholder.mode, 'none');
});

test('ID validators accept real formats and reject empties', () => {
  assert.ok(isValidGtmId('GTM-5KQ9WPD'));
  assert.ok(isValidGa4Id('G-1A2B3C4D5E'));
  assert.ok(!isValidGtmId(''));
  assert.ok(!isValidGa4Id(undefined));
});
