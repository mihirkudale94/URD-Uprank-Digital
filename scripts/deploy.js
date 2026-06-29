import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as ftp from 'basic-ftp';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..');

function loadEnvFile(fileName) {
  const envPath = path.resolve(PROJECT_ROOT, fileName);
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
  return /^(your_|ftp\.yourdomain\.com|example\.com)/i.test(value.trim());
}

function requireSetting(name) {
  const value = process.env[name];
  if (!value || isPlaceholder(value)) {
    throw new Error(`${name} is missing or still has a placeholder value.`);
  }
  return value;
}

async function deploy() {
  loadEnv();

  let host;
  let user;
  let password;

  try {
    host = requireSetting('FTP_HOST');
    user = requireSetting('FTP_USER');
    password = requireSetting('FTP_PASSWORD');
  } catch (error) {
    console.error(`Config error: ${error.message}`);
    console.error('Add real BigRock FTP values to .env:');
    console.error('  FTP_HOST=server-or-domain-host');
    console.error('  FTP_USER=your_ftp_username');
    console.error('  FTP_PASSWORD=your_ftp_password');
    console.error('  FTP_REMOTE_PATH=/public_html');
    console.error('  FTP_PORT=21');
    console.error('  FTP_SECURE=true');
    process.exit(1);
  }

  const remotePath = process.env.FTP_REMOTE_PATH || '/public_html';
  const port = Number.parseInt(process.env.FTP_PORT || '21', 10);
  const secure = process.env.FTP_SECURE !== 'false';
  const localDistPath = path.resolve(PROJECT_ROOT, 'dist');

  console.log('Starting production build...');
  try {
    execSync('npm run build', { cwd: PROJECT_ROOT, stdio: 'inherit' });
  } catch {
    console.error('Build failed. Deployment aborted.');
    process.exit(1);
  }

  if (!fs.existsSync(localDistPath)) {
    console.error('Build output folder was not created: dist');
    process.exit(1);
  }

  const client = new ftp.Client(30000);
  client.ftp.verbose = process.env.FTP_VERBOSE === 'true';

  try {
    console.log(`Connecting to ${host}:${port} with FTPS ${secure ? 'enabled' : 'disabled'}...`);
    await client.access({
      host,
      user,
      password,
      port,
      secure
    });

    console.log(`Uploading ${localDistPath} to ${remotePath}...`);
    await client.ensureDir(remotePath);
    await client.uploadFromDir(localDistPath);

    console.log('Deployment complete. BigRock should now serve the latest dist build.');
  } catch (err) {
    console.error('Deployment failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    client.close();
  }
}

deploy();
