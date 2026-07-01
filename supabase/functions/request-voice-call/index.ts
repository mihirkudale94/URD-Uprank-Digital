const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const RATE_LIMIT_WINDOW_SECONDS = 900;
const RATE_LIMIT_MAX_REQUESTS = 3;
const rateLimitEvents = new Map<string, number[]>();
const PROVIDER_ENDPOINTS = {
  sip_trunk: 'https://api.elevenlabs.io/v1/convai/sip-trunk/outbound-call',
  exotel: 'https://api.elevenlabs.io/v1/convai/exotel/outbound-call',
  whatsapp: 'https://api.elevenlabs.io/v1/convai/whatsapp/outbound-call'
} as const;

type CallProvider = keyof typeof PROVIDER_ENDPOINTS;

const cleanText = (value: unknown, maxLength = 500) =>
  String(value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

const isTruthyConsent = (value: unknown) =>
  value === true || value === 'true' || value === '1' || value === 1;

const jsonResponse = (body: Record<string, unknown>, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : corsHeaders)
    }
  });

const isAllowedOrigin = (origin: string) => {
  const configured = Deno.env.get('VOICE_ALLOWED_ORIGINS') || Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowed = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return allowed.length === 0 || allowed.includes(origin);
};

const normalizePhoneNumber = (value: unknown) => {
  let phone = cleanText(value, 40).replace(/[^\d+]/g, '');

  if (phone.startsWith('00')) {
    phone = `+${phone.slice(2)}`;
  }

  if (!phone.startsWith('+')) {
    const countryCode = (Deno.env.get('VOICE_DEFAULT_COUNTRY_CODE') || '91').replace(/\D+/g, '') || '91';
    phone = `+${countryCode}${phone.replace(/^0+/, '')}`;
  }

  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : '';
};

const clientKey = (request: Request) =>
  request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('cf-connecting-ip')
    || request.headers.get('x-real-ip')
    || 'unknown';

