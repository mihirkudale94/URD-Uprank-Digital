import React, { useEffect, useRef, useState } from 'react';
import { CheckCircle2, Mail, MessageCircle, RotateCcw, Send, Sparkles, User, X } from 'lucide-react';
import { isSupabaseConfigured } from '@/utils/supabaseClient';
import { SERVICE_PLAYBOOK, getServiceMatch } from '@/utils/servicePlaybook';
import { trackWebsiteEvent } from '@/utils/analytics';
import './WebsiteAssistant.css';

const CHAT_FUNCTION_NAME = import.meta.env.VITE_SUPABASE_CHAT_FUNCTION || 'chat';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY;

const chatEndpoint = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1/${CHAT_FUNCTION_NAME}`
  : '';

const initialMessages = [
  {
    role: 'assistant',
    content:
      "Hi! I'm Up Rank Digital's AI assistant. I can help you choose the right service, estimate scope, and connect you with the team. What are you trying to grow or fix?"
  }
];

const suggestedPrompts = [
  'I need a website for my business',
  'Help me improve leads with ads',
  'Can AI automation help my team?',
  'What package should I start with?'
];

const contactPrompt =
  'To route this properly, share your business name, website or social link, main goal, timeline, and WhatsApp number.';

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
      'For a useful estimate, share your website, goal, preferred timeline, and budget range. The team can then suggest the right package instead of guessing.'
    ].join('\n\n');
  }

  if (/(contact|call|phone|whatsapp|human|team)/i.test(lowerInput)) {
    return 'You can message Up Rank Digital on WhatsApp at +91 93711 16165 or email us at sachin@uprankdigital.com. For a sharper handoff, include your business name, website/social link, goal, and timeline.';
  }

  return [
    'I can help you narrow this down across websites, SEO, ads, AI automation, content, analytics, or custom software.',
    'What is the main outcome you want right now: more leads, a better website, more sales, automation, or stronger tracking?'
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

const renderMessageContentAndActions = (message) => {
  let text = message.content;
  if (!text) return null;

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
          {parseMarkdownText(trimmed.substring(1).trim())}
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
          {parseMarkdownText(trimmed.replace(/^###\s*/, ''))}
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
            {parseMarkdownText(trimmed)}
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

  if (message.role === 'assistant') {
    const hasWhatsApp = text.includes('+91 93711 16165') || text.includes('9371116165');
    const hasEmail = text.includes('sachin@uprankdigital.com');

    if (hasWhatsApp || hasEmail) {
      return (
        <div className="message-content-container">
          <div className="message-text-content">{formattedElements}</div>
          <div className="message-inline-ctas">
            {hasWhatsApp && (
              <a
                href="https://wa.me/919371116165"
                target="_blank"
                rel="noreferrer"
                className="inline-cta-btn whatsapp-cta"
              >
                <MessageCircle size={14} />
                <span>Message on WhatsApp</span>
              </a>
            )}
            {hasEmail && (
              <a href="mailto:sachin@uprankdigital.com" className="inline-cta-btn email-cta">
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

const isBackendFallback = (text) =>
  /having trouble connecting|WhatsApp the (URD|Up Rank Digital) team|WhatsApp Up Rank Digital/i.test(text);

const cleanMessages = (messages) =>
  messages
    .filter((message) => ['assistant', 'user'].includes(message.role) && message.content)
    .slice(-12)
    .map((message) => ({
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
  const [activeModel, setActiveModel] = useState('');
  const [latency, setLatency] = useState(0);
  const scrollRef = useRef(null);

  const [dynamicSuggestions, setDynamicSuggestions] = useState([]);

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
    if (isOpen) {
      trackWebsiteEvent('chatbot_opened');
    }
  }, [isOpen]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

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
    setDynamicSuggestions([]);

    const startTime = Date.now();

    // Dispatch message sent event for developer analytics integration
    trackWebsiteEvent('message_sent', {
      role: 'user',
      messageLength: trimmedInput.length
    });

    if (!isSupabaseConfigured || !chatEndpoint || !SUPABASE_ANON_KEY) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: buildLocalAssistantReply(trimmedInput)
        }
      ]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(chatEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ messages: cleanMessages(nextMessages) })
      });

      if (!response.ok || !response.body) {
        throw new Error('Failed to connect to the AI assistant.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let assistantText = '';

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
            if (model && !activeModel) {
              setActiveModel(model);
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

      let extractedSuggestions = [];
      const suggestionsMatch = assistantText.match(/\[Suggestions:\s*(.*?)\]/i);
      if (suggestionsMatch) {
        const rawOptions = suggestionsMatch[1];
        extractedSuggestions = rawOptions
          .split('|')
          .map(opt => opt.trim())
          .filter(Boolean);
        
        const cleanedText = assistantText.replace(/\[Suggestions:\s*.*?\]/gi, '').trim();
        setMessages((current) =>
          current.map((msg, index) =>
            index === current.length - 1 && msg.role === 'assistant'
              ? { ...msg, content: cleanedText }
              : msg
          )
        );
      }
      setDynamicSuggestions(extractedSuggestions);

      // Dispatch reply received event for developer analytics integration
      const isQualified = /sachin@uprankdigital.com|whatsapp/i.test(assistantText);
      trackWebsiteEvent('reply_received', {
        role: 'assistant',
        replyLength: assistantText.length,
        model: activeModel,
        isQualifiedHandoff: isQualified
      });

      if (isBackendFallback(assistantText)) {
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
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: buildLocalAssistantReply(trimmedInput)
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage(inputValue);
  };

  const handlePromptClick = (prompt) => {
    sendMessage(prompt);
  };



  return (
    <>
      {!isOpen && (
        <button
          className="website-assistant-toggle"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          title="AI Assistant"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <section className="website-assistant-panel" aria-label="AI Assistant">
          <header className="website-assistant-header">
            <div className="website-assistant-title">
              <span className="website-assistant-avatar">
                <Sparkles size={18} />
              </span>
              <span>
                <strong>Up Rank Digital AI Assistant</strong>
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

          <div className="website-assistant-messages">
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
                  {renderMessageContentAndActions(message)}
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
                </div>
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          {!isLoading && (
            <div className="website-assistant-inline-suggestions" aria-label="Suggested questions">
              {(dynamicSuggestions && dynamicSuggestions.length > 0 ? dynamicSuggestions : suggestedPrompts).map((prompt) => (
                <button key={prompt} type="button" onClick={() => handlePromptClick(prompt)} className="suggestion-chip">
                  {prompt}
                </button>
              ))}
            </div>
          )}

          <div className="website-assistant-actions" aria-label="Contact shortcuts">
            <a href="https://wa.me/919371116165" target="_blank" rel="noreferrer">
              <MessageCircle size={14} />
              WhatsApp
            </a>
            <a href="mailto:sachin@uprankdigital.com">
              <Mail size={14} />
              Email
            </a>
          </div>

          <form className="website-assistant-form" onSubmit={handleSubmit}>
            <input
              type="text"
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
              placeholder="Ask about websites, SEO, ads, or AI..."
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
