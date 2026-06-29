import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const allowedServices = new Set([
  'Digital Services',
  'Marketing Services',
  'Advertising Services',
  'Content Services',
  'Software Services'
]);

const cleanText = (value: unknown, maxLength = 500) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const jsonResponse = (body: Record<string, unknown>, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : corsHeaders)
    }
  });

const isAllowedOrigin = (origin: string) => {
  const configured = Deno.env.get('ALLOWED_ORIGINS') || Deno.env.get('CONTACT_ALLOWED_ORIGINS') || '';
  const allowed = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return allowed.length === 0 || allowed.includes(origin);
};

const normalizeUrl = (value: unknown) => {
  const raw = cleanText(value, 300);
  if (!raw) return '';
  const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;

  try {
    const parsed = new URL(withProtocol);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString().slice(0, 300) : '';
  } catch {
    return '';
  }
};

const notifyByEmail = async (lead: Record<string, unknown>) => {
  const apiKey = Deno.env.get('RESEND_API_KEY');
  const recipient = Deno.env.get('CONTACT_RECIPIENT') || 'sachin@uprankdigital.com';
  const from = Deno.env.get('RESEND_FROM_EMAIL') || 'Up Rank Digital <leads@uprankdigital.com>';

  if (!apiKey) return;

  const services = Array.isArray(lead.services) && lead.services.length
    ? lead.services.join(', ')
    : 'Not specified';

  const text = [
    'New inquiry from the Up Rank Digital website',
    '',
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone}`,
    `Business: ${lead.business_name || 'Not specified'}`,
    `Website: ${lead.website_url || 'Not specified'}`,
    `Services: ${services}`,
    '',
    'Message:',
    lead.message || 'Not provided',
    '',
    `Page: ${lead.page_url || 'Not provided'}`
  ].join('\n');

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from,
      to: recipient,
      subject: `New website inquiry from ${lead.name}`,
      text,
      reply_to: String(lead.email)
    })
  });
};

Deno.serve(async (request) => {
  const origin = request.headers.get('origin') || '';

  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        ...(origin && isAllowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {})
      }
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ success: false, message: 'Method not allowed.' }, 405, origin);
  }

  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ success: false, message: 'Request origin is not allowed.' }, 403, origin);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ success: false, message: 'Lead service is not configured.' }, 503, origin);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonResponse({ success: false, message: 'Invalid form payload.' }, 400, origin);
  }

  const lead = {
    name: cleanText(body.name, 120),
    email: cleanText(body.email, 254).toLowerCase(),
    phone: cleanText(body.phone, 40),
    business_name: cleanText(body.business_name, 160),
    website_url: normalizeUrl(body.website_url),
    services: Array.isArray(body.services)
      ? body.services.map((service) => cleanText(service, 80)).filter((service) => allowedServices.has(service))
      : [],
    message: cleanText(body.message, 3000),
    page_url: normalizeUrl(body.page_url),
    source: 'website_contact_form',
    user_agent: cleanText(body.user_agent, 500),
    status: 'new'
  };

  if (!lead.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email) || !lead.phone) {
    return jsonResponse({ success: false, message: 'Please enter a valid name, email, and phone number.' }, 422, origin);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false
    }
  });

  const { data, error } = await supabase
    .from('leads')
    .insert([lead])
    .select('id')
    .single();

  if (error) {
    return jsonResponse({ success: false, message: error.message }, 500, origin);
  }

  await notifyByEmail(lead).catch((error) => {
    console.error('Lead email notification failed', error);
  });

  return jsonResponse({ success: true, leadId: data.id }, 200, origin);
});
