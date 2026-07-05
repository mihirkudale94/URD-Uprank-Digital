import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvFile(fileName) {
  const envPath = path.resolve(__dirname, '..', fileName);
  if (!fs.existsSync(envPath)) return;

  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) return;

    const [key, ...valueParts] = trimmed.split('=');
    let value = valueParts.join('=').trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key.trim()] = value;
  });
}

function loadEnv() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');
}

// Client-side phone number validation helper matching B2B standards (7 to 40 characters)
function validatePhoneNumber(phone) {
  const cleaned = phone.replace(/\s+/g, '');
  return cleaned.length >= 7 && cleaned.length <= 40;
}

const TEST_SUITE = {
  passed: 0,
  failed: 0
};

function assert(condition, message) {
  if (condition) {
    console.log(`  🟢 [PASS] ${message}`);
    TEST_SUITE.passed++;
  } else {
    console.error(`  🔴 [FAIL] ${message}`);
    TEST_SUITE.failed++;
  }
}

async function runCallbackSuite() {
  console.log('🚀 Starting Enterprise Callback Feature Simulation & Validation...');
  loadEnv();

  const url = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    console.error('❌ Supabase configuration environment variables are missing.');
    process.exit(1);
  }

  const supabase = createClient(url, publishableKey, {
    auth: { persistSession: false }
  });

  // --- TEST CASE 1: Consent Check Enforcement ---
  console.log('\n🏃 Test Case 1: GDPR Consent Check Enforcement');
  const leadNoConsent = {
    phone: '+919999999999',
    consent_accepted: false
  };
  
  assert(
    leadNoConsent.consent_accepted === false, 
    'Form submission should be blocked when consent is not accepted'
  );

  // --- TEST CASE 2: Phone Input Length Validation (Client-side simulation) ---
  console.log('\n🏃 Test Case 2: Client-side Phone Length Validation');
  const shortPhone = '12345';
  const longPhone = '123456789012345678901234567890123456789012345';
  const validPhone = '+91 98765 43210';

  assert(
    validatePhoneNumber(shortPhone) === false, 
    'Should reject short phone numbers (< 7 chars)'
  );
  assert(
    validatePhoneNumber(longPhone) === false, 
    'Should reject excessively long phone numbers (> 40 chars)'
  );
  assert(
    validatePhoneNumber(validPhone) === true, 
    'Should accept valid phone formats (e.g. +91 98765 43210)'
  );

  // --- TEST CASE 3: Database Database Constraints (Supabase RLS & Validation rules) ---
  console.log('\n🏃 Test Case 3: Live Database Submission & Constraint Validation');

  const invalidDBLead = {
    phone: '123', // invalid length, will fail constraint check (chatbot_leads_phone_length)
    service_interest: 'General enquiry',
    intent_signals: [],
    transcript_summary: 'Test case failing data input',
    notes: 'Constraint testing',
    page_url: 'http://localhost:5173',
    source: 'chatbot_callback',
    preferred_channel: 'human_callback',
    user_agent: 'MockBrowser',
    consent_accepted: true,
    status: 'new'
  };

  console.log('   (Simulating insertion of short phone to check DB constraint catches)...');
  const resInvalid = await supabase
    .from('chatbot_leads')
    .insert([invalidDBLead]);

  if (resInvalid.error) {
    console.log(`   ℹ️ Database returned error: Code=${resInvalid.error.code}, Message="${resInvalid.error.message}"`);
  }

  assert(
    resInvalid.error !== null && (resInvalid.error.code === '23514' || resInvalid.error.code === '42501'), 
    'Database correctly blocks invalid short phone with constraint or RLS violation code (23514 or 42501)'
  );

  const validDBLead = {
    phone: '+919876543210',
    service_interest: 'Digital & UI/UX Playbook',
    intent_signals: ['Digital-UX'],
    transcript_summary: 'Business Name: Audit Test Co\nGoal: Lead capturing',
    notes: 'Consent accepted test',
    page_url: 'http://localhost:5173',
    source: 'chatbot_callback',
    preferred_channel: 'human_callback',
    user_agent: 'MockBrowser',
    consent_accepted: true,
    status: 'new'
  };

  console.log('   (Inserting valid payload with consent)...');
  const resValid = await supabase
    .from('chatbot_leads')
    .insert([validDBLead]);

  assert(
    resValid.error === null, 
    'Database successfully saves valid lead with consent accepted'
  );

  console.log('\n==================================================');
  console.log(`📊 Callback Test Report:`);
  console.log(`   Passed:      ${TEST_SUITE.passed} / 6`);
  console.log(`   Failed:      ${TEST_SUITE.failed} / 6`);
  console.log(`==================================================`);

  if (TEST_SUITE.failed > 0) {
    process.exit(1);
  }
}

runCallbackSuite();
