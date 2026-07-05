import { AccessToken } from 'livekit-server-sdk';
import 'dotenv/config';

async function generateToken() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    console.error('Error: LIVEKIT_API_KEY and LIVEKIT_API_SECRET must be set in your .env file.');
    process.exit(1);
  }

  const participantName = `LocalTester_${Math.floor(Math.random() * 10000)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
  });

  const roomName = `support-room-${Math.floor(Math.random() * 10000)}`;
  at.addGrant({ roomJoin: true, room: roomName });

  const token = await at.toJwt();
  
  console.log('\n✅ Successfully generated a local LiveKit token for testing:\n');
  console.log(token);
  console.log('\n----------------------------------------');
  console.log('To use this token in development:');
  console.log('1. Open your frontend `.env` file.');
  console.log('2. Add VITE_LIVEKIT_TEST_TOKEN=eyJ... to test locally without an endpoint.');
  console.log('----------------------------------------\n');
}

generateToken();
