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

async function runDummyTest() {
  console.log('🧪 Starting Chatbot Lead Database Integration Test...');
  loadEnv();

  const url = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !publishableKey) {
    console.error('❌ Supabase configuration environment variables are missing.');
    process.exit(1);
  }

  const supabase = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  });

  const dummyLead = {
    phone: '+1 555-019-2834',
    service_interest: 'AI Growth & CRO Playbook',
    intent_signals: ['AI-Growth', 'Lead-Qualification'],
    transcript_summary: 'Business Name: Dummy Corp Ltd\nWebsite: dummy-corp.example.com\nGoal: Scale inbound qualified bookings\nTimeline: This month\nBudget: INR 1L-3L',
    notes: 'Timeline: This month, Budget: INR 1L-3L',
    page_url: 'https://uprankdigital.com/test-audit',
    source: 'chatbot_callback',
    preferred_channel: 'human_callback',
    user_agent: 'NodeJS/TestRunner (BigCompany-Audit-Tester)',
    consent_accepted: true,
    status: 'new'
  };

  console.log('🔄 Attempting to insert dummy lead payload...');
  console.log(JSON.stringify(dummyLead, null, 2));

  const { error } = await supabase
    .from('chatbot_leads')
    .insert([dummyLead]);

  if (error) {
    console.error('❌ Insertion failed with Supabase Postgres error:');
    console.error(JSON.stringify(error, null, 2));
    process.exit(1);
  }

  console.log(`\n🟢 Integration Test PASSED! Dummy Lead Inserted successfully`);
}

runDummyTest();
