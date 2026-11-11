import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Briefcase, CheckCircle2, Mail, MessageCircle, RotateCcw, Send, Sparkles, User, X } from 'lucide-react';
import { CONSULTATION_PHRASE, FALLBACK_REPLY, SERVICE_PLAYBOOK, getServiceMatch } from '@/utils/servicePlaybook';
import { trackWebsiteEvent } from '@/utils/analytics';
import {
  CONTACT_EMAIL,
  WHATSAPP_NUMBER_DISPLAY,
  WHATSAPP_NUMBER_E164,
  WHATSAPP_URL
} from '@/utils/contactChannels';
import { clearEnquiryPrefill } from '@/utils/enquiryPrefill';
import { OPEN_ASSISTANT_EVENT } from '@/utils/assistantEvents';
import { trimConversation } from '@/utils/conversationWindow';
import { resetTranscriptLog, sendTranscriptLog } from '@/utils/chatTranscriptLog';
import ConsultationCard from './ConsultationCard';
import './WebsiteAssistant.css';

// Same-origin Vercel function, exactly like /api/submit-lead: no key reaches the browser and
// there is no CORS to configure. It streams Groq's frames straight through, so the parsing
// below is reading Groq's own SSE shape.
//
// When it cannot reach a model it answers with a single `urd_fallback` frame instead, and
// `vite dev` has no serverless runtime at all. Both land on the local service playbook.
const CHAT_ENDPOINT = '/api/chat';

const initialMessages = [
  {
    role: 'assistant',
    content:
      'Welcome to Up Rank Digital. I am the corporate solutions assistant. I can outline how we support companies across web, marketing, performance and AI, help you work through a business challenge, or arrange a consultation with our team. How may I assist you today?'
  }
];

// Offered under the welcome message only. Decision makers skim, and a first tap is easier
// than a first sentence. `consult` opens the consultation form directly instead of asking.
const QUICK_REPLIES = [
  { label: 'Explore corporate services', prompt: 'What services do you offer for companies like ours?' },
  { label: 'Discuss a business challenge', prompt: 'I would like to discuss a challenge my company is facing.' },
  { label: 'Request a consultation', consult: true },
  { label: 'Speak with the team', prompt: 'I would like to speak with someone from your team.' }
];

const LEAD_SUBMITTED_KEY = 'urd_assistant_lead_submitted';

const hasConsultationInvite = (text = '') => text.toLowerCase().includes(CONSULTATION_PHRASE);

// Every local reply that has a direction ends with the consultation invitation, in the
// same words the model uses, so the panel offers the in-chat form either way.
const contactPrompt =
  'To take this forward, you can request a consultation here in the chat: a short form for your name, work email, company and phone. A senior strategist responds within one business day.';

// Most replies land inside a second. Past this the visitor deserves a word rather than
// dots that look the same at six seconds as they did at one.
const SLOW_REPLY_NOTICE_MS = 5000;

const buildLocalAssistantReply = (input) => {
  const lowerInput = input.toLowerCase();
  const matchedService = getServiceMatch(input);

  if (matchedService) {
    const service = SERVICE_PLAYBOOK.find((item) => item.id === matchedService.id) || matchedService;
    return [
      `${service.title} would be the appropriate starting point.`,
      service.fit,
      `Common scope: ${service.bullets.join(', ')}.`,
      contactPrompt
    ].join('\n\n');
  }

  if (/(price|pricing|cost|budget|package|quote)/i.test(lowerInput)) {
    return [
      'Corporate engagements are scoped individually, based on objectives, channels, markets, integrations and timeline, and the team prepares a tailored proposal.',
      contactPrompt
    ].join('\n\n');
  }

  if (/(contact|call|phone|whatsapp|human|team)/i.test(lowerInput)) {
    return `You can reach the Up Rank Digital team on WhatsApp at ${WHATSAPP_NUMBER_DISPLAY} or by email at ${CONTACT_EMAIL}. Alternatively, you can request a consultation here and a senior strategist will contact you within one business day.`;
  }

  return [
    'We support companies across website development, digital marketing, performance marketing, AI powered solutions, and content design & management.',
    'What is the main challenge your organisation is trying to solve at present: too few enquiries, advertising that does not pay back, a website that does not convert, or unclear measurement?'
  ].join('\n\n');
};

