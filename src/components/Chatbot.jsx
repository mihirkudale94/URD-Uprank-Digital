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
  ShieldCheck,
  Target,
  X
} from 'lucide-react';

const WHATSAPP_PREFILL_MESSAGE = 'Hi URD team, I visited your website and would like to know more about your services.';
const WHATSAPP_LINK = `https://wa.me/919371116165?text=${encodeURIComponent(WHATSAPP_PREFILL_MESSAGE)}`;
const ADMIN_WHATSAPP_NUMBER = '919371116165';
const ADMIN_EMAIL = 'sachin@uprankdigital.com';

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
  const opensAt = 10 * 60;
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

const SERVICE_PLAYBOOK = [
  {
    id: 'digital',
    title: 'Digital & UI/UX',
    icon: Globe2,
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'ecommerce', 'shopify'],
    fit: 'Best for new websites, redesigns, landing pages, and conversion-focused digital experiences.',
    bullets: ['Website and landing page builds', 'UI/UX design systems', 'Conversion-first page structure']
  },
  {
    id: 'marketing',
    title: 'Performance Marketing',
    icon: Target,
    aliases: ['growth', 'leads', 'seo', 'traffic', 'campaign', 'performance', 'funnel'],
    fit: 'Best for brands that need more qualified traffic, stronger funnels, and measurable growth.',
    bullets: ['SEO and lead-generation strategy', 'Growth funnel planning', 'Analytics and reporting']
  },
  {
    id: 'ai-growth',
    title: 'AI Growth & CRO',
    icon: Bot,
    aliases: ['ai', 'automation', 'analytics', 'cro', 'conversion', 'optimize', 'optimisation', 'optimization', 'growth strategy', 'reporting', 'dashboard'],
    fit: 'Best for businesses that want AI-supported campaign planning, conversion optimization, analytics, and smarter growth decisions.',
    bullets: ['AI-powered marketing workflows', 'Conversion optimization', 'Analytics and growth strategy']
  },
  {
    id: 'advertising',
    title: 'Paid Advertising',
    icon: Megaphone,
    aliases: ['ads', 'advertising', 'google ads', 'meta', 'linkedin', 'ppc', 'paid'],
    fit: 'Best for brands ready to drive demand through Google, Meta, LinkedIn, and paid media.',
    bullets: ['Search and display campaigns', 'Social media ads', 'Budget and audience planning']
  },
  {
    id: 'content',
    title: 'Content Design',
    icon: Camera,
    aliases: ['content', 'video', 'shoot', 'photoshoot', 'copy', 'brand', 'creative'],
    fit: 'Best for brands that need sharper storytelling, product visuals, and campaign-ready content.',
    bullets: ['Brand storytelling', 'Product shoots and videos', 'Social content systems']
  },
  {
    id: 'software',
    title: 'Custom Software',
    icon: Code2,
    aliases: ['software', 'app', 'application', 'cms', 'lms', 'api', 'integration', 'portal'],
    fit: 'Best for businesses that need custom apps, portals, CMS/LMS work, or business integrations.',
    bullets: ['Web and mobile applications', 'CMS/LMS integrations', 'Business system workflows']
  }
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

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotification, setShowNotification] = useState(true);
  const [messages, setMessages] = useState([
    createBotMessage(
      'Hi, I am URD Chat Assistant. I can help you find the right service, understand pricing, or connect you with the team.',
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
            <h4>URD Chat Assistant</h4>
            <div className={`online-indicator ${officeStatus.isOpen ? 'is-open' : 'is-closed'}`}>
              <span className="g-dot"></span>
              <span>{officeStatus.label}</span>
            </div>
          </div>
          <button className="chat-header-action" onClick={openWhatsApp} aria-label="Open WhatsApp">
            <PhoneCall size={15} />
          </button>
        </div>

        <div className="chat-trust-row">
          <span><ShieldCheck size={13} /> No spam</span>
          <span>Human follow-up</span>
          <span>{officeStatus.isOpen ? 'Office hours' : 'Next-day reply'}</span>
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
            ) : (
              <form onSubmit={handleCallbackSubmit} className="callback-form-inner">
                <span>Request a quick callback</span>
                <select value={callbackNeed} onChange={(e) => setCallbackNeed(e.target.value)}>
                  <option>General enquiry</option>
                  {SERVICE_PLAYBOOK.map(service => (
                    <option key={service.id}>{service.title}</option>
                  ))}
                </select>
                <div className="callback-input-wrap">
                  <input
                    type="tel"
                    placeholder="Phone number"
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    required
                    autoFocus
                  />
                  <button type="submit" className="callback-send-btn">
                    <PhoneCall size={14} />
                  </button>
                </div>
                <p className="callback-privacy-note">
                  Your number is used only for this callback request and is shared with the URD team.
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
      </div>

      <style>{`
        .chatbot-wrapper {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          z-index: 10000;
          font-family: inherit;
        }

        .chat-toggle-bubble {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          background: var(--gradient-accent);
          border: none;
          color: #ffffff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 12px 34px rgba(59, 130, 246, 0.38);
          transition: var(--transition-normal);
          position: relative;
          outline: none;
          animation: chat-idle-float 3.8s ease-in-out infinite;
        }

        .chat-toggle-bubble:hover {
          transform: scale(1.05) translateY(-3px);
          box-shadow: 0 12px 34px rgba(59, 130, 246, 0.38);
        }

        .chat-toggle-bubble.open {
          background: #111827;
          box-shadow: 0 12px 32px rgba(0, 0, 0, 0.42);
          animation: none;
        }

        .notif-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-primary);
          animation: pulse-badge 1.5s infinite alternate;
        }

        .chat-drawer-window {
          position: absolute;
          bottom: 78px;
          right: 0;
          width: min(390px, calc(100vw - 2rem));
          height: min(610px, calc(100vh - 120px));
          max-height: 610px;
          background: var(--bg-card);
          border: 1px solid var(--border-color);
          box-shadow: var(--shadow-lg);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          min-height: 0;
          overflow: hidden;
          opacity: 0;
          transform: translateY(22px) scale(0.94);
          pointer-events: none;
          transform-origin: bottom right;
          transition: opacity 0.28s ease, transform 0.38s cubic-bezier(0.16, 1, 0.3, 1);
          padding: 0;
        }

        .chat-drawer-window.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: all;
          animation: chat-window-pop 0.42s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .chat-drawer-window:hover {
          transform: translateY(0) scale(1);
          background: var(--bg-card);
          border-color: var(--border-color);
          box-shadow: var(--shadow-lg);
        }

        .chat-drawer-window:hover::after {
          background: var(--gradient-card-border);
        }

        .chat-header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.75rem;
          padding: 1.1rem 1.2rem;
          border-bottom: 1px solid var(--border-color);
          background: var(--bg-hover-pills);
        }

        .chat-drawer-window.visible .chat-header {
          animation: chat-slide-down 0.36s ease both;
        }

        .chat-avatar-box {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          background: var(--gradient-accent);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .avatar-glow {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.45);
          animation: pulse-glow 1.5s infinite alternate;
        }

        .chat-header-info h4 {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-main);
          line-height: 1.2;
        }

        .online-indicator {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.68rem;
          color: var(--text-dim);
          margin-top: 0.1rem;
        }

        .g-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #10b981;
        }

        .online-indicator.is-closed .g-dot {
          background: #f59e0b;
        }

        .chat-header-action {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.03);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .chat-trust-row {
          display: flex;
          gap: 0.45rem;
          padding: 0.65rem 0.9rem;
          border-bottom: 1px solid var(--border-color);
          overflow-x: auto;
          scrollbar-width: none;
        }

        .chat-trust-row::-webkit-scrollbar {
          display: none;
        }

        .chat-trust-row span {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          white-space: nowrap;
          font-size: 0.66rem;
          font-weight: 700;
          color: var(--text-muted);
          background: rgba(255, 255, 255, 0.025);
          border: 1px solid var(--border-color);
          border-radius: 999px;
          padding: 0.28rem 0.55rem;
        }

        .chat-messages-container {
          flex: 1 1 auto;
          min-height: 0;
          padding: 1rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          gap: 0.85rem;
          overscroll-behavior: contain;
        }

        .msg-row {
          display: flex;
          width: 100%;
          animation: chat-message-in 0.28s ease both;
        }

        .user-row {
          justify-content: flex-end;
        }

        .bot-row {
          justify-content: flex-start;
        }

        .msg-bubble {
          max-width: 86%;
          min-width: 0;
          padding: 0.75rem 0.9rem;
          border-radius: 12px;
          font-size: 0.84rem;
          position: relative;
          line-height: 1.45;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .msg-meta {
          display: block;
          color: var(--primary);
          font-size: 0.62rem;
          font-weight: 800;
          text-transform: uppercase;
          margin-bottom: 0.35rem;
        }

        .user-row .msg-bubble {
          background: var(--gradient-accent);
          color: #ffffff;
          border-bottom-right-radius: 3px;
        }

        .bot-row .msg-bubble {
          background: var(--bg-hover-pills);
          color: var(--text-muted);
          border: 1px solid var(--border-color);
          border-bottom-left-radius: 3px;
        }

        .message-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.45rem;
          margin-top: 0.8rem;
        }

        .message-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border: 1px solid rgba(247, 151, 31, 0.28);
          background: rgba(247, 151, 31, 0.07);
          color: var(--primary);
          padding: 0.38rem 0.55rem;
          border-radius: 7px;
          cursor: pointer;
          font-size: 0.7rem;
          font-weight: 800;
          transition: transform 0.2s ease, opacity 0.2s ease;
        }

        .message-action-btn:hover {
          transform: translateY(-1px);
        }

        .msg-time {
          display: block;
          font-size: 0.58rem;
          color: var(--text-dim);
          margin-top: 0.4rem;
          text-align: right;
        }

        .service-summary-card {
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.025);
          border-radius: 12px;
          padding: 0.85rem;
          color: var(--text-muted);
          font-size: 0.78rem;
          animation: chat-message-in 0.3s ease both;
        }

        .service-summary-head {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-main);
          font-weight: 800;
          margin-bottom: 0.5rem;
        }

        .service-summary-card ul {
          margin-top: 0.55rem;
          padding-left: 1rem;
        }

        .service-summary-card li {
          margin-bottom: 0.22rem;
        }

        .typing-bubble {
          display: flex;
          gap: 0.25rem;
          padding: 0.62rem 0.85rem;
        }

        .typing-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--text-dim);
          display: inline-block;
          animation: dot-jump 1.4s infinite ease-in-out both;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        .chat-suggestion-chips {
          display: flex;
          gap: 0.5rem;
          flex: 0 0 auto;
          padding: 0.6rem 1rem;
          overflow-x: auto;
          overflow-y: hidden;
          scrollbar-width: none;
          white-space: nowrap;
          border-top: 1px solid var(--border-color);
        }

        .chat-suggestion-chips::-webkit-scrollbar {
          display: none;
        }

        .suggestion-chip {
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.43rem 0.72rem;
          border-radius: 999px;
          font-size: 0.74rem;
          cursor: pointer;
          transition: var(--transition-fast);
          flex-shrink: 0;
          animation: chat-chip-in 0.28s ease both;
        }

        .suggestion-chip:nth-child(2) { animation-delay: 0.03s; }
        .suggestion-chip:nth-child(3) { animation-delay: 0.06s; }
        .suggestion-chip:nth-child(4) { animation-delay: 0.09s; }
        .suggestion-chip:nth-child(5) { animation-delay: 0.12s; }
        .suggestion-chip:nth-child(6) { animation-delay: 0.15s; }

        .suggestion-chip.priority {
          color: #ffffff;
          background: var(--gradient-accent);
          border-color: var(--primary);
          font-weight: 800;
        }

        .suggestion-chip:hover {
          background: var(--bg-hover-pills);
          border-color: var(--border-color);
          color: var(--text-muted);
        }

        .suggestion-chip.priority:hover {
          color: #ffffff;
          background: var(--gradient-accent);
          border-color: var(--primary);
        }

        .chat-input-footer {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 0.6rem;
          flex: 0 0 auto;
          border-top: 1px solid var(--border-color);
          background: var(--bg-hover-pills);
          padding: 0.72rem 1rem;
        }

        .input-search-icon {
          color: var(--text-dim);
        }

        .chat-input-footer input {
          width: 100%;
          min-width: 0;
          background: transparent;
          border: none;
          color: var(--text-main);
          font-size: 0.82rem;
          outline: none;
        }

        .chat-input-footer button {
          width: 30px;
          height: 30px;
          border-radius: 8px;
          background: rgba(247, 151, 31, 0.08);
          border: 1px solid rgba(247, 151, 31, 0.18);
          color: var(--primary);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          outline: none;
        }

        .chat-input-footer button:disabled {
          color: var(--text-dim);
          background: transparent;
          border-color: var(--border-color);
          cursor: not-allowed;
        }

        .callback-overlay-card {
          flex: 0 0 auto;
          max-height: 245px;
          overflow-y: auto;
          border-top: 1px solid var(--border-color);
          background: var(--bg-secondary);
          padding: 1rem;
          animation: chat-panel-up 0.32s ease both;
        }

        .callback-form-inner {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }

        .callback-form-inner span {
          font-size: 0.78rem;
          color: var(--text-main);
          font-weight: 800;
        }

        .callback-form-inner select,
        .callback-input-wrap {
          background: var(--bg-hover-pills);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text-main);
        }

        .callback-form-inner select {
          padding: 0.55rem 0.7rem;
          font-size: 0.8rem;
          outline: none;
        }

        .callback-input-wrap {
          display: flex;
          overflow: hidden;
        }

        .callback-input-wrap input {
          flex-grow: 1;
          min-width: 0;
          background: transparent;
          border: none;
          color: var(--text-main);
          padding: 0.58rem 0.7rem;
          font-size: 0.82rem;
          outline: none;
        }

        .callback-send-btn {
          background: var(--gradient-accent);
          color: #fff;
          border: none;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
        }

        .callback-privacy-note {
          color: var(--text-dim);
          font-size: 0.68rem;
          line-height: 1.4;
        }

        .callback-divider {
          display: flex;
          align-items: center;
          text-align: center;
          color: var(--text-dim);
          font-size: 0.68rem;
          font-weight: 700;
        }

        .callback-divider::before,
        .callback-divider::after {
          content: '';
          flex: 1;
          border-bottom: 1px solid var(--border-color);
        }

        .callback-divider::before { margin-right: 0.55rem; }
        .callback-divider::after { margin-left: 0.55rem; }

        .whatsapp-callback-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: #25d366;
          color: #ffffff;
          border: none;
          padding: 0.58rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 800;
          cursor: pointer;
          transition: var(--transition-fast);
          text-decoration: none;
          width: 100%;
          box-sizing: border-box;
        }

        .cancel-callback-btn,
        .back-chat-btn {
          font-size: 0.72rem;
          color: var(--text-dim);
          background: none;
          border: none;
          cursor: pointer;
          align-self: flex-start;
        }

        .callback-success-view {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 0.45rem;
          text-align: center;
        }

        .chk-circle {
          color: #10b981;
        }

        .callback-success-view span {
          font-size: 0.82rem;
          font-weight: 800;
          color: var(--text-main);
        }

        .callback-success-view p {
          color: var(--text-muted);
          font-size: 0.75rem;
          line-height: 1.45;
        }

        .admin-handoff-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
          width: 100%;
        }

        .admin-handoff-actions a {
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          min-height: 34px;
          border-radius: 8px;
          border: 1px solid var(--border-color);
          background: rgba(255, 255, 255, 0.035);
          color: var(--text-muted);
          font-size: 0.72rem;
          font-weight: 800;
          text-decoration: none;
          padding: 0.35rem;
        }

        .admin-handoff-actions a:first-child {
          background: #25d366;
          border-color: #25d366;
          color: #ffffff;
        }

        @keyframes pulse-badge {
          0% { transform: scale(0.9); }
          100% { transform: scale(1.1); }
        }

        @keyframes chat-idle-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }

        @keyframes chat-window-pop {
          0% { transform: translateY(22px) scale(0.94); opacity: 0; }
          100% { transform: translateY(0) scale(1); opacity: 1; }
        }

        @keyframes chat-slide-down {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes chat-message-in {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes chat-chip-in {
          0% { opacity: 0; transform: translateY(6px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes chat-panel-up {
          0% { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse-glow {
          0% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.25); }
          100% { box-shadow: 0 0 15px rgba(59, 130, 246, 0.55); }
        }

        @keyframes dot-jump {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }

        @media (prefers-reduced-motion: reduce) {
          .chat-toggle-bubble,
          .chat-drawer-window.visible,
          .chat-drawer-window.visible .chat-header,
          .msg-row,
          .service-summary-card,
          .suggestion-chip,
          .callback-overlay-card,
          .avatar-glow,
          .notif-badge,
          .typing-dot {
            animation: none;
          }

          .chat-drawer-window,
          .message-action-btn,
          .suggestion-chip {
            transition: none;
          }
        }

        @media (max-width: 480px) {
          .chatbot-wrapper {
            bottom: 1rem;
            right: 1rem;
            left: 1rem;
          }

          .chat-toggle-bubble {
            margin-left: auto;
          }

          .chat-drawer-window {
            width: 100%;
            height: min(610px, calc(100vh - 112px));
            right: 0;
            bottom: 74px;
          }

          .msg-bubble {
            max-width: 90%;
          }
        }
      `}</style>
    </div>
  );
}
