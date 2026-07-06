import { RoomServiceClient } from 'livekit-server-sdk';
import 'dotenv/config';

async function dispatchAgent() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const host = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !host) {
    console.error('Missing LiveKit environment variables.');
    process.exit(1);
  }

  const roomService = new RoomServiceClient(host, apiKey, apiSecret);
  
  const roomName = 'support-room-8006';
  const agentName = 'up-rank-digitial-customer-support'; // the exact name from the dashboard screenshot

  try {
    console.log(`Creating room '${roomName}' and explicitly dispatching agent '${agentName}'...`);
    
    // Explicitly create the room and dispatch the cloud agent to it
    await roomService.createRoom({
      name: roomName,
      emptyTimeout: 60 * 10,
      agents: [
        { agentName: agentName }
      ]
    });
    
    console.log(`✅ Success! The agent is now dispatched and waiting in ${roomName}.`);
    console.log('You can now click "Talk to Us" on your local website.');
  } catch (err) {
    console.error('Failed to create room/dispatch agent:', err);
  }
}

dispatchAgent();
