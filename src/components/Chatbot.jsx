import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  Code2,
  Globe2,
  Megaphone,
  MessageSquare,
  Mic,
  MicOff,
  Phone,
  PhoneCall,
  Search,
  Send,
  Target,
  X
} from 'lucide-react';
import { ConversationProvider, useConversation } from '@elevenlabs/react';
import { SERVICE_PLAYBOOK as rawPlaybook } from '../utils/servicePlaybook';
import { normalizePhoneForVoice } from '../utils/phone';
import { isSupabaseConfigured, supabase } from '../utils/supabaseClient';
import './Chatbot.css';


const WHATSAPP_PREFILL_MESSAGE = 'Hi URD team, I visited your website and would like to know more about your services.';
const WHATSAPP_LINK = `https://wa.me/919371116165?text=${encodeURIComponent(WHATSAPP_PREFILL_MESSAGE)}`;
const ADMIN_WHATSAPP_NUMBER = '919371116165';
const ADMIN_EMAIL = 'sachin@uprankdigital.com';
const SUPABASE_VOICE_FUNCTION = import.meta.env.VITE_SUPABASE_VOICE_FUNCTION || 'request-voice-call';

const getIndiaDateParts = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(new Date());

  return {
    weekday: parts.find(part => part.type === 'weekday')?.value || 'Mon',
    hour: Number(parts.find(part => part.type === 'hour')?.value || 0),
    minute: Number(parts.find(part => part.type === 'minute')?.value || 0)
  };
};

const getOfficeStatus = () => {
  const { weekday, hour, minute } = getIndiaDateParts();
  const isSunday = weekday === 'Sun';
  const minutesNow = hour * 60 + minute;
  const opensAt = 9 * 60;
  const closesAt = 19 * 60;
  const isOpen = !isSunday && minutesNow >= opensAt && minutesNow < closesAt;

  if (isOpen) {
    return {
      isOpen: true,
      label: 'Team is online',
      detail: 'Replies are usually faster during office hours.'
    };
  }

  return {
    isOpen: false,
    label: 'We will reply tomorrow',
    detail: 'Leave your number and the URD team will follow up in office hours.'
  };
};

