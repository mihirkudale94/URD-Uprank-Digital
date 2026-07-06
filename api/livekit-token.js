import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import crypto from 'crypto';

export default async function handler(req, res) {
  // CORS Headers for allowing requests from your frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;
    const livekitUrl = process.env.LIVEKIT_URL || process.env.VITE_LIVEKIT_URL;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: 'Missing LiveKit API keys' });
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
        const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
        
        // Exact name of the agent from the LiveKit Dashboard
        const agentName = 'up-rank-digitial-customer-support'; 
        
        await dispatchClient.createDispatch(roomName, agentName);
        console.log(`Dispatched agent ${agentName} to room ${roomName}`);
      } catch (dispatchErr) {
        console.error('Failed to dispatch agent:', dispatchErr.message);
      }
    }

    return res.status(200).json({ token });
  } catch (error) {
    console.error('Error generating token:', error);
    return res.status(500).json({ error: error.message });
  }
}