const parseMarkdownText = (textLine) => {
  if (!textLine) return '';

  const parts = [];
  let remaining = textLine;
  let keyIndex = 0;

  // Match bold **text**, inline `code`, or markdown links [label](url)
  const regex = /(\*\*.*?\*\*|`.*?`|\[.*?\]\(.*?\))/g;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    const matchIndex = match.index;
    const matchText = match[0];

    if (matchIndex > 0) {
      parts.push(remaining.substring(0, matchIndex));
    }

    if (matchText.startsWith('**') && matchText.endsWith('**')) {
      const content = matchText.substring(2, matchText.length - 2);
      parts.push(<strong key={`bold-${keyIndex++}`}>{content}</strong>);
    } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
      const content = matchText.substring(1, matchText.length - 1);
      parts.push(<code key={`code-${keyIndex++}`} className="bubble-inline-code">{content}</code>);
    } else if (matchText.startsWith('[') && matchText.includes('](')) {
      const closeBracket = matchText.indexOf(']');
      const label = matchText.substring(1, closeBracket);
      const url = matchText.substring(closeBracket + 2, matchText.length - 1);
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={url}
          target="_blank"
          rel="noreferrer"
          className="bubble-markdown-link"
        >
          {label}
        </a>
      );
    }

    remaining = remaining.substring(matchIndex + matchText.length);
    regex.lastIndex = 0;
  }

  if (remaining) {
    parts.push(remaining);
  }

  return parts.length > 0 ? parts : textLine;
};

