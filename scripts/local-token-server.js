import { createServer } from 'http';
import { AccessToken, AgentDispatchClient } from 'livekit-server-sdk';
import 'dotenv/config';

const port = 54321;

const server = createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === '/functions/v1/livekit-token' && (req.method === 'GET' || req.method === 'POST')) {
    try {
      const apiKey = process.env.LIVEKIT_API_KEY;
      const apiSecret = process.env.LIVEKIT_API_SECRET;
      const livekitUrl = process.env.LIVEKIT_URL;

      if (!apiKey || !apiSecret) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Missing LiveKit keys in .env' }));
        return;
      }

      const uniqueRoomId = crypto.randomUUID();
      const roomName = `support-room-${uniqueRoomId}`;
      const participantName = `Visitor_${Math.floor(Math.random() * 10000)}`;

      const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
      });

      at.addGrant({ roomJoin: true, room: roomName });
      const token = await at.toJwt();

      if (livekitUrl) {
        try {
          const dispatchClient = new AgentDispatchClient(livekitUrl, apiKey, apiSecret);
          const agentName = 'up-rank-digitial-customer-support'; 
          await dispatchClient.createDispatch(roomName, agentName);
          console.log(`[OK] Generated token and dispatched agent to ${roomName}`);
        } catch (dispatchErr) {
          console.error('[WARN] Agent dispatch failed (might already be dispatched by dashboard):', dispatchErr.message);
        }
      }

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ token }));
    } catch (error) {
      console.error(error);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: error.message }));
    }
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(port, () => {
  console.log(`Local LiveKit token server running at http://localhost:${port}/functions/v1/livekit-token`);
});
