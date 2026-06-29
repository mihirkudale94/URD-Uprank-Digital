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

function isPlaceholder(value = '') {
  return value.includes('your_supabase_') || value.includes('placeholder');
}

async function testConnection() {
  loadEnv();

  const url = process.env.VITE_SUPABASE_URL;
  const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
  const leadFunction = process.env.VITE_SUPABASE_LEAD_FUNCTION;

  console.log('Checking Supabase environment variables...');

  if (!url || isPlaceholder(url)) {
    console.error('Error: VITE_SUPABASE_URL is missing or still has a placeholder value.');
    process.exit(1);
  }

  if (!publishableKey || isPlaceholder(publishableKey)) {
    console.error('Error: VITE_SUPABASE_PUBLISHABLE_KEY is missing or still has a placeholder value.');
    process.exit(1);
  }

  const supabase = createClient(url, publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });

  console.log(`Supabase URL configured: ${url}`);

  if (leadFunction) {
    console.log(`Lead Edge Function configured: ${leadFunction}`);
    console.log('Skipping live function call to avoid creating a test lead.');
  } else {
    console.log('Direct table insert mode configured.');
    console.log('Skipping live insert to avoid creating a test lead.');
  }

  console.log('Config check passed. Run a manual website form submission after the migration is applied.');

  // Keep the client constructed so invalid URL/key shape errors surface early.
  void supabase;
}

testConnection();
