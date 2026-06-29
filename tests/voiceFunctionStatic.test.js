import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';

const functionSource = fs.readFileSync(
  new URL('../supabase/functions/request-voice-call/index.ts', import.meta.url),
  'utf8'
);

test('AI voice Supabase Edge Function production guards', async (t) => {
  await t.test('uses official mobile-call providers without Twilio', () => {
    assert.match(functionSource, /convai\/sip-trunk\/outbound-call/);
    assert.match(functionSource, /convai\/exotel\/outbound-call/);
    assert.match(functionSource, /convai\/whatsapp\/outbound-call/);
    assert.match(functionSource, /agent_phone_number_id/);
    assert.match(functionSource, /to_number/);
    assert.match(functionSource, /whatsapp_user_id/);
    assert.doesNotMatch(functionSource, /twilio/i);
    assert.doesNotMatch(functionSource, /ELEVENLABS_TWILIO/i);
  });

  await t.test('defaults to Exotel for mobile calling', () => {
    assert.match(functionSource, /Deno\.env\.get\('ELEVENLABS_CALL_PROVIDER'\) \|\| 'exotel'/);
  });

  await t.test('keeps ElevenLabs API key server-side only', () => {
    assert.match(functionSource, /Deno\.env\.get\('ELEVENLABS_API_KEY'\)/);
    assert.doesNotMatch(functionSource, /VITE_ELEVENLABS_API_KEY/);
    assert.match(functionSource, /'xi-api-key': apiKey/);
  });

  await t.test('protects browser calls with CORS and rate limits', () => {
    assert.match(functionSource, /VOICE_ALLOWED_ORIGINS/);
    assert.match(functionSource, /isAllowedOrigin/);
    assert.match(functionSource, /RATE_LIMIT_WINDOW_SECONDS/);
    assert.match(functionSource, /RATE_LIMIT_MAX_REQUESTS/);
    assert.match(functionSource, /enforceRateLimit/);
  });

  await t.test('validates and normalizes mobile phone numbers before provider call', () => {
    assert.match(functionSource, /normalizePhoneNumber/);
    assert.match(functionSource, /\^\\\+\[1-9\]\\d\{7,14\}\$/);
    assert.match(functionSource, /Please enter a valid mobile number with country code/);
  });
});

test('legacy PHP voice endpoint is not used', () => {
  assert.equal(fs.existsSync(new URL('../public/voice-call.php', import.meta.url)), false);
});
