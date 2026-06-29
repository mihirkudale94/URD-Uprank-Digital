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

loadEnvFile('.env');
loadEnvFile('.env.local');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publishableKey) {
  console.error('Supabase env values are missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, publishableKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  }
});

const timestamp = new Date().toISOString();
const payload = {
  name: 'Codex Supabase Test',
  email: 'codex.supabase.test+urd@example.com',
  phone: '+919999999999',
  business_name: 'URD QA Test',
  website_url: 'https://uprankdigital.com/',
  services: ['Digital Services', 'Marketing Services'],
  message: `Test inquiry submitted from local React/Supabase setup at ${timestamp}. Safe to delete.`,
  page_url: 'http://127.0.0.1:5173/#contact',
  source: 'website_contact_form',
  user_agent: 'Codex local verification',
  status: 'new'
};

const { error } = await supabase
  .from('leads')
  .insert([payload]);

if (error) {
  console.error('insert_failed');
  console.error(error.code || 'no_code');
  console.error(error.message);
  process.exit(1);
}

console.log('insert_success');