const enforceRateLimit = (key: string) => {
  const now = Math.floor(Date.now() / 1000);
  const freshEvents = (rateLimitEvents.get(key) || [])
    .filter((eventTime) => eventTime > now - RATE_LIMIT_WINDOW_SECONDS);

  if (freshEvents.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  rateLimitEvents.set(key, [...freshEvents, now]);
  return true;
};

const selectedProvider = (): CallProvider => {
  const configured = (Deno.env.get('ELEVENLABS_CALL_PROVIDER') || 'exotel')
    .trim()
    .toLowerCase()
    .replace('-', '_');

  return configured === 'exotel' || configured === 'whatsapp' ? configured : 'sip_trunk';
};

const phoneNumberId = () =>
  Deno.env.get('ELEVENLABS_AGENT_PHONE_NUMBER_ID')
    || Deno.env.get('ELEVENLABS_PHONE_NUMBER_ID')
    || Deno.env.get('ELEVENLABS_SIP_TRUNK_PHONE_NUMBER_ID')
    || Deno.env.get('ELEVENLABS_EXOTEL_PHONE_NUMBER_ID')
    || '';

const buildProviderPayload = (
  provider: CallProvider,
  agentId: string,
  toNumber: string,
  context: Record<string, string>
) => {
  const conversationData = {
    dynamic_variables: {
      lead_source: 'uprankdigital.com',
      requested_number: toNumber,
      service_interest: context.serviceInterest,
      intent_signals: context.intentSignals,
      page_url: context.pageUrl,
      consent_text: context.consentText,
      handoff_expectation: 'Qualify the lead, answer briefly, and offer human follow-up for pricing or detailed proposals.'
    }
  };

  if (provider === 'whatsapp') {
    const whatsappPhoneNumberId = Deno.env.get('ELEVENLABS_WHATSAPP_PHONE_NUMBER_ID') || '';
    const whatsappTemplateName = Deno.env.get('ELEVENLABS_WHATSAPP_TEMPLATE_NAME') || '';
    const whatsappTemplateLanguageCode = Deno.env.get('ELEVENLABS_WHATSAPP_TEMPLATE_LANGUAGE_CODE')
      || Deno.env.get('ELEVENLABS_WHATSAPP_TEMPLATE_LANGUAGE')
      || 'en';

    if (!whatsappPhoneNumberId || !whatsappTemplateName || !whatsappTemplateLanguageCode) {
      return {
        error: 'WhatsApp AI voice calling is not configured in Supabase secrets.'
      };
    }

    return {
      payload: {
        agent_id: agentId,
        whatsapp_phone_number_id: whatsappPhoneNumberId,
        whatsapp_user_id: toNumber,
        whatsapp_call_permission_request_template_name: whatsappTemplateName,
        whatsapp_call_permission_request_template_language_code: whatsappTemplateLanguageCode,
        conversation_initiation_client_data: conversationData
      }
    };
  }

  const agentPhoneNumberId = phoneNumberId();

  if (!agentPhoneNumberId) {
    return {
      error: 'Mobile AI calling is not configured in Supabase secrets. Define ELEVENLABS_AGENT_PHONE_NUMBER_ID.'
    };
  }

  return {
    payload: {
      agent_id: agentId,
      agent_phone_number_id: agentPhoneNumberId,
      to_number: toNumber,
      conversation_initiation_client_data: conversationData
    }
  };
};

const postToElevenLabs = async (provider: CallProvider, payload: Record<string, unknown>, apiKey: string) => {
  const response = await fetch(PROVIDER_ENDPOINTS[provider], {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json().catch(() => ({}));
  return { ok: response.ok, status: response.status, data };
};

const firstString = (...values: unknown[]) =>
  values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();

const providerErrorMessage = (status: number, data: Record<string, unknown>) => {
  const detail = data?.detail;
  const detailMessage = typeof detail === 'object' && detail !== null
    ? firstString(
      (detail as Record<string, unknown>).message,
      (detail as Record<string, unknown>).error,
      (detail as Record<string, unknown>).status
    )
    : undefined;

  if (status === 401 || status === 403) {
    return detailMessage
      || 'ElevenLabs rejected the API key configured in Supabase. Update ELEVENLABS_API_KEY in Edge Function secrets.';
  }

  return firstString(
    detail,
    detailMessage,
    data?.error,
    data?.message
  ) || 'AI voice provider request failed.';
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

  if (!enforceRateLimit(clientKey(request))) {
    return jsonResponse({ success: false, message: 'Too many AI voice requests. Please wait a few minutes and try again.' }, 429, origin);
  }

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return jsonResponse({ success: false, message: 'Invalid voice request payload.' }, 400, origin);
  }

  const toNumber = normalizePhoneNumber((body as Record<string, unknown>).to_number);
  if (!toNumber) {
    return jsonResponse({ success: false, message: 'Please enter a valid mobile number with country code.' }, 422, origin);
  }

  if (!isTruthyConsent((body as Record<string, unknown>).consent_accepted)) {
    return jsonResponse({
      success: false,
      message: 'Please confirm consent before requesting an AI voice call.'
    }, 422, origin);
  }

  const requestContext = {
    serviceInterest: cleanText((body as Record<string, unknown>).service_interest, 120) || 'General enquiry',
    intentSignals: cleanText((body as Record<string, unknown>).intent_signals, 200),
    pageUrl: cleanText((body as Record<string, unknown>).page_url, 500),
    consentText: cleanText((body as Record<string, unknown>).consent_text, 240)
      || 'User requested an AI voice call from the website chatbot.'
  };

  const apiKey = Deno.env.get('ELEVENLABS_API_KEY') || '';
  const agentId = Deno.env.get('ELEVENLABS_AGENT_ID') || '';

  if (!apiKey || !agentId) {
    return jsonResponse({
      success: false,
      message: 'AI voice calling is not configured in Supabase secrets.'
    }, 503, origin);
  }

  const provider = selectedProvider();
  const { payload: providerPayload, error: payloadError } = buildProviderPayload(provider, agentId, toNumber, requestContext);
  if (!providerPayload || payloadError) {
    return jsonResponse({ success: false, message: payloadError || 'AI voice provider is not configured.' }, 503, origin);
  }

  const providerResponse = await postToElevenLabs(provider, providerPayload, apiKey);
  if (!providerResponse.ok) {
    const message = providerErrorMessage(providerResponse.status, providerResponse.data);

    return jsonResponse({ success: false, message }, providerResponse.status || 502, origin);
  }

  return jsonResponse({
    success: true,
    channel: provider,
    data: providerResponse.data
  }, 200, origin);
});
