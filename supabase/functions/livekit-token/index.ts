import { AccessToken } from 'npm:livekit-server-sdk';

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const isAllowedOrigin = (origin: string) => {
  const configured = Deno.env.get('LIVEKIT_ALLOWED_ORIGINS') || Deno.env.get('ALLOWED_ORIGINS') || '';
  const allowed = configured
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return allowed.length === 0 || allowed.includes(origin);
};

const jsonResponse = (body: Record<string, unknown>, status = 200, origin = '') =>
  new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...(origin && isAllowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : corsHeaders)
    }
  });

Deno.serve(async (req) => {
  const origin = req.headers.get('origin') || '';

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        ...(origin && isAllowedOrigin(origin) ? { 'Access-Control-Allow-Origin': origin, Vary: 'Origin' } : {})
      }
    });
  }

  if (origin && !isAllowedOrigin(origin)) {
    return jsonResponse({ error: 'Request origin is not allowed.' }, 403, origin);
  }

  try {
    const apiKey = Deno.env.get('LIVEKIT_API_KEY');
    const apiSecret = Deno.env.get('LIVEKIT_API_SECRET');

    if (!apiKey || !apiSecret) {
      return jsonResponse({ error: 'LiveKit API key or secret is not configured on the server.' }, 500, origin);
    }

    // Assign a random identity to the anonymous visitor
    const participantName = `Visitor_${Math.floor(Math.random() * 10000)}`;
    const uniqueRoomId = crypto.randomUUID();

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // The token grants permission to join a brand new, unique room
    at.addGrant({ roomJoin: true, room: `support-room-${uniqueRoomId}` });

    const token = await at.toJwt();

    return jsonResponse({ token }, 200, origin);
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500, origin);
  }
});
