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
  PhoneCall,
  Search,
  Send,
  Sparkles,
  Target,
  X
} from 'lucide-react';
import {
  SERVICE_PLAYBOOK as rawPlaybook,
  getLeadIntentSignals,
  getServiceMatch as matchServiceByRules
} from '../utils/servicePlaybook';
import { captureChatbotLead } from '../utils/chatbotLeadCapture';
import { trackWebsiteEvent } from '../utils/analytics';
import './Chatbot.css';

const ADMIN_WHATSAPP_NUMBER = '919371116165';

const DEFAULT_WHATSAPP_MESSAGE = 'Hi URD team, I visited your website and would like guidance.';

const ICON_MAP = {
  digital: Globe2,
  marketing: Target,
  'ai-growth': Bot,
  advertising: Megaphone,
  content: Camera,
  software: Code2
};

const SERVICE_PLAYBOOK = rawPlaybook.map(service => ({
  ...service,
  icon: ICON_MAP[service.id] || Bot
}));

const TRUST_POINTS = [
  { icon: Sparkles, label: 'Service fit' },
  { icon: PhoneCall, label: 'WhatsApp handoff' },
  { icon: Check, label: 'Qualified callback' }
];

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

const getOfficeStatus = () => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'short',
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  }).formatToParts(new Date());
  const weekday = parts.find(part => part.type === 'weekday')?.value || 'Mon';
  const hour = Number(parts.find(part => part.type === 'hour')?.value || 0);
  const minute = Number(parts.find(part => part.type === 'minute')?.value || 0);
  const minutesNow = hour * 60 + minute;
  const isOpen = weekday !== 'Sun' && minutesNow >= 540 && minutesNow < 1140;

  return {
    isOpen,
    label: isOpen ? 'Team is online' : 'We will reply tomorrow',
    detail: isOpen
      ? 'The URD team is online and will follow up soon.'
      : 'The URD team will follow up during office hours.'
  };
};

const clean = (value, maxLength = 500) =>
  String(value || '').replace(/\s+/g, ' ').trim().slice(0, maxLength);

const mergeIntentSignals = (existing, incoming) => {
  const byId = new Map(existing.map(signal => [signal.id, signal]));
  incoming.forEach(signal => byId.set(signal.id, signal));
  return Array.from(byId.values()).slice(0, 4);
};

const getEnrichedServiceMatch = (query) => {
  const match = matchServiceByRules(query);
  if (!match) return null;
  return SERVICE_PLAYBOOK.find(service => service.id === match.id) || match;
};

const formatQualificationDetails = (details = {}) => [
  details.businessName ? `Business: ${details.businessName}` : '',
  details.website ? `Website/social: ${details.website}` : '',
  details.goal ? `Goal: ${details.goal}` : '',
  details.timeline ? `Timeline: ${details.timeline}` : '',
  details.budget ? `Budget: ${details.budget}` : ''
].filter(Boolean).join('\n');



