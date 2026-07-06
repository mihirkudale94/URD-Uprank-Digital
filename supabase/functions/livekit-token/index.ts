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
    const livekitUrl = Deno.env.get('LIVEKIT_URL') || Deno.env.get('VITE_LIVEKIT_URL');

    if (!apiKey || !apiSecret) {
      return jsonResponse({ error: 'LiveKit API key or secret is not configured on the server.' }, 500, origin);
    }

    // 1. Generate unique room and participant identity
    const participantName = `Visitor_${Math.floor(Math.random() * 10000)}`;
    const uniqueRoomId = crypto.randomUUID();
    const roomName = `support-room-${uniqueRoomId}`;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // The token grants permission to join a brand new, unique room
    at.addGrant({ roomJoin: true, room: roomName });
    const token = await at.toJwt();

    // 2. Explicitly dispatch the AI Agent to join this new room
    if (livekitUrl) {
      try {
        // We can dynamically import the client or use it from the SDK
        const { AgentDispatchClient } = await import('npm:livekit-server-sdk');
        const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
        
        // This is the exact name of your agent from the LiveKit Dashboard
        const agentName = 'up-rank-digitial-customer-support'; 
        
        await dispatchClient.createDispatch(roomName, agentName);
        console.log(`Dispatched agent ${agentName} to room ${roomName}`);
      } catch (dispatchErr) {
        console.error('Failed to dispatch agent automatically. It might already be dispatched by a Dashboard rule.', dispatchErr);
      }
    }

    return jsonResponse({ token }, 200, origin);
  } catch (error: any) {
    console.error('Error generating LiveKit token:', error);
    return jsonResponse({ error: error.message || 'Internal server error' }, 500, origin);
  }
});
