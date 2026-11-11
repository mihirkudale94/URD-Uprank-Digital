// Sends the assistant conversation to /api/chat-log once the visitor leaves the page, so
// the team can read what visitors actually ask. See api/chat-log.js for what happens to it.
//
// sendBeacon is the one request a browser still delivers while the page is being hidden or
// closed; a fetch started then is usually cancelled.

import { getAttribution } from './attribution.js';

const CHAT_LOG_ENDPOINT = '/api/chat-log';
const LOGGED_COUNT_KEY = 'urd_assistant_logged_count';

const readLoggedCount = () => {
  try {
    return Number(sessionStorage.getItem(LOGGED_COUNT_KEY)) || 0;
  } catch {
    return 0;
  }
};

const writeLoggedCount = (count) => {
  try {
    sessionStorage.setItem(LOGGED_COUNT_KEY, String(count));
  } catch {
    // Storage blocked: at worst a transcript is sent twice.
  }
};

export const resetTranscriptLog = () => writeLoggedCount(0);

// Messages flagged `local` were written by the widget itself (the consultation
// confirmation carries the visitor's name and company), so they stay out of the log.
export const sendTranscriptLog = ({ messages, leadSubmitted }) => {
  if (typeof navigator === 'undefined' || typeof navigator.sendBeacon !== 'function') return false;

  const shareable = messages.filter((message) => !message.local && message.content);
  // Only when the visitor has said something since the last transcript went out.
  if (shareable.length <= readLoggedCount() || !shareable.some((message) => message.role === 'user')) {
    return false;
  }

  const payload = JSON.stringify({
    messages: shareable.map(({ role, content }) => ({ role, content })),
    lead_submitted: Boolean(leadSubmitted),
    page_url: window.location.href.slice(0, 300),
    attribution: getAttribution()
  });

  const sent = navigator.sendBeacon(CHAT_LOG_ENDPOINT, new Blob([payload], { type: 'application/json' }));
  if (sent) writeLoggedCount(shareable.length);
  return sent;
};
