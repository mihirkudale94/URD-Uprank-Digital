import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { LiveKitRoom, RoomAudioRenderer, useVoiceAssistant, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import './VoiceAgentButton.css';

const LIVEKIT_URL = import.meta.env.VITE_LIVEKIT_URL || '';
const LIVEKIT_TOKEN_ENDPOINT = import.meta.env.VITE_LIVEKIT_TOKEN_ENDPOINT || '';
const LIVEKIT_TEST_TOKEN = import.meta.env.VITE_LIVEKIT_TEST_TOKEN || '';

function VoiceAgentButtonInner({ onEndCall }) {
  const { state: agentState } = useVoiceAssistant();
  const connectionState = useConnectionState();
  const isConnected = connectionState === ConnectionState.Connected;
  
  const isSpeaking = agentState === 'speaking';

  return (
    <>
      <RoomAudioRenderer />
      {isConnected && (
        <div className="voice-agent-status" role="status">
          <span className={isSpeaking ? 'is-speaking' : ''}></span>
          <strong>{isSpeaking ? 'Speaking...' : 'Listening...'}</strong>
          <small>Tap to end call</small>
        </div>
      )}

      <button
        type="button"
        className={`voice-agent-button ${isConnected ? 'is-connected' : ''}`}
        onClick={isConnected ? onEndCall : undefined}
        title={isConnected ? 'End voice call' : 'Talk to AI assistant'}
      >
        <span className="voice-agent-content">
          {isConnected ? <PhoneOff size={22} /> : <Mic size={22} />}
          <span>End Call</span>
        </span>
      </button>
    </>
  );
}

export default function VoiceAgentButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [token, setToken] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchToken = async () => {
    try {
      if (!LIVEKIT_TOKEN_ENDPOINT) {
        if (LIVEKIT_TEST_TOKEN) {
          console.warn('Using VITE_LIVEKIT_TEST_TOKEN. This should only be used for local development!');
          return LIVEKIT_TEST_TOKEN;
        }
        throw new Error('VITE_LIVEKIT_TOKEN_ENDPOINT or VITE_LIVEKIT_TEST_TOKEN is missing.');
      }
      const response = await fetch(LIVEKIT_TOKEN_ENDPOINT);
      if (!response.ok) throw new Error('Failed to fetch token');
      const data = await response.json();
      return data.token;
    } catch (e) {
      console.error(e);
      throw e;
    }
  };

  const startVoiceAgent = useCallback(async () => {
    if (isConnected || isConnecting) return;

    if (!LIVEKIT_URL) {
      setErrorMessage('Add VITE_LIVEKIT_URL to enable voice calls.');
      return;
    }

    setErrorMessage('');
    setIsConnecting(true);

    try {
      // 1. Fetch Token from the endpoint
      const newToken = await fetchToken();
      setToken(newToken);
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to start voice conversation:', error);
      setErrorMessage('Voice agent could not connect. Ensure token endpoint is valid.');
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);

  const endVoiceAgent = useCallback(() => {
    setIsConnected(false);
    setToken('');
  }, []);

  useEffect(() => {
    const handleStartVoiceAgent = () => {
      startVoiceAgent();
    };

    window.addEventListener('startVoiceAgent', handleStartVoiceAgent);
    return () => {
      window.removeEventListener('startVoiceAgent', handleStartVoiceAgent);
    };
  }, [startVoiceAgent]);

  if (isConnected && token) {
    return (
      <div className="voice-agent-shell">
        <LiveKitRoom
          serverUrl={LIVEKIT_URL}
          token={token}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={endVoiceAgent}
        >
          <VoiceAgentButtonInner onEndCall={endVoiceAgent} />
        </LiveKitRoom>
      </div>
    );
  }

  return (
    <div className="voice-agent-shell">
      {errorMessage && <p className="voice-agent-error">{errorMessage}</p>}

      <button
        type="button"
        className="voice-agent-button"
        onClick={startVoiceAgent}
        disabled={isConnecting}
        title="Talk to AI assistant"
      >
        {!isConnecting && (
          <>
            <span className="voice-agent-ping"></span>
            <span className="voice-agent-pulse"></span>
          </>
        )}
        <span className="voice-agent-content">
          {isConnecting ? <Loader2 size={22} className="voice-agent-spin" /> : <Mic size={22} />}
          <span>{isConnecting ? 'Connecting...' : 'Talk to Us'}</span>
        </span>
      </button>
    </div>
  );
}
