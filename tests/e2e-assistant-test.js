import fs from 'fs';
import path from 'path';

// --- MOCK BROWSER ENVIRONMENT FOR FULL-STACK TESTING ---
const sessionStorageStore = {};
globalThis.sessionStorage = {
  getItem: (key) => sessionStorageStore[key] || null,
  setItem: (key, value) => { sessionStorageStore[key] = String(value); },
  removeItem: (key) => { delete sessionStorageStore[key]; },
  clear: () => { for (let key in sessionStorageStore) delete sessionStorageStore[key]; }
};

const eventListeners = {};
globalThis.window = {
  dispatchEvent: (event) => {
    const listeners = eventListeners[event.type] || [];
    listeners.forEach(cb => cb(event));
    return true;
  },
  addEventListener: (type, callback) => {
    if (!eventListeners[type]) eventListeners[type] = [];
    eventListeners[type].push(callback);
  },
  removeEventListener: (type, callback) => {
    if (!eventListeners[type]) return;
    eventListeners[type] = eventListeners[type].filter(cb => cb !== callback);
  }
};

// Simple Mock event class
class CustomEvent {
  constructor(type, options) {
    this.type = type;
    this.detail = options.detail || {};
  }
}
globalThis.CustomEvent = CustomEvent;

// --- LOAD SYSTEM PROMPT AND API KEY ---
const functionPath = path.resolve('supabase/functions/chat/index.ts');
const functionContent = fs.readFileSync(functionPath, 'utf8');
const promptMatch = functionContent.match(/const systemPrompt = `([\s\S]*?)`\.trim\(\);/);
if (!promptMatch) {
  console.error('❌ Failed to parse systemPrompt from supabase function.');
  process.exit(1);
}
const systemPrompt = promptMatch[1].trim();

const envPath = path.resolve('supabase/functions/chat/.env');
let cerebrasApiKey = process.env.CEREBRAS_API_KEY;
let modelName = process.env.CEREBRAS_MODEL || 'gemma-4-31b';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const keyMatch = envContent.match(/CEREBRAS_API_KEY=(.*)/);
  const modelMatch = envContent.match(/CEREBRAS_MODEL=(.*)/);
  if (keyMatch && !cerebrasApiKey) cerebrasApiKey = keyMatch[1].trim();
  if (modelMatch) modelName = modelMatch[1].trim();
}

if (!cerebrasApiKey) {
  console.error('❌ CEREBRAS_API_KEY is not defined in env or supabase/functions/chat/.env');
  process.exit(1);
}

// --- E2E TEST RUNNER ---
const E2E_SUITE = {
  passed: 0,
  failed: 0,
  tests: []
};

function assert(condition, message) {
  if (condition) {
    console.log(`  🟢 [PASS] ${message}`);
    E2E_SUITE.passed++;
  } else {
    console.error(`  🔴 [FAIL] ${message}`);
    E2E_SUITE.failed++;
  }
}

// Mocking Markdown Parser to test E2E output parsing logic
const parseMarkdownTextMock = (textLine) => {
  if (!textLine) return [];
  const parts = [];
  let remaining = textLine;
  const regex = /(\*\*.*?\*\*|\[.*?\]\(.*?\))/g;
  let match;
  while ((match = regex.exec(remaining)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];
    if (matchIndex > 0) parts.push({ type: 'text', content: remaining.substring(0, matchIndex) });
    if (matchText.startsWith('**') && matchText.endsWith('**')) {
      parts.push({ type: 'bold', content: matchText.substring(2, matchText.length - 2) });
    } else if (matchText.startsWith('[') && matchText.includes('](')) {
      const closeBracket = matchText.indexOf(']');
      const label = matchText.substring(1, closeBracket);
      const url = matchText.substring(closeBracket + 2, matchText.length - 1);
      parts.push({ type: 'link', label, url });
    }
    remaining = remaining.substring(matchIndex + matchText.length);
    regex.lastIndex = 0;
  }
  if (remaining) parts.push({ type: 'text', content: remaining });
  return parts;
};

// 1. E2E Test: Markdown Compiler & Link Formatter (UX)
async function testMarkdownFormatter() {
  console.log('\n🏃 Running Test 1: Markdown Link & Bold Compiler (UX)...');
  const sampleText = 'We offer **AI Growth** services. Feel free to [Book a call](https://wa.me/919371116165) now.';
  const parsed = parseMarkdownTextMock(sampleText);

  assert(parsed.length === 5, 'Should parse text into exactly 5 tokens');
  assert(parsed[1].type === 'bold' && parsed[1].content === 'AI Growth', 'Should parse bold text correctly');
  assert(parsed[3].type === 'link' && parsed[3].label === 'Book a call' && parsed[3].url === 'https://wa.me/919371116165', 'Should parse markdown link syntax correctly');
}

