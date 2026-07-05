import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader2, Mic, PhoneOff } from 'lucide-react';
import { useConversation } from '@elevenlabs/react';
import './VoiceAgentButton.css';

const ELEVENLABS_AGENT_ID = import.meta.env.VITE_ELEVENLABS_AGENT_ID || '';

export default function VoiceAgentButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const keepAliveRef = useRef(null);

  const stopKeepAlive = useCallback(() => {
    if (keepAliveRef.current) {
      window.clearInterval(keepAliveRef.current);
      keepAliveRef.current = null;
    }
  }, []);

  const {
    startSession,
    endSession,
    sendUserActivity,
    status,
    isSpeaking
  } = useConversation({
    onConnect: () => {
      console.log('Voice agent connected');
    },
    onDisconnect: () => {
      console.log('Voice agent disconnected');
      stopKeepAlive();
    },
    onError: (error) => {
      console.error('Voice agent error:', error);
      setErrorMessage('Voice agent connection lost. Please try again.');
    }
  });
  const isConnected = status === 'connected';

  const startKeepAlive = useCallback(() => {
    stopKeepAlive();
    keepAliveRef.current = window.setInterval(() => {
      try {
        sendUserActivity();
      } catch {
        stopKeepAlive();
      }
    }, 10000);
  }, [sendUserActivity, stopKeepAlive]);

  const startVoiceAgent = useCallback(async () => {
    if (isConnected || isConnecting) return;

    if (!ELEVENLABS_AGENT_ID) {
      setErrorMessage('Add VITE_ELEVENLABS_AGENT_ID to enable voice calls.');
      return;
    }

    setErrorMessage('');
    setIsConnecting(true);

    try {
      let chatHistoryText = '';
      try {
        const saved = sessionStorage.getItem('urd_assistant_messages');
        if (saved) {
          const parsed = JSON.parse(saved);
          chatHistoryText = parsed
            .filter((msg) => msg.content && ['assistant', 'user'].includes(msg.role))
            .map((msg) => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n')
            .slice(-1000);
        }
      } catch (err) {
        console.warn('Failed to parse chat history for voice agent:', err);
      }

      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionOptions = {
        agentId: ELEVENLABS_AGENT_ID,
        connectionType: 'webrtc'
      };

      if (chatHistoryText) {
        sessionOptions.dynamicVariables = {
          chat_history: chatHistoryText
        };
      }

      await startSession(sessionOptions);
      startKeepAlive();
    } catch (error) {
      console.error('Failed to start voice conversation:', error);
      if (error?.name === 'NotAllowedError') {
        setErrorMessage('Microphone is blocked. Open this page\'s browser site settings, set Microphone to Allow, refresh, and try again.');
      } else if (error?.name === 'NotFoundError') {
        setErrorMessage('No microphone was found. Connect a microphone and try again.');
      } else {
        setErrorMessage('Voice agent could not connect. Please try again.');
      }
    } finally {
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting, startKeepAlive, startSession]);

  const endVoiceAgent = useCallback(async () => {
    stopKeepAlive();
    await endSession();
  }, [endSession, stopKeepAlive]);

  useEffect(() => {
    const handleStartVoiceAgent = () => {
      startVoiceAgent();
    };

    window.addEventListener('startVoiceAgent', handleStartVoiceAgent);
    return () => {
      window.removeEventListener('startVoiceAgent', handleStartVoiceAgent);
      stopKeepAlive();
    };
  }, [startVoiceAgent, stopKeepAlive]);

  useEffect(() => {
    if (!isConnected) stopKeepAlive();
  }, [isConnected, stopKeepAlive]);

  return (
    <div className="voice-agent-shell">
      {isConnected && (
        <div className="voice-agent-status" role="status">
          <span className={isSpeaking ? 'is-speaking' : ''}></span>
          <strong>{isSpeaking ? 'Speaking...' : 'Listening...'}</strong>
          <small>Tap to end call</small>
        </div>
      )}

      {errorMessage && !isConnected && <p className="voice-agent-error">{errorMessage}</p>}

      <button
        type="button"
        className={`voice-agent-button ${isConnected ? 'is-connected' : ''}`}
        onClick={isConnected ? endVoiceAgent : startVoiceAgent}
        disabled={isConnecting}
        title={isConnected ? 'End voice call' : 'Talk to AI assistant'}
      >
        {!isConnected && !isConnecting && (
          <>
            <span className="voice-agent-ping"></span>
            <span className="voice-agent-pulse"></span>
          </>
        )}
        <span className="voice-agent-content">
          {isConnecting ? <Loader2 size={22} className="voice-agent-spin" /> : isConnected ? <PhoneOff size={22} /> : <Mic size={22} />}
          <span>{isConnecting ? 'Connecting...' : isConnected ? 'End Call' : 'Talk to Us'}</span>
        </span>
      </button>


    </div>
  );
}
