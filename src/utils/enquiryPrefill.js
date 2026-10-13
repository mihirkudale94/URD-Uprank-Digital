// A visitor who has just described their business to the assistant should not have to
// type it again into the enquiry form two seconds later. The chat panel hands the form
// what the visitor said, the form drops it into the goal field, and the lead that
// reaches Sachin arrives with the context already attached.
//
// The two components never meet in the tree, so the handover is an event plus a
// sessionStorage copy: the event covers the normal case, the copy covers a form that
// mounts after the chat has already fired it.

export const ENQUIRY_PREFILL_EVENT = 'urd:enquiry-prefill';
export const ENQUIRY_PREFILL_KEY = 'urd_enquiry_prefill';

// Only what the visitor typed. The assistant's own replies are the agency's words, and
// echoing them back into a lead tells Sachin nothing he did not already know.
const MAX_TURNS = 6;
const MAX_LENGTH = 1200;

export const buildEnquiryPrefill = (messages = []) => {
  const spoken = messages
    .filter((message) => message?.role === 'user' && typeof message.content === 'string')
    .map((message) => message.content.trim().replace(/\s+/g, ' '))
    .filter(Boolean)
    .slice(-MAX_TURNS);

  if (!spoken.length) return '';

  const body = spoken.map((line) => `- ${line}`).join('\n');
  return `From my chat with the assistant:\n${body}`.slice(0, MAX_LENGTH);
};

export const publishEnquiryPrefill = (messages) => {
  const prefill = buildEnquiryPrefill(messages);
  if (!prefill) return '';

  try {
    sessionStorage.setItem(ENQUIRY_PREFILL_KEY, prefill);
  } catch {
    // Private mode or blocked storage: the event below still covers the live page.
  }

  window.dispatchEvent(new CustomEvent(ENQUIRY_PREFILL_EVENT, { detail: { prefill } }));
  return prefill;
};

export const readEnquiryPrefill = () => {
  try {
    return sessionStorage.getItem(ENQUIRY_PREFILL_KEY) || '';
  } catch {
    return '';
  }
};

export const clearEnquiryPrefill = () => {
  try {
    sessionStorage.removeItem(ENQUIRY_PREFILL_KEY);
  } catch {
    // Nothing to clear if storage was never readable.
  }
};
