// Lets any part of the page open the chat assistant without importing it: the assistant is
// lazy-loaded on its own chunk, so the rest of the page talks to it through a window event.
export const OPEN_ASSISTANT_EVENT = 'urd:open-assistant';

export const requestOpenAssistant = (location) => {
  window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT, { detail: { location } }));
};