const buildWhatsAppLink = (message = DEFAULT_WHATSAPP_MESSAGE) =>
  `https://wa.me/${ADMIN_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;



export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState([
    createBotMessage(
      'Hi, I am URD Copilot. I can help you choose the right service and send a clear requirement to the URD team.',
      [
        { label: 'Find my service', action: 'start-service-match' },
        { label: 'WhatsApp team', action: 'whatsapp' },
        { label: 'Request callback', action: 'callback' }
      ],
      'Fast service match'
    )
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [callbackState, setCallbackState] = useState('idle');
  const [callbackPhone, setCallbackPhone] = useState('');
  const [callbackNeed, setCallbackNeed] = useState('General enquiry');
  const [callbackDetails, setCallbackDetails] = useState({
    businessName: '',
    website: '',
    goal: '',
    timeline: '',
    budget: ''
  });

  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [leadSignals, setLeadSignals] = useState([]);
  const [officeStatus, setOfficeStatus] = useState(() => getOfficeStatus());

  const chatEndRef = useRef(null);

  const selectedService = useMemo(
    () => SERVICE_PLAYBOOK.find(service => service.id === selectedServiceId),
    [selectedServiceId]
  );

  const leadSignalSummary = useMemo(
    () => leadSignals.map(signal => signal.label).join(', '),
    [leadSignals]
  );

  const leadSignalLabels = useMemo(
    () => leadSignals.map(signal => signal.label),
    [leadSignals]
  );

  const qualificationSummary = useMemo(
    () => formatQualificationDetails(callbackDetails),
    [callbackDetails]
  );

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen, selectedServiceId]);

  useEffect(() => {
    if (isOpen) {
      setShowNotification(false);
      trackWebsiteEvent('chatbot_opened');
    }
  }, [isOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setOfficeStatus(getOfficeStatus());
    }, 60000);

    return () => window.clearInterval(timer);
  }, []);

  const updateCallbackDetail = (field, value) => {
    setCallbackDetails(prev => ({
      ...prev,
      [field]: clean(value, 160)
    }));
  };

  const buildVisitorHandoffMessage = () => {
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname.includes('localhost') || window.location.hostname === '127.0.0.1');

    return [
      DEFAULT_WHATSAPP_MESSAGE,
      '',
      `Service interest: ${selectedService?.title || callbackNeed || 'General enquiry'}`,
      qualificationSummary,
      leadSignalSummary ? `Intent signals: ${leadSignalSummary}` : '',
      isLocal ? '' : `Page: ${window.location.href.replace(/\/$/, '')}`
    ].filter(Boolean).join('\n');
  };

  const openWhatsApp = (messageOrEvent) => {
    const message = typeof messageOrEvent === 'string'
      ? messageOrEvent
      : buildVisitorHandoffMessage();

    trackWebsiteEvent('whatsapp_clicked', {
      service_interest: selectedService?.title || callbackNeed,
      intent_signals: leadSignalSummary
    });
    window.open(buildWhatsAppLink(message), '_blank');
  };

  const scrollToSection = (selector) => {
    document.querySelector(selector)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const addBotReply = (reply, delay = 450) => {
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, delay);
  };

  const getBotResponse = (query, detectedSignals = []) => {
    const input = query.toLowerCase();
    const matchedService = getEnrichedServiceMatch(query);

    if (matchedService) {
      setSelectedServiceId(matchedService.id);
      setCallbackNeed(matchedService.title);
      return createBotMessage(
        `${matchedService.title} is the closest fit.\n\n${matchedService.fit}\n\nBest next step: share your website/social link, goal, timeline, budget range, and WhatsApp number.`,
        [
          { label: 'WhatsApp team', action: 'whatsapp' },
          { label: 'Request callback', action: 'callback', value: matchedService.title },
          { label: 'See all services', action: 'scroll-services' }
        ],
        detectedSignals.length ? `Intent: ${detectedSignals.map(signal => signal.label).join(', ')}` : 'Recommended path'
      );
    }

    if (input.includes('price') || input.includes('cost') || input.includes('package') || input.includes('budget')) {
      return createBotMessage(
        'Pricing depends on scope, timeline, channels, content, integrations, and automation needs.\n\nFor a useful quote, send the requirement with your website, goal, timeline, and budget range.',
        [
          { label: 'WhatsApp team', action: 'whatsapp' },
          { label: 'Request callback', action: 'callback' },
          { label: 'Read FAQ', action: 'scroll-faq' }
        ],
        'Pricing guidance'
      );
    }

    if (input.includes('service') || input.includes('offer') || input.includes('what do you do')) {
      return createBotMessage(
        'URD helps with websites, performance marketing, paid ads, AI growth systems, content, and custom software.\n\nUse the service matcher if you are unsure.',
        [
          { label: 'Find my service', action: 'start-service-match' },
          { label: 'WhatsApp team', action: 'whatsapp' },
          { label: 'View services', action: 'scroll-services' }
        ],
        'Service overview'
      );
    }

    if (input.includes('contact') || input.includes('email') || input.includes('phone') || input.includes('call')) {
      return createBotMessage(
        'You can reach URD at sachin@uprankdigital.com or +91 93711 16165.\n\nFor the fastest response, send the requirement on WhatsApp or request a callback.',
        [
          { label: 'Open WhatsApp', action: 'whatsapp' },
          { label: 'Request callback', action: 'callback' },
          { label: 'Contact form', action: 'scroll-contact' }
        ],
        'Contact options'
      );
    }

    return createBotMessage(
      'Tell me what you want to improve: website, leads, ads, SEO, AI automation, content, software, or overall growth.',
      [
        { label: 'Find my service', action: 'start-service-match' },
        { label: 'WhatsApp team', action: 'whatsapp' },
        { label: 'Request callback', action: 'callback' }
      ],
      'Next best action'
    );
  };

  const handleSendMessage = (textToSend) => {
    const trimmedText = textToSend.trim();
    if (!trimmedText || callbackState !== 'idle') return;

    const detectedSignals = getLeadIntentSignals(trimmedText);
    if (detectedSignals.length) {
      setLeadSignals(prev => mergeIntentSignals(prev, detectedSignals));
      trackWebsiteEvent('chatbot_intent_detected', {
        intent_signals: detectedSignals.map(signal => signal.label).join(', ')
      });
    }

    setMessages(prev => [...prev, createUserMessage(trimmedText)]);
    setInputText('');
    addBotReply(getBotResponse(trimmedText, detectedSignals));
  };

  const handleAction = (action, value) => {
    if (action === 'callback') {
      setCallbackNeed(value || selectedService?.title || 'General enquiry');
      setCallbackState('inputting');
      trackWebsiteEvent('callback_form_opened', {
        service_interest: value || selectedService?.title || 'General enquiry'
      });
      return;
    }

    if (action === 'whatsapp') {
      openWhatsApp();
      return;
    }

    if (action === 'whatsapp-direct') {
      openWhatsApp(value);
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
      trackWebsiteEvent('service_matcher_started');
      setSelectedServiceId(null);
      setMessages(prev => [
        ...prev,
        createBotMessage(
          'Choose the closest need. I will recommend the service path and next handoff.',
          [
            ...SERVICE_PLAYBOOK.map(service => ({
              label: service.title,
              action: 'select-service',
              value: service.id
            })),
            { label: 'Overall Growth', action: 'send-text', value: 'I need help with overall growth and lead generation' }
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
      setCallbackNeed(service.title);
      trackWebsiteEvent('service_selected', {
        service_interest: service.title
      });
      setMessages(prev => [
        ...prev,
        createUserMessage(service.title),
        createBotMessage(
          `${service.title} is a strong fit.\n\n${service.fit}\n\nFor a sharp proposal, share your website/social link, goal, timeline, budget range, and WhatsApp number.`,
          [
            { label: 'WhatsApp team', action: 'whatsapp' },
            { label: 'Request callback', action: 'callback', value: service.title },
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

  const resetCallbackForm = () => {
    setCallbackPhone('');
    setCallbackDetails({
      businessName: '',
      website: '',
      goal: '',
      timeline: '',
      budget: ''
    });
  };

  const handleCallbackSubmit = async (event) => {
    event.preventDefault();
    if (!callbackPhone.trim()) return;

    setCallbackState('submitting');





    try {
      await captureChatbotLead({
        phone: callbackPhone.trim(),
        serviceInterest: callbackNeed,
        intentSignals: leadSignalLabels,
        source: 'chatbot_callback',
        preferredChannel: 'human_callback',
        transcriptSummary: qualificationSummary,
        notes: qualificationSummary,
        consentAccepted: false
      });
    } catch (err) {
      console.warn('Chatbot lead capture skipped:', err.message || err);
    }

    trackWebsiteEvent('callback_requested', {
      service_interest: callbackNeed,
      intent_signals: leadSignalSummary
    });

    // Short delay for UI smoothness
    window.setTimeout(() => {
      setCallbackState('success');
      setMessages(prev => [
        ...prev,
        createBotMessage(
          `Got it! I have saved your callback request for ${callbackNeed} at ${callbackPhone.trim()}.\n\nOur strategist will follow up soon. If you prefer instant chat on WhatsApp, feel free to use the button below:`,
          [
            { label: 'Chat on WhatsApp', action: 'whatsapp-direct', value: `Hi URD team, I just requested a callback for ${callbackNeed} at ${callbackPhone.trim()}.` },
            { label: 'Back to services', action: 'scroll-services' }
          ],
          'Callback requested'
        )
      ]);
      resetCallbackForm();
    }, 1000);
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
          <div className="chat-header-actions">
            <button className="chat-header-action" onClick={() => handleAction('callback')} aria-label="Request callback" title="Request callback">
              <PhoneCall size={15} />
            </button>
          </div>
        </div>

        <div className="chat-trust-strip" aria-label="URD chatbot capabilities">
          {TRUST_POINTS.map(({ icon: Icon, label }) => (
            <span key={label}>
              <Icon size={12} />
              {label}
            </span>
          ))}
        </div>

        <div className="chat-messages-container">
          {messages.map((msg, index) => (
            <div key={`${msg.timestamp}-${index}`} className={`msg-row ${msg.sender === 'user' ? 'user-row' : 'bot-row'}`}>
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
            <button className="suggestion-chip" onClick={() => handleAction('whatsapp')}>WhatsApp team</button>
            <button className="suggestion-chip" onClick={() => handleAction('callback')}>Request callback</button>
          </div>
        )}

        {callbackState !== 'idle' && (
          <div className="callback-overlay-card">
            {callbackState === 'success' ? (
              <div className="callback-success-view">
                <Check size={20} className="chk-circle" />
                <span>Request Submitted!</span>
                <p>We have saved your request. A strategist from our team will contact you shortly.</p>
                <button className="back-chat-btn" onClick={() => setCallbackState('idle')}>Back to chat</button>
              </div>
            ) : callbackState === 'submitting' ? (
              <div className="callback-success-view">
                <span>Saving request...</span>
                <p>Preparing the handoff for the URD team.</p>
              </div>
            ) : (
              <form onSubmit={handleCallbackSubmit} className="callback-form-inner">
                <span>Request a strategist callback</span>

                {leadSignalSummary && (
                  <div className="callback-intent-note">
                    <Sparkles size={13} />
                    <span>{leadSignalSummary}</span>
                  </div>
                )}

                <select value={callbackNeed} onChange={(e) => setCallbackNeed(e.target.value)}>
                  <option>General enquiry</option>
                  {SERVICE_PLAYBOOK.map(service => (
                    <option key={service.id}>{service.title}</option>
                  ))}
                </select>

                <div className="callback-qualification-grid">
                  <input
                    type="text"
                    placeholder="Business name"
                    value={callbackDetails.businessName}
                    onChange={(e) => updateCallbackDetail('businessName', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Website or social link"
                    value={callbackDetails.website}
                    onChange={(e) => updateCallbackDetail('website', e.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Main goal, e.g. more leads"
                    value={callbackDetails.goal}
                    onChange={(e) => updateCallbackDetail('goal', e.target.value)}
                  />
                  <select value={callbackDetails.timeline} onChange={(e) => updateCallbackDetail('timeline', e.target.value)}>
                    <option value="">Timeline</option>
                    <option value="Immediately">Immediately</option>
                    <option value="This month">This month</option>
                    <option value="1-3 months">1-3 months</option>
                    <option value="Exploring">Exploring</option>
                  </select>
                  <select value={callbackDetails.budget} onChange={(e) => updateCallbackDetail('budget', e.target.value)}>
                    <option value="">Budget range</option>
                    <option value="Need guidance">Need guidance</option>
                    <option value="Under INR 50k">Under INR 50k</option>
                    <option value="INR 50k-1L">INR 50k-1L</option>
                    <option value="INR 1L-3L">INR 1L-3L</option>
                    <option value="INR 3L+">INR 3L+</option>
                  </select>
                </div>

                <div className="callback-input-wrap">
                  <input
                    type="tel"
                    placeholder="Phone or WhatsApp number"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="submit" className="callback-send-btn" aria-label="Submit callback request">
                    <PhoneCall size={14} />
                  </button>
                </div>

                <p className="callback-privacy-note">
                  Your details are used only for this enquiry and shared with the URD team.
                </p>

                <div className="callback-divider"><span>or</span></div>

                <a href={buildWhatsAppLink(buildVisitorHandoffMessage())} target="_blank" rel="noopener noreferrer" className="whatsapp-callback-btn">
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
            placeholder="Ask about websites, leads, ads, SEO, AI, software..."
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
      </div>
    </div>
  );
}