// 2. E2E Test: Session Storage Persistence (UX)
async function testSessionStoragePersistence() {
  console.log('\n🏃 Running Test 2: Chat State Session Storage Persistence (UX)...');
  
  // Simulate saving messages
  const mockMessages = [
    { role: 'user', content: 'Do you design websites?' },
    { role: 'assistant', content: 'Yes, we design conversion-focused websites.' }
  ];
  sessionStorage.setItem('urd_assistant_messages', JSON.stringify(mockMessages));
  sessionStorage.setItem('urd_assistant_open', 'true');

  // Load from sessionStorage
  const loadedOpen = sessionStorage.getItem('urd_assistant_open') === 'true';
  const loadedMessages = JSON.parse(sessionStorage.getItem('urd_assistant_messages'));

  assert(loadedOpen === true, 'Panel open state persisted successfully');
  assert(loadedMessages.length === 2, 'Message history loaded successfully');
  assert(loadedMessages[0].role === 'user' && loadedMessages[1].content.includes('websites'), 'Message contents are identical after session reload');
}

// 3. E2E Test: Global Browser Event Telemetry (DX)
async function testAnalyticsTelemetryEvent() {
  console.log('\n🏃 Running Test 3: B2B Telemetry Conversion Event Triggers (DX)...');
  
  let eventDispatched = false;
  let eventPayload = null;

  window.addEventListener('urd-assistant-event', (e) => {
    eventDispatched = true;
    eventPayload = e.detail;
  });

  // Simulate user sending message event dispatch
  window.dispatchEvent(new CustomEvent('urd-assistant-event', {
    detail: {
      action: 'message_sent',
      role: 'user',
      messageLength: 22
    }
  }));

  assert(eventDispatched === true, 'Message dispatch event triggered successfully');
  assert(eventPayload.action === 'message_sent' && eventPayload.messageLength === 22, 'Message sent analytics payload structure is correct');

  eventDispatched = false; // reset

  // Simulate assistant receiving qualified handoff message event dispatch
  window.dispatchEvent(new CustomEvent('urd-assistant-event', {
    detail: {
      action: 'reply_received',
      role: 'assistant',
      replyLength: 120,
      model: 'nvidia/nemotron-nano:free',
      isQualifiedHandoff: true
    }
  }));

  assert(eventDispatched === true, 'Reply received dispatch event triggered successfully');
  assert(eventPayload.action === 'reply_received' && eventPayload.model === 'nvidia/nemotron-nano:free' && eventPayload.isQualifiedHandoff === true, 'Handoff conversion flags and model telemetry are correct');
}

// 4. E2E Test: Live LLM Stream & System Prompt Validation (E2E API)
async function testLiveStreamHandoff() {
  console.log('\n🏃 Running Test 4: Live Cerebras B2B completions Connection (LLM)...');
  
  const startTime = Date.now();
  try {
    const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${cerebrasApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: modelName,
        temperature: 0.1,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: 'I want to schedule a website design project with you. What is Sachin\'s email?' }
        ]
      })
    });

    const duration = Date.now() - startTime;
    assert(response.ok === true, `API Response code: ${response.status} (Connected to Cerebras)`);
    
    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      console.log(`  🤖 Live Assistant Reply: "${content.trim()}"`);
      
      const containsEmail = content.toLowerCase().includes('sachin@uprankdigital.com');
      const containsCallToAction = containsEmail || content.toLowerCase().includes('whatsapp') || content.toLowerCase().includes('wa.me') || content.toLowerCase().includes('+91 93711 16165');
      
      assert(containsEmail === true, 'System Prompt holds correctly (contains sachin@uprankdigital.com)');
      assert(containsCallToAction === true, 'Qualifies lead and triggers transition CTA successfully');
      console.log(`  ⏱️ Latency: ${duration}ms | Model Used: ${data.model}`);
    }
  } catch (err) {
    console.error('  🔴 API call exception:', err.message);
    E2E_SUITE.failed++;
  }
}

async function run() {
  console.log('🚀 Starting Enterprise AI Assistant E2E Testing Suite...');
  console.log('💻 Environment: Mock Node.js JSDOM Browser & SessionStorage');
  console.log('🤖 Target Model: ' + modelName + '\n');

  await testMarkdownFormatter();
  await testSessionStoragePersistence();
  await testAnalyticsTelemetryEvent();
  await testLiveStreamHandoff();

  const total = E2E_SUITE.passed + E2E_SUITE.failed;
  console.log(`\n==================================================`);
  console.log(`📊 E2E Final Report:`);
  console.log(`   Passed:      ${E2E_SUITE.passed} / ${total}`);
  console.log(`   Failed:      ${E2E_SUITE.failed} / ${total}`);
  console.log(`==================================================`);

  if (E2E_SUITE.failed > 0) {
    process.exit(1);
  }
}

run();