const buildCallbackLeadMessage = ({ phone, need }) => [
  'New callback request from URD website',
  '',
  `Phone: ${phone}`,
  `Service interest: ${need}`,
  `Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
  `Page: ${window.location.href}`
].join('\n');

const buildAdminWhatsAppLink = (message) =>
  `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

const buildAdminEmailLink = (message) =>
  `mailto:${ADMIN_EMAIL}?subject=${encodeURIComponent('New callback request from URD website')}&body=${encodeURIComponent(message)}`;

const ICON_MAP = {
  digital: Globe2,
  marketing: Target,
  'ai-growth': Bot,
  advertising: Megaphone,
  content: Camera,
  software: Code2
};

const SERVICE_PLAYBOOK = rawPlaybook.map(s => ({
  ...s,
  icon: ICON_MAP[s.id] || Bot
}));

const currentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const createBotMessage = (text, actions = [], meta = '') => ({
  sender: 'bot',
  text,
  actions,
  meta,
  timestamp: currentTime()
});

const createUserMessage = (text) => ({
  sender: 'user',
  text,
  timestamp: currentTime()
});

export default function Chatbot() {
  return (
    <ConversationProvider>
      <ChatbotInner />
    </ConversationProvider>
  );
}

function ChatbotInner() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState([
    createBotMessage(
      'Hi, I am URD Copilot. I can help you find the right service, understand pricing, or connect you with the team.',
      [
        { label: 'Find my service', action: 'start-service-match' },
        { label: 'View services', action: 'scroll-services' },
        { label: 'Read FAQ', action: 'scroll-faq' },
        { label: 'Talk on WhatsApp', action: 'whatsapp' }
      ],
      'Typical reply time: under 24 hours'
    )
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callbackState, setCallbackState] = useState('idle');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNeed, setCallbackNeed] = useState('General enquiry');
  const [latestLeadMessage, setLatestLeadMessage] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [officeStatus, setOfficeStatus] = useState(() => getOfficeStatus());

  // ElevenLabs Integration States
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState([]);
  const [callbackType, setCallbackType] = useState('human'); // 'human' | 'ai'
  const [callbackError, setCallbackError] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // ElevenLabs local config
  const [elevenLabsConfig] = useState(() => {
    return {
      agentId: import.meta.env.VITE_ELEVENLABS_AGENT_ID || localStorage.getItem('urd_elevenlabs_agent_id') || ''
    };
  });

  // Demo mode / simulation states
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoStatus, setDemoStatus] = useState('disconnected'); // 'disconnected' | 'connecting' | 'connected'
  const [isSpeakingSimulated, setIsSpeakingSimulated] = useState(false);
  const [recognitionInstance, setRecognitionInstance] = useState(null);

  const chatEndRef = useRef(null);

  const selectedService = useMemo(
    () => SERVICE_PLAYBOOK.find(service => service.id === selectedServiceId),
    [selectedServiceId]
  );
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen, selectedServiceId]);

  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOfficeStatus(getOfficeStatus());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const voiceTranscriptRef = useRef([]);
  useEffect(() => {
    voiceTranscriptRef.current = voiceTranscript;
  }, [voiceTranscript]);

  // Real ElevenLabs Hook integration
  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs Connected');
      setVoiceTranscript([{ text: 'Connected to AI voice agent. Speak now...', sender: 'bot' }]);
    },
    onDisconnect: () => {
      console.log('ElevenLabs Disconnected');
      const finalTranscript = voiceTranscriptRef.current;
      if (finalTranscript.length > 0) {
        const summary = finalTranscript
          .map(t => `${t.sender === 'user' ? 'You' : 'AI'}: ${t.text}`)
          .join('\n');
        setMessages(prev => [
          ...prev,
          createBotMessage(
            `Voice call summary:\n\n${summary}`,
            [],
            'Voice session ended'
          )
        ]);
      }
    },
    onMessage: (msg) => {
      // msg = { message: string, source: 'user' | 'ai' }
      if (msg.message && msg.source) {
        setVoiceTranscript(prev => [...prev, { text: msg.message, sender: msg.source === 'user' ? 'user' : 'bot' }]);
      }
    },
    onError: (err) => {
      console.error('ElevenLabs Error:', err);
      setVoiceTranscript(prev => [
        ...prev,
        { text: `Connection error: ${err.message || err || 'Failed to connect'}`, sender: 'bot' }
      ]);
    }
  });

  // Simulated Speech recognition engine for Demo Mode
  const startSimulatedSpeechRecognition = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) return;

    try {
      const rec = new Recognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (transcript && transcript.trim()) {
          handleSimulatedUserInput(transcript);
        }
      };

      rec.onend = () => {
        // If still active, continue listening
        if (showVoiceCall && !isSpeakingSimulated && !isMuted) {
          setTimeout(() => {
            try {
              rec.start();
            } catch {}
          }, 800);
        }
      };

      rec.start();
      setRecognitionInstance(rec);
    } catch (err) {
      console.warn('Browser speech recognition not supported or denied:', err);
    }
  };

  const handleSimulatedUserInput = (text) => {
    setVoiceTranscript(prev => [...prev, { text, sender: 'user' }]);
    
    // Simulate thinking/response latency
    setTimeout(() => {
      let reply = '';
      const lower = text.toLowerCase();
      
      if (lower.includes('rag') || lower.includes('retrieval')) {
        reply = "Retrieval-Augmented Generation, or RAG, is an AI architecture that retrieves relevant documents from an external database to ground the LLM, ensuring factual, hallucination-free answers.";
      } else if (lower.includes('ai growth') || lower.includes('growth strategy')) {
        reply = "AI Growth refers to integrating custom AI agents, automated operations, and machine learning models directly into your business to scale customer acquisition and cut costs.";
      } else if (lower.includes('seo') || lower.includes('search engine')) {
        reply = "SEO involves optimizing site architecture, speed, and content relevancy to rank highly on search engines like Google, capturing free, high-intent organic traffic.";
      } else if (lower.includes('cro') || lower.includes('conversion')) {
        reply = "Conversion Rate Optimization, or CRO, is the practice of designing, testing, and refining landing pages to convert a higher percentage of visitors into active leads or sales.";
      } else if (lower.includes('software') || lower.includes('app') || lower.includes('code') || lower.includes('program')) {
        reply = "URD builds custom web applications, native mobile apps, and headless CMS integrations. We focus on modern frameworks, clean code, and API scalability.";
      } else if (lower.includes('marketing') || lower.includes('lead') || lower.includes('ads') || lower.includes('google') || lower.includes('meta')) {
        reply = "Our growth campaigns drive target traffic using high-intent Google PPC, paid social advertising on Meta and LinkedIn, and automated analytics funnels.";
      } else if (lower.includes('ai') || lower.includes('automation') || lower.includes('chatbot') || lower.includes('copilot')) {
        reply = "We integrate custom AI agents, LLMs, and voice assistants into websites to automate customer support and optimize user workflows.";
      } else if (lower.includes('price') || lower.includes('cost') || lower.includes('package') || lower.includes('budget')) {
        reply = "Pricing depends on your project goals and scope. We suggest scheduling a callback so our strategist can prepare a custom proposal for you.";
      } else {
        reply = "I'm currently in Demo Mode. To enable live web search and allow me to answer any custom technical question, please enter your real ElevenLabs Agent ID.";
      }

      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(reply);
        const voices = window.speechSynthesis.getVoices();
        const englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) || voices[0];
        if (englishVoice) utterance.voice = englishVoice;
        
        utterance.onstart = () => setIsSpeakingSimulated(true);
        utterance.onend = () => {
          setIsSpeakingSimulated(false);
          startSimulatedSpeechRecognition();
        };
        utterance.onerror = () => setIsSpeakingSimulated(false);

        window.speechSynthesis.speak(utterance);
      }

      setVoiceTranscript(prev => [...prev, { text: reply, sender: 'bot' }]);
    }, 1000);
  };

  const startVoiceSession = async () => {
    setVoiceTranscript([]);
    setShowVoiceCall(true);
    const hasAgentId = !!elevenLabsConfig.agentId;

    if (hasAgentId) {
      setIsDemoMode(false);
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        await conversation.startSession({
          agentId: elevenLabsConfig.agentId
        });
      } catch (err) {
        console.error('Failed to start real session:', err);
        setVoiceTranscript([{ text: `Error: ${err.message || 'Microphone access denied.'}`, sender: 'bot' }]);
      }
    } else {
      setIsDemoMode(true);
      setDemoStatus('connecting');
      setVoiceTranscript([{ text: 'Connecting to Demo AI Voice Agent...', sender: 'bot' }]);

      setTimeout(() => {
        setDemoStatus('connected');
        const welcome = "Hi there! I am Jon, URD's AI Growth Copilot. I can answer any technical questions about websites, SEO, performance marketing, ads, or AI growth. How can I help you today?";
        
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(welcome);
          const voices = window.speechSynthesis.getVoices();
          const englishVoice = voices.find(v => v.lang.startsWith('en-US') || v.lang.startsWith('en-GB')) || voices[0];
          if (englishVoice) utterance.voice = englishVoice;
          
          utterance.onstart = () => setIsSpeakingSimulated(true);
          utterance.onend = () => {
            setIsSpeakingSimulated(false);
            startSimulatedSpeechRecognition();
          };
          utterance.onerror = () => setIsSpeakingSimulated(false);

          window.speechSynthesis.speak(utterance);
        } else {
          setVoiceTranscript(prev => [...prev, { text: welcome, sender: 'bot' }]);
        }
      }, 1500);
    }
  };

  const endVoiceSession = async () => {
    const hasAgentId = !!elevenLabsConfig.agentId;
    if (!isDemoMode && hasAgentId) {
      await conversation.endSession();
    } else {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setIsSpeakingSimulated(false);
      setDemoStatus('disconnected');
      if (recognitionInstance) {
        recognitionInstance.stop();
      }

      const finalTranscript = voiceTranscriptRef.current;
      if (finalTranscript.length > 0) {
        const summary = finalTranscript
          .map(t => `${t.sender === 'user' ? 'You' : 'AI'}: ${t.text}`)
          .join('\n');
        setMessages(prev => [
          ...prev,
          createBotMessage(
            `Voice call summary (Demo Mode):\n\n${summary}`,
            [],
            'Voice session ended'
          )
        ]);
      }
    }
    setShowVoiceCall(false);
  };

  const handleInitiateAICall = async () => {
    setCallbackState('submitting');
    setCallbackError('');
    const normalizedPhone = normalizePhoneForVoice(callbackPhone);

    if (!normalizedPhone) {
      setCallbackError('Please enter a valid phone number with country code, for example +919371116165.');
      setCallbackState('error_ai');
      return;
    }
    
    try {
      if (!isSupabaseConfigured) {
        throw new Error('Supabase is not configured for AI voice requests.');
      }

      const { error } = await supabase.functions.invoke(SUPABASE_VOICE_FUNCTION, {
        body: {
          to_number: normalizedPhone
        }
      });

      if (error) {
        throw new Error(error.message || 'AI voice request failed.');
      }

      setCallbackState('success_ai');
      setMessages(prev => [
        ...prev,
        createBotMessage(
          `AI mobile voice call request sent to ${normalizedPhone}.\n\nOur AI Growth Copilot will call through the active ElevenLabs telephony provider.`,
          [],
          'AI voice connected'
        )
      ]);
      setCallbackPhone('');
    } catch (err) {
      console.error('AI call failure:', err);
      setCallbackError(err.message || 'Failed to initiate the AI voice call. Please check your network or credentials.');
      setCallbackState('error_ai');
    }
  };

  const openWhatsApp = () => {
    window.open(WHATSAPP_LINK, '_blank');
  };

  const scrollToSection = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const addBotReply = (reply, delay = 650) => {
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, delay);
  };

  const getServiceMatch = (input) => {
    return SERVICE_PLAYBOOK.find(service =>
      service.aliases.some(alias => input.includes(alias))
    );
  };

  const getBotResponse = (query) => {
    const input = query.toLowerCase();
    const matchedService = getServiceMatch(input);

    if (matchedService) {
      setSelectedServiceId(matchedService.id);
      return createBotMessage(
        `${matchedService.title} looks like the closest fit.\n\n${matchedService.fit}\n\nGood next step: share your business goal, current website/social link, and timeline so URD can recommend the right scope.`,
        [
          { label: 'Request callback', action: 'callback' },
          { label: 'WhatsApp team', action: 'whatsapp' },
          { label: 'See all services', action: 'scroll-services' }
        ],
        'Recommended service'
      );
    }

    if (input.includes('service') || input.includes('offer') || input.includes('what do you do')) {
      return createBotMessage(
        'URD helps businesses grow across six core areas: Digital & UI/UX, Performance Marketing, AI Growth & CRO, Paid Advertising, Content Design, and Custom Software.\n\nIf you are unsure where to start, use the service matcher and I will narrow it down.',
        [
          { label: 'Start service matcher', action: 'start-service-match' },
          { label: 'Open services section', action: 'scroll-services' }
        ],
        'Service overview'
      );
    }

    if (input.includes('price') || input.includes('cost') || input.includes('package') || input.includes('budget')) {
      return createBotMessage(
        'Pricing depends on scope, timeline, and channels. A website redesign, paid campaign, content shoot, and custom software build need very different plans.\n\nThe fastest path is to share your goal and budget range, then URD can suggest a practical starting scope.',
        [
          { label: 'Read FAQ', action: 'scroll-faq' },
          { label: 'Request callback', action: 'callback' },
          { label: 'WhatsApp team', action: 'whatsapp' }
        ],
        'Pricing guidance'
      );
    }

    if (input.includes('faq') || input.includes('question') || input.includes('questions') || input.includes('timeline') || input.includes('own') || input.includes('ownership') || input.includes('report')) {
      return createBotMessage(
        'The FAQ covers common pre-sales questions about pricing, timelines, account ownership, AI use, reporting, and how URD starts a project.\n\nYou can scan it quickly before booking a call.',
        [
          { label: 'Open FAQ', action: 'scroll-faq' },
          { label: 'Request callback', action: 'callback' },
          { label: 'Open contact form', action: 'scroll-contact' }
        ],
        'Helpful answers'
      );
    }

    if (input.includes('contact') || input.includes('email') || input.includes('phone') || input.includes('call')) {
      return createBotMessage(
        'You can reach URD at sachin@uprankdigital.com or +91 93711 16165.\n\nFor a faster handoff, request a callback or start a WhatsApp conversation.',
        [
          { label: 'Request callback', action: 'callback' },
          { label: 'Open WhatsApp', action: 'whatsapp' },
          { label: 'Open contact form', action: 'scroll-contact' }
        ],
        'Contact options'
      );
    }

    if (input.includes('about') || input.includes('urd') || input.includes('uprank') || input.includes('company') || input.includes('sachin')) {
      return createBotMessage(
        'Uprank Digital (URD Solutions) is a digital growth company for businesses that need measurable marketing, stronger websites, AI-supported growth strategy, better content, and scalable digital systems.\n\nURD works as a strategy and execution partner across e-commerce, B2B, SaaS, sports clubs, and service-led brands.',
        [
          { label: 'View services', action: 'scroll-services' },
          { label: 'Talk to URD', action: 'callback' }
        ],
        'About URD'
      );
    }

    return createBotMessage(
      'I can help with service selection, pricing direction, contact details, or a quick project handoff.\n\nTell me what you want to improve: website, leads, AI growth, conversion rate, analytics, ads, content, software, or overall growth.',
      [
        { label: 'Find my service', action: 'start-service-match' },
        { label: 'Request callback', action: 'callback' },
        { label: 'WhatsApp team', action: 'whatsapp' }
      ],
      'Next best action'
    );
  };

  const handleSendMessage = (textToSend) => {
    if (!textToSend.trim() || callbackState !== 'idle') return;

    const trimmedText = textToSend.trim();
    setMessages(prev => [...prev, createUserMessage(trimmedText)]);
    setInputText('');
    addBotReply(getBotResponse(trimmedText));
  };

  const handleAction = (action, value) => {
    if (action === 'callback') {
      setCallbackNeed(value || selectedService?.title || 'General enquiry');
      setCallbackState('inputting');
      return;
    }

    if (action === 'whatsapp') {
      openWhatsApp();
      return;
    }

    if (action === 'scroll-services') {
      scrollToSection('#services');
      return;
    }

    if (action === 'scroll-contact') {
      scrollToSection('#contact');
      return;
    }

    if (action === 'scroll-faq') {
      scrollToSection('#faq');
      return;
    }

    if (action === 'start-service-match') {
      setSelectedServiceId(null);
      setMessages(prev => [
        ...prev,
        createBotMessage(
          'Choose the area that sounds closest to your current need. If you are unsure, choose Overall Growth.',
          [
            ...SERVICE_PLAYBOOK.map(service => ({
              label: service.title,
              action: 'select-service',
              value: service.id
            })),
            { label: 'Overall Growth', action: 'send-text', value: 'I need help with overall growth' }
          ],
          'Service matcher'
        )
      ]);
      return;
    }

    if (action === 'select-service') {
      const service = SERVICE_PLAYBOOK.find(item => item.id === value);
      if (!service) return;
      setSelectedServiceId(service.id);
      setMessages(prev => [
        ...prev,
        createUserMessage(service.title),
        createBotMessage(
          `${service.title} is a strong fit.\n\n${service.fit}\n\nWhat helps URD respond well: your business name, website or social link, goal, timeline, and any budget range you are comfortable sharing.`,
          [
            { label: 'Request callback', action: 'callback', value: service.title },
            { label: 'WhatsApp team', action: 'whatsapp' },
            { label: 'Contact form', action: 'scroll-contact' }
          ],
          'Recommended path'
        )
      ]);
      return;
    }

    if (action === 'send-text') {
      handleSendMessage(value);
    }
  };

  const handleCallbackSubmit = (e) => {
    e.preventDefault();
    if (!callbackPhone.trim()) return;

    if (callbackType === 'ai') {
      handleInitiateAICall();
      return;
    }

    const leadMessage = buildCallbackLeadMessage({
      phone: callbackPhone.trim(),
      need: callbackNeed
    });
    setLatestLeadMessage(leadMessage);
    window.open(buildAdminWhatsAppLink(leadMessage), '_blank');

    setCallbackState('submitting');
    setTimeout(() => {
      setCallbackState('success');
      setMessages(prev => [
        ...prev,
        createBotMessage(
          `Callback request recorded for ${callbackPhone}.\n\nTopic: ${callbackNeed}\n\n${officeStatus.isOpen ? 'The URD team is online and will follow up soon.' : 'The URD team will follow up during office hours.'}`,
          [
            { label: 'Back to services', action: 'scroll-services' },
            { label: 'Open WhatsApp', action: 'whatsapp' }
          ],
          'Callback requested'
        )
      ]);
      setCallbackPhone('');
    }, 650);
  };

  return (
    <div className="chatbot-wrapper">
      <button
        className={`chat-toggle-bubble ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle URD growth chat"
      >
        {isOpen ? <X size={23} /> : <MessageSquare size={23} />}
        {showNotification && !isOpen && <span className="notif-badge">1</span>}
      </button>

      <div className={`chat-drawer-window glass-card ${isOpen ? 'visible' : ''}`}>
        <div className="chat-header">
          <div className="chat-avatar-box">
            <MessageSquare size={16} className="avatar-chat-icon" />
            <div className="avatar-glow"></div>
          </div>
          <div className="chat-header-info">
            <h4>URD Copilot</h4>
            <div className={`online-indicator ${officeStatus.isOpen ? 'is-open' : 'is-closed'}`}>
              <span className="g-dot"></span>
              <span>{officeStatus.label}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            <button className="chat-header-action" onClick={startVoiceSession} aria-label="Start AI Voice Call" title="Start AI Voice Chat">
              <Mic size={15} />
            </button>
            <button className="chat-header-action" onClick={openWhatsApp} aria-label="Open WhatsApp" title="WhatsApp Business">
              <PhoneCall size={15} />
            </button>
          </div>
        </div>

        <div className="chat-messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`msg-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
              <div className="msg-bubble">
                {msg.meta && <span className="msg-meta">{msg.meta}</span>}
                <p>{msg.text}</p>
                {msg.actions?.length > 0 && (
                  <div className="message-actions">
                    {msg.actions.map((action, actionIndex) => (
                      <button
                        key={`${action.label}-${actionIndex}`}
                        className="message-action-btn"
                        onClick={() => handleAction(action.action, action.value)}
                      >
                        {action.label}
                        <ArrowRight size={12} />
                      </button>
                    ))}
                  </div>
                )}
                <span className="msg-time">{msg.timestamp}</span>
              </div>
            </div>
          ))}

          {selectedService && callbackState === 'idle' && (
            <div className="service-summary-card">
              <div className="service-summary-head">
                <selectedService.icon size={16} />
                <span>{selectedService.title}</span>
              </div>
              <p>{selectedService.fit}</p>
              <ul>
                {selectedService.bullets.map(bullet => <li key={bullet}>{bullet}</li>)}
              </ul>
            </div>
          )}

          {isTyping && (
            <div className="msg-row bot-row">
              <div className="msg-bubble typing-bubble">
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
                <span className="typing-dot"></span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {callbackState === 'idle' && (
          <div className="chat-suggestion-chips">
            <button className="suggestion-chip priority" onClick={() => handleAction('start-service-match')}>Find my service</button>
            <button className="suggestion-chip" onClick={() => handleSendMessage('What services do you offer?')}>Services</button>
            <button className="suggestion-chip" onClick={() => handleSendMessage('I need AI growth and conversion optimization')}>AI Growth</button>
            <button className="suggestion-chip" onClick={() => handleSendMessage('What is the pricing?')}>Pricing</button>
            <button className="suggestion-chip" onClick={() => handleAction('scroll-faq')}>FAQ</button>
            <button className="suggestion-chip" onClick={() => handleAction('whatsapp')}>WhatsApp</button>
          </div>
        )}

        {callbackState !== 'idle' && (
          <div className="callback-overlay-card">
            {callbackState === 'success' ? (
              <div className="callback-success-view">
                <Check size={20} className="chk-circle" />
                <span>Request saved</span>
                <p>{officeStatus.detail}</p>
                {latestLeadMessage && (
                  <div className="admin-handoff-actions">
                    <a href={buildAdminWhatsAppLink(latestLeadMessage)} target="_blank" rel="noopener noreferrer">
                      Send to WhatsApp admin
                    </a>
                    <a href={buildAdminEmailLink(latestLeadMessage)}>
                      Email admin
                    </a>
                  </div>
                )}
                <button className="back-chat-btn" onClick={() => setCallbackState('idle')}>Back to chat</button>
              </div>
            ) : callbackState === 'success_ai' ? (
              <div className="callback-success-view">
                <Check size={20} className="chk-circle" />
                <span>AI Call Initiated!</span>
                <p>Our AI Voice Agent is dialing your number now to answer your technical questions.</p>
                <button className="back-chat-btn" onClick={() => setCallbackState('idle')}>Back to chat</button>
              </div>
            ) : callbackState === 'error_ai' ? (
              <div className="callback-success-view">
                <X size={20} style={{ color: '#ef4444' }} />
                <span style={{ color: '#ef4444' }}>AI Call Failed</span>
                <p style={{ fontSize: '0.74rem', margin: '0.4rem 0', color: 'var(--text-muted)' }}>{callbackError}</p>
                <button className="back-chat-btn" onClick={() => setCallbackState('inputting')} style={{ color: 'var(--primary)', fontWeight: '800' }}>Try again</button>
                <button className="back-chat-btn" onClick={() => setCallbackState('idle')} style={{ marginTop: '0.2rem' }}>Cancel</button>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="callback-form-inner">
                <span>Request a quick callback</span>
                
                {/* AI / Human Callback selector */}
                <div className="callback-type-selector" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.4rem', margin: '0.2rem 0' }}>
                  <button
                    type="button"
                    className={`callback-type-btn ${callbackType === 'human' ? 'active' : ''}`}
                    onClick={() => setCallbackType('human')}
                    style={{
                      background: callbackType === 'human' ? 'var(--gradient-accent)' : 'var(--bg-hover-pills)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: callbackType === 'human' ? '0 2px 6px rgba(247, 151, 31, 0.3)' : 'none'
                    }}
                  >
                    Human Call
                  </button>
                  <button
                    type="button"
                    className={`callback-type-btn ${callbackType === 'ai' ? 'active' : ''}`}
                    onClick={() => setCallbackType('ai')}
                    style={{
                      background: callbackType === 'ai' ? 'var(--gradient-accent)' : 'var(--bg-hover-pills)',
                      border: '1px solid var(--border-color)',
                      color: '#fff',
                      fontSize: '0.72rem',
                      fontWeight: '800',
                      padding: '0.45rem',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      boxShadow: callbackType === 'ai' ? '0 2px 6px rgba(247, 151, 31, 0.3)' : 'none'
                    }}
                  >
                    AI Voice Call (Instant)
                  </button>
                </div>

                <select value={callbackNeed} onChange={(e) => setCallbackNeed(e.target.value)}>
                  <option>General enquiry</option>
                  {SERVICE_PLAYBOOK.map(service => (
                    <option key={service.id}>{service.title}</option>
                  ))}
                </select>
                <div className="callback-input-wrap">
                  <input
                    type="tel"
                    placeholder={callbackType === 'ai' ? "Phone number with country code" : "Phone number"}
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="submit" className="callback-send-btn">
                    {callbackType === 'ai' ? <Phone size={14} /> : <PhoneCall size={14} />}
                  </button>
                </div>
                <p className="callback-privacy-note">
                  {callbackType === 'ai' 
                    ? "Our AI voice agent will call instantly through the active ElevenLabs calling integration."
                    : "Your number is used only for this callback request and is shared with the URD team."
                  }
                </p>

                <div className="callback-divider"><span>or</span></div>

                <a href={WHATSAPP_LINK} target="_blank" rel="noopener noreferrer" className="whatsapp-callback-btn">
                  Chat on WhatsApp
                </a>

                <button type="button" className="cancel-callback-btn" onClick={() => setCallbackState('idle')}>Cancel</button>
              </form>
            )}
          </div>
        )}

        <div className="chat-input-footer">
          <Search size={15} className="input-search-icon" />
          <input
            type="text"
            placeholder="Ask about websites, AI, CRO, ads, SEO, content..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(inputText)}
            disabled={callbackState !== 'idle'}
          />
          <button
            onClick={() => handleSendMessage(inputText)}
            disabled={!inputText.trim() || callbackState !== 'idle'}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>

        {/* Voice Call Overlay */}
        {showVoiceCall && (
          <div className="voice-call-overlay">
            <div className="voice-call-header">
              <span>AI VOICE AGENT</span>
              <button onClick={endVoiceSession} aria-label="End Voice Call"><X size={16} /></button>
            </div>
            
            <div className="voice-call-body">
              {/* Fluid Liquid Morphing Orb */}
              <div className={`voice-orb-container ${
                isDemoMode 
                  ? (demoStatus === 'connecting' ? 'connecting' : (isSpeakingSimulated ? 'speaking' : 'listening')) 
                  : (conversation.status === 'connecting' ? 'connecting' : (conversation.status === 'connected' ? (conversation.isSpeaking ? 'speaking' : 'listening') : 'listening'))
              }`}>
                <div className="voice-orb-layer-2"></div>
                <div className="voice-orb-layer-1"></div>
                <div className="voice-orb"></div>
              </div>
              
              <span className="voice-status-text">
                {isDemoMode 
                  ? (demoStatus === 'connecting' ? 'Connecting to Demo...' : (isSpeakingSimulated ? 'AI Agent Speaking...' : 'Listening... Speak now'))
                  : (conversation.status === 'connecting' ? 'Connecting to Agent...' : (conversation.status === 'connected' ? (conversation.isSpeaking ? 'AI Agent Speaking...' : 'Listening... Speak now') : 'Offline'))
                }
              </span>
              
              {/* Live transcript scrolling box */}
              <div className="voice-transcript-box">
                {voiceTranscript.length === 0 ? (
                  <p className="voice-transcript-placeholder">Start speaking or ask a technical question below...</p>
                ) : (
                  voiceTranscript.map((t, idx) => (
                    <div key={idx} className={`voice-transcript-line ${t.sender}`}>
                      <strong>{t.sender === 'user' ? 'You: ' : 'AI: '}</strong>
                      <span>{t.text}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Simulated / Demo chips */}
            {isDemoMode && demoStatus === 'connected' && (
              <div className="voice-suggestion-chips">
                <span className="chips-label">Technical Topics:</span>
                <div className="chips-scroll">
                  <button onClick={() => handleSimulatedUserInput('How do you build custom software?')} className="voice-chip">Custom Software</button>
                  <button onClick={() => handleSimulatedUserInput('What is performance marketing?')} className="voice-chip">Performance Marketing</button>
                  <button onClick={() => handleSimulatedUserInput('How can AI optimize my marketing?')} className="voice-chip">AI & Automation</button>
                  <button onClick={() => handleSimulatedUserInput('What is the pricing for a website?')} className="voice-chip">Pricing / Budget</button>
                </div>
              </div>
            )}
            
            <div className="voice-call-footer">
              <button 
                className={`voice-action-btn mute-btn ${conversation.isMuted || isMuted ? 'muted' : ''}`}
                onClick={() => {
                  if (isDemoMode) {
                    setIsMuted(!isMuted);
                    if (recognitionInstance) {
                      if (!isMuted) {
                        recognitionInstance.stop();
                      } else {
                        startSimulatedSpeechRecognition();
                      }
                    }
                  } else {
                    conversation.setMuted(!conversation.isMuted);
                  }
                }}
                aria-label="Mute Microphone"
              >
                {conversation.isMuted || isMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              
              <button className="voice-action-btn hangup-btn" onClick={endVoiceSession} aria-label="End Call">
                <Phone size={18} style={{ transform: 'rotate(135deg)' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
