import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, CheckCircle2, Mail, MessageCircle, RotateCcw, Send, Sparkles, User, X } from 'lucide-react';
import { FALLBACK_REPLY, SERVICE_PLAYBOOK, getServiceMatch } from '@/utils/servicePlaybook';
import { trackWebsiteEvent } from '@/utils/analytics';
import { scrollToSection } from '@/utils/scrollToSection';
import {
  CONTACT_EMAIL,
  WHATSAPP_NUMBER_E164,
  WHATSAPP_URL
} from '@/utils/contactChannels';
import { clearEnquiryPrefill, publishEnquiryPrefill } from '@/utils/enquiryPrefill';
import { trimConversation } from '@/utils/conversationWindow';
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
      'Hi, I’m Up Rank Digital’s AI assistant. How can I help you?'
  }
];

// The enquiry form collects name, email, phone and the goal, and it reaches Sachin's inbox.
// Asking a visitor to retype the same things into a chat panel that forgets them when the tab
// closes only loses the lead, so every reply that has a direction ends by pointing at the form.
// The exact words "enquiry form" are also what `renderMessageContentAndActions` looks for to
// offer the button, and the system prompt in api/chat.js tells the model to use them too.
const contactPrompt =
  'The quickest way forward is the enquiry form on this page: name, email, phone and a line about your goal. Sachin comes back within one business day.';

const CONTACT_SECTION = '#contact';

// Most replies land inside a second. Past this the visitor deserves a word rather than
// dots that look the same at six seconds as they did at one.
const SLOW_REPLY_NOTICE_MS = 5000;

const buildLocalAssistantReply = (input) => {
  const lowerInput = input.toLowerCase();
  const matchedService = getServiceMatch(input);

  if (matchedService) {
    const service = SERVICE_PLAYBOOK.find((item) => item.id === matchedService.id) || matchedService;
    return [
      `${service.title} looks like the right starting point.`,
      service.fit,
      `Common scope: ${service.bullets.join(', ')}.`,
      contactPrompt
    ].join('\n\n');
  }

  if (/(price|pricing|cost|budget|package|quote)/i.test(lowerInput)) {
    return [
      'Pricing depends on scope, timeline, channels, content, integrations, and complexity.',
      'Share your website, goal, preferred timeline, and budget range, and the team can advise on the right scope instead of guessing.'
    ].join('\n\n');
  }

  if (/(contact|call|phone|whatsapp|human|team)/i.test(lowerInput)) {
    return 'You can message Up Rank Digital on WhatsApp at +91 93711 16165 or email us at sachin@uprankdigital.com. For a sharper handoff, include your business name, website/social link, goal, and timeline.';
  }

  return [
    'I can help you narrow this down across website development, digital marketing, performance marketing, AI powered solutions, and content design & management.',
    'What is the main outcome you want right now: more leads, a better website, more sales, or stronger tracking?'
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

const renderMessageContentAndActions = (message, onOpenForm, showActions = true) => {
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
    const hasForm = /enquiry form/i.test(text);

    if (hasWhatsApp || hasEmail || hasForm) {
      return (
        <div className="message-content-container">
          <div className="message-text-content">{formattedElements}</div>
          <div className="message-inline-ctas">
            {hasForm && (
              <button type="button" className="inline-cta-btn form-cta" onClick={onOpenForm}>
                <span>Open the enquiry form</span>
                <ArrowRight size={14} />
              </button>
            )}
            {hasWhatsApp && (
              <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-cta-btn whatsapp-cta">
                <MessageCircle size={14} />
                <span>Message on WhatsApp</span>
              </a>
            )}
            {hasEmail && (
              <a href={`mailto:${CONTACT_EMAIL}`} className="inline-cta-btn email-cta">
                <Mail size={14} />
                <span>Email Sachin</span>
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
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

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
  }, [messages, isLoading, isOpen]);

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
      setMessages(initialMessages);
      setActiveModel('');
      setLatency(0);
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
      // The form is now the main route to the team, so a reply that sends a visitor there
      // counts as a handoff alongside the WhatsApp and email ones.
      const isQualified = /sachin@uprankdigital.com|whatsapp|enquiry form/i.test(assistantText);
      trackWebsiteEvent('reply_received', {
        role: 'assistant',
        replyLength: assistantText.length,
        model: streamedModel,
        reply_source: servedFallback ? 'backend_fallback' : 'model',
        isQualifiedHandoff: isQualified
      });

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

  // The panel covers most of a phone screen, so leaving it open would scroll the form in
  // behind it. Closing first means the visitor lands on the fields, which is where the
  // reply just sent them.
  const openEnquiryForm = () => {
    setIsOpen(false);
    // Everything the visitor just told the assistant travels to the goal field, so the
    // lead reaches Sachin with the context instead of an empty box and a retyped story.
    const prefill = publishEnquiryPrefill(messages);
    trackWebsiteEvent('assistant_form_cta', { prefilled: Boolean(prefill) });
    scrollToSection(CONTACT_SECTION);
    // The form is below the fold on most screens, so the scroll has to land before the
    // first field can take focus.
    window.setTimeout(() => {
      document.getElementById('contact-name')?.focus({ preventScroll: true });
    }, 600);
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
          aria-label="Up Rank Digital's AI Assistant"
        >
          <header className="website-assistant-header">
            <div className="website-assistant-title">
              <span className="website-assistant-avatar">
                <Sparkles size={18} />
              </span>
              <span>
                <strong>Up Rank Digital&rsquo;s AI Assistant</strong>
                <small>
                  <CheckCircle2 size={12} /> Online now
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
                  {renderMessageContentAndActions(message, openEnquiryForm, index === messages.length - 1)}
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
            <div ref={scrollRef} />
          </div>

          <form className="website-assistant-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="text"
              maxLength={2000}
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask me a question"
              aria-label="Message"
              disabled={isLoading}
            />
            <button type="submit" disabled={!inputValue.trim() || isLoading} aria-label="Send message">
              <Send size={16} />
            </button>
          </form>

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
