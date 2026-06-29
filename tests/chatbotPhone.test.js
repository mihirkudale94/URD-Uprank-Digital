import test from 'node:test';
import assert from 'node:assert';
import { normalizePhoneForVoice } from '../src/utils/phone.js';

test('Chatbot AI voice phone normalization', async (t) => {
  await t.test('keeps valid international numbers', () => {
    assert.strictEqual(normalizePhoneForVoice('+919371116165'), '+919371116165');
  });

  await t.test('normalizes Indian local mobile numbers with default country code', () => {
    assert.strictEqual(normalizePhoneForVoice('9371116165'), '+919371116165');
  });

  await t.test('removes local trunk prefix before adding default country code', () => {
    assert.strictEqual(normalizePhoneForVoice('09371116165'), '+919371116165');
  });

  await t.test('supports 00 international dialing prefix', () => {
    assert.strictEqual(normalizePhoneForVoice('00919371116165'), '+919371116165');
  });

  await t.test('strips spaces and punctuation from formatted phone input', () => {
    assert.strictEqual(normalizePhoneForVoice('+91 93711-16165'), '+919371116165');
  });

  await t.test('rejects invalid short numbers', () => {
    assert.strictEqual(normalizePhoneForVoice('12345'), '');
  });
});
