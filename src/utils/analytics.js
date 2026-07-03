const canUseBrowser = () => typeof window !== 'undefined';

export const trackWebsiteEvent = (eventName, params = {}) => {
  if (!canUseBrowser() || !eventName) return;

  const eventPayload = {
    event_category: 'website_assistant',
    ...params
  };

  // Google Tag Manager / dataLayer push
  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...eventPayload
    });
  }

  // Google Analytics gtag call
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventPayload);
  }

  // Developer custom event dispatch for external listener integrations
  try {
    window.dispatchEvent(
      new CustomEvent('urd-assistant-event', {
        detail: {
          action: eventName,
          ...params
        }
      })
    );
  } catch (err) {
    console.warn('Failed to dispatch urd-assistant-event:', err);
  }

  // Fallback custom event dispatch
  try {
    window.dispatchEvent(
      new CustomEvent('urd:analytics', {
        detail: {
          eventName,
          params: eventPayload
        }
      })
    );
  } catch (err) {
    console.warn('Failed to dispatch urd:analytics:', err);
  }
};