const renderMessageContentAndActions = (message, onOpenConsultation, showActions = true) => {
  let text = message.content;
  if (!text) return null;

  // Markdown is the assistant's formatting, not the visitor's. Running the visitor's own
  // words through the parser turned anything they typed in [label](url) form into a real
  // link in their bubble, which is a link the page wrote on their behalf out of text a
  // stranger could have handed them.
  const format = message.role === 'assistant' ? parseMarkdownText : (line) => line;

  // Strip suggestions tag from text bubbles
  text = text.replace(/\[Suggestions:\s*.*?\]/gi, '').trim();
  text = text.replace(/\[Suggestions?:?\s*.*$/i, '').trim();

  const lines = text.split('\n');
  const formattedElements = [];
  let currentList = [];

  lines.forEach((line, index) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
      currentList.push(
        <li key={`li-${index}`} className="message-list-item">
          {format(trimmed.substring(1).trim())}
        </li>
      );
    } else if (trimmed.startsWith('###')) {
      if (currentList.length > 0) {
        formattedElements.push(
          <ul key={`ul-${index}`} className="message-list">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      formattedElements.push(
        <h4 key={`h-${index}`} className="message-header">
          {format(trimmed.replace(/^###\s*/, ''))}
        </h4>
      );
    } else {
      if (currentList.length > 0) {
        formattedElements.push(
          <ul key={`ul-${index}`} className="message-list">
            {currentList}
          </ul>
        );
        currentList = [];
      }
      if (trimmed) {
        formattedElements.push(
          <p key={`p-${index}`} className="message-paragraph">
            {format(trimmed)}
          </p>
        );
      }
    }
  });

  if (currentList.length > 0) {
    formattedElements.push(
      <ul key="ul-final" className="message-list">
        {currentList}
      </ul>
    );
  }

  // Only the newest reply carries the buttons. Every earlier reply that mentioned the
  // form keeps its words but loses its button, because three stacked orange CTAs in one
  // short panel is the same nag repeated, and the visitor only ever acts on the last one.
  if (message.role === 'assistant' && showActions) {
    // The model writes the number the way prose wants it, which in practice means narrow
    // no-break spaces between the digit groups rather than ordinary ones. Comparing the
    // digits alone is what makes the button survive that: matching the literal string
    // dropped the WhatsApp button from roughly three quarters of the replies that
    // offered the number, including the ones where the visitor had asked for a person.
    const hasWhatsApp = text.replace(/\D/g, '').includes(WHATSAPP_NUMBER_E164);
    const hasEmail = new RegExp(CONTACT_EMAIL.replace(/[.]/g, '\\.'), 'i').test(text);
    const hasConsult = Boolean(onOpenConsultation) && hasConsultationInvite(text);

    if (hasWhatsApp || hasEmail || hasConsult) {
      return (
        <div className="message-content-container">
          <div className="message-text-content">{formattedElements}</div>
          <div className="message-inline-ctas">
            {hasConsult && (
              <button type="button" className="inline-cta-btn form-cta" onClick={onOpenConsultation}>
                <Briefcase size={14} />
                <span>Request a consultation</span>
                <ArrowRight size={14} />
              </button>
            )}
            {hasWhatsApp && (
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noreferrer"
                className="inline-cta-btn whatsapp-cta"
                onClick={() => trackWebsiteEvent('whatsapp_click', { location: 'assistant' })}
              >
                <MessageCircle size={14} />
                <span>Message on WhatsApp</span>
              </a>
            )}
            {hasEmail && (
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-cta-btn email-cta"
                onClick={() => trackWebsiteEvent('email_click', { location: 'assistant' })}
              >
                <Mail size={14} />
                <span>Email the team</span>
              </a>
            )}
          </div>
        </div>
      );
    }
  }

  return <div className="message-text-content">{formattedElements}</div>;
};

// Only the endpoint's own fallback text, matched exactly. The `urd_fallback` flag is the
// real signal and this is the backstop for a frame whose flag was missed; it is deliberately
// not a phrase match. The system prompt tells the model to hand off to WhatsApp and email,
// so matching on that wording swallowed genuine answers and replaced them with a keyword
// template the visitor had not asked for.
const isBackendFallback = (text) => text.trim() === FALLBACK_REPLY;

const cleanMessages = (messages) =>
  trimConversation(
    messages.filter((message) => ['assistant', 'user'].includes(message.role) && message.content)
  ).map((message) => ({
    role: message.role,
    content: String(message.content).slice(0, 2000)
  }));

export default function WebsiteAssistant() {
  const [isOpen, setIsOpen] = useState(() => {
    try {
      return sessionStorage.getItem('urd_assistant_open') === 'true';
    } catch {
      return false;
    }
  });
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem('urd_assistant_messages');
      return saved ? JSON.parse(saved) : initialMessages;
    } catch {
      return initialMessages;
    }
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  // A model that stalls, or a retry onto the next model in the list, leaves the typing
  // dots running with nothing to say for it. After a few seconds say so in words.
  const [isSlow, setIsSlow] = useState(false);
  const [activeModel, setActiveModel] = useState('');
  const [latency, setLatency] = useState(0);
  const [isConsultationOpen, setIsConsultationOpen] = useState(false);
  const [leadSubmitted, setLeadSubmitted] = useState(() => {
    try {
      return sessionStorage.getItem(LEAD_SUBMITTED_KEY) === 'true';
    } catch {
      return false;
    }
  });
  const scrollRef = useRef(null);
  const inputRef = useRef(null);
  // The page-hide listener is registered once, so it reads the latest conversation from
  // here rather than from the render it was created in.
  const transcriptRef = useRef({ messages, leadSubmitted });
  transcriptRef.current = { messages, leadSubmitted };

  useEffect(() => {
    const flush = () => sendTranscriptLog(transcriptRef.current);
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pagehide', flush);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('pagehide', flush);
    };
  }, []);

  useEffect(() => {
    try {
      sessionStorage.setItem('urd_assistant_messages', JSON.stringify(messages));
    } catch (err) {
      console.warn('Failed to save messages state:', err);
    }
  }, [messages]);

  useEffect(() => {
    try {
      sessionStorage.setItem('urd_assistant_open', String(isOpen));
    } catch (err) {
      console.warn('Failed to save open state:', err);
    }
  }, [isOpen]);

  useEffect(() => {
    const anchor = scrollRef.current;
    const list = anchor?.parentElement;
    if (!list) return;
    list.scrollTop = list.scrollHeight;
  }, [messages, isLoading, isOpen, isConsultationOpen]);

  useEffect(() => {
    if (!isLoading) {
      setIsSlow(false);
      return;
    }

    const timer = window.setTimeout(() => setIsSlow(true), SLOW_REPLY_NOTICE_MS);
    return () => window.clearTimeout(timer);
  }, [isLoading]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    inputRef.current?.focus();
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Anything on the page can open the panel by dispatching OPEN_ASSISTANT_EVENT, so a
  // link (the AI service card's "try it") does not need a reference to this component.
  useEffect(() => {
    const handleOpenRequest = (event) => {
      setIsOpen(true);
      trackWebsiteEvent('chatbot_opened', { location: event.detail?.location || 'page_link' });
    };

    window.addEventListener(OPEN_ASSISTANT_EVENT, handleOpenRequest);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, handleOpenRequest);
  }, []);

  const appendAssistantText = (text) => {
    setMessages((current) => {
      const lastMessage = current[current.length - 1];
      if (lastMessage?.role === 'assistant' && current[current.length - 2]?.role === 'user') {
        return current.map((message, index) =>
          index === current.length - 1 ? { ...message, content: message.content + text } : message
        );
      }

      return [...current, { role: 'assistant', content: text }];
    });
  };

  const clearChatHistory = () => {
    if (window.confirm('Are you sure you want to clear your conversation history?')) {
      // Send what was said before it is erased; the new conversation starts its own log.
      sendTranscriptLog(transcriptRef.current);
      resetTranscriptLog();
      setMessages(initialMessages);
      setActiveModel('');
      setLatency(0);
      setIsConsultationOpen(false);
      try {
        sessionStorage.removeItem('urd_assistant_messages');
      } catch (err) {
        console.warn('Failed to clear session messages:', err);
      }
      // The conversation is gone, so the context waiting for the enquiry form should go
      // with it rather than prefilling a story the visitor has just erased.
      clearEnquiryPrefill();

      // Dispatch reset event for developer analytics integration
      trackWebsiteEvent('chat_cleared');
    }
  };

  const sendMessage = async (content) => {
    const trimmedInput = content.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage = { role: 'user', content: trimmedInput };
    const nextMessages = [...messages, userMessage];

    setInputValue('');
    setMessages(nextMessages);
    setIsLoading(true);
    setActiveModel('');
    setLatency(0);

    const startTime = Date.now();

    // Dispatch message sent event for developer analytics integration
    trackWebsiteEvent('message_sent', {
      role: 'user',
      messageLength: trimmedInput.length
    });

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: cleanMessages(nextMessages) })
      });

      // `vite dev` has no serverless runtime: it answers /api/* with the index.html shell and a
      // 200. Checking the status alone would let that through and stream an empty reply, so the
      // content type decides whether this is really the chat endpoint.
      const contentType = response.headers.get('content-type') || '';
      if (!response.ok || !response.body || contentType.includes('text/html')) {
        throw new Error('Failed to connect to the AI assistant.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';
      let streamedModel = '';
      let servedFallback = false;
      let guardrail = null;

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        let boundary = buffer.indexOf('\n');

        while (boundary !== -1) {
          let line = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (!line.startsWith('data: ')) {
            boundary = buffer.indexOf('\n');
            continue;
          }

          const data = line.slice(6).trim();
          if (!data || data === '[DONE]') {
            boundary = buffer.indexOf('\n');
            continue;
          }

          try {
            const chunk = JSON.parse(data);
            const content = chunk.choices?.[0]?.delta?.content || '';
            const model = chunk.model;
            if (chunk.urd_fallback) {
              servedFallback = true;
            }
            if (chunk.urd_guardrail) {
              guardrail = chunk.urd_guardrail;
            }
            if (model) {
              streamedModel = streamedModel || model;
              setActiveModel((current) => current || model);
            }
            if (content) {
              assistantText += content;
              appendAssistantText(content);
            }
          } catch {
            buffer = `${line}\n${buffer}`;
            break;
          }

          boundary = buffer.indexOf('\n');
        }
      }

      setLatency(Date.now() - startTime);

      // The backend prompt still tells the model to end with a [Suggestions: a | b | c] tag.
      // Nothing renders those now, so the tag is stripped from the stored message instead of
      // parsed; left in place it would reach the visitor as literal text.
      if (/\[Suggestions:/i.test(assistantText)) {
        const cleanedText = assistantText.replace(/\[Suggestions:\s*.*?\]/gi, '').trim();
        setMessages((current) =>
          current.map((msg, index) =>
            index === current.length - 1 && msg.role === 'assistant'
              ? { ...msg, content: cleanedText }
              : msg
          )
        );
      }

      // Dispatch reply received event for developer analytics integration
      // A consultation invitation is the main route to the team, so it counts as a handoff
      // alongside the WhatsApp and email ones.
      const isQualified =
        assistantText.toLowerCase().includes(CONTACT_EMAIL.toLowerCase()) ||
        /whatsapp/i.test(assistantText) ||
        hasConsultationInvite(assistantText);
      trackWebsiteEvent('reply_received', {
        role: 'assistant',
        replyLength: assistantText.length,
        model: streamedModel,
        reply_source: servedFallback ? 'backend_fallback' : guardrail ? `guardrail_${guardrail.outcome}` : 'model',
        isQualifiedHandoff: isQualified
      });

      // A reply the server had to correct. Counted so the rate at which the model breaks
      // its rules is visible in GA4 without reading transcripts.
      if (guardrail) {
        trackWebsiteEvent('assistant_guardrail', {
          rules: (guardrail.rules || []).join(','),
          outcome: guardrail.outcome
        });
      }

      if (servedFallback || isBackendFallback(assistantText)) {
        setMessages((current) =>
          current.map((message, index) =>
            index === current.length - 1 && message.role === 'assistant'
              ? { ...message, content: buildLocalAssistantReply(trimmedInput) }
              : message
          )
        );
      }
    } catch (error) {
      console.error(error);
      const localReply = buildLocalAssistantReply(trimmedInput);
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: localReply
        }
      ]);
      trackWebsiteEvent('reply_received', {
        role: 'assistant',
        replyLength: localReply.length,
        model: '',
        reply_source: 'local_error',
        isQualifiedHandoff: false
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openAssistant = () => {
    setIsOpen(true);
    trackWebsiteEvent('chatbot_opened');
  };

  const openConsultation = (location = 'reply_cta') => {
    setIsConsultationOpen(true);
    trackWebsiteEvent('assistant_consultation_opened', { location });
  };

  const handleConsultationSubmitted = (lead) => {
    setIsConsultationOpen(false);
    setLeadSubmitted(true);
    try {
      sessionStorage.setItem(LEAD_SUBMITTED_KEY, 'true');
    } catch {
      // Storage blocked: the confirmation still shows for this page view.
    }
    const firstName = lead.name.trim().split(/\s+/)[0];
    setMessages((current) => [
      ...current,
      {
        role: 'assistant',
        local: true,
        content: `Thank you, ${firstName}. Your consultation request for ${lead.company.trim()} has been received, together with the context from this conversation. A senior strategist will contact you within one business day. In the meantime, I am happy to answer any further questions.`
      }
    ]);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };



  return (
    <>
      <button
        className={`website-assistant-toggle${isOpen ? ' is-open' : ''}`}
        type="button"
        onClick={() => (isOpen ? setIsOpen(false) : openAssistant())}
        aria-label={isOpen ? 'Close AI Assistant' : 'Open AI Assistant'}
        aria-expanded={isOpen}
        title="AI Assistant"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      {isOpen && (
        <section
          className="website-assistant-panel"
          role="dialog"
          aria-modal="false"
          aria-label="Up Rank Digital corporate solutions assistant"
        >
          <header className="website-assistant-header">
            <div className="website-assistant-title">
              <span className="website-assistant-avatar">
                <Sparkles size={18} />
              </span>
              <span>
                <strong>Up Rank Digital</strong>
                <small>
                  <CheckCircle2 size={12} /> Corporate Solutions Desk &middot; Online
                </small>
              </span>
            </div>
            <div className="website-assistant-header-actions">
              <button
                type="button"
                onClick={clearChatHistory}
                aria-label="Clear chat history"
                title="Clear conversation"
                className="clear-chat-btn"
                disabled={messages.length <= 1 && !isLoading}
              >
                <RotateCcw size={16} />
              </button>
              <button type="button" onClick={() => setIsOpen(false)} aria-label="Close AI Assistant">
                <X size={20} />
              </button>
            </div>
          </header>

          <div className="website-assistant-messages" aria-live="polite" aria-atomic="false">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`website-assistant-row ${message.role === 'user' ? 'is-user' : 'is-assistant'}`}
              >
                {message.role === 'assistant' && (
                  <span className="website-assistant-mini-avatar">
                    <Sparkles size={14} />
                  </span>
                )}
                <div className="website-assistant-bubble">
                  {renderMessageContentAndActions(
                    message,
                    leadSubmitted || isConsultationOpen ? null : () => openConsultation('reply_cta'),
                    index === messages.length - 1
                  )}
                  {index === 0 && messages.length === 1 && !isLoading && (
                    <div className="assistant-quick-replies">
                      {QUICK_REPLIES.filter((reply) => !(reply.consult && leadSubmitted)).map((reply) => (
                        <button
                          key={reply.label}
                          type="button"
                          className="assistant-quick-reply"
                          onClick={() => {
                            trackWebsiteEvent('assistant_quick_reply', { label: reply.label });
                            if (reply.consult) openConsultation('quick_reply');
                            else sendMessage(reply.prompt);
                          }}
                        >
                          {reply.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <span className="website-assistant-mini-avatar is-user">
                    <User size={14} />
                  </span>
                )}
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="website-assistant-row is-assistant">
                <span className="website-assistant-mini-avatar">
                  <Sparkles size={14} />
                </span>
                <div className="website-assistant-bubble">
                  <div className="website-assistant-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  {isSlow && (
                    <p className="website-assistant-slow-note">
                      Still working on this &mdash; one moment.
                    </p>
                  )}
                </div>
              </div>
            )}
            {isConsultationOpen && (
              <ConsultationCard
                messages={messages}
                onClose={() => setIsConsultationOpen(false)}
                onSubmitted={handleConsultationSubmitted}
              />
            )}
            <div ref={scrollRef} />
          </div>

          <form className="website-assistant-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              maxLength={2000}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Describe the challenge you want to solve…"
              aria-label="Message"
              disabled={isLoading}
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading} aria-label="Send message">
              <Send size={16} />
            </button>
          </form>
          <p className="website-assistant-notice">
            Conversations are reviewed by our team to improve answers.{' '}
            <a href="/privacy.html" target="_blank" rel="noopener">
              Privacy Policy
            </a>
          </p>

          {import.meta.env.DEV && activeModel && (
            <div className="website-assistant-debug-badge" title="Developer Telemetry (Only visible in Local Development)">
              <span>model: {activeModel}</span>
              {latency > 0 && <span> • {latency}ms</span>}
            </div>
          )}
        </section>
      )}
    </>
  );
}
