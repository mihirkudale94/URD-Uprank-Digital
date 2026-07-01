const canUseBrowser = () => typeof window !== 'undefined';

export const trackWebsiteEvent = (eventName, params = {}) => {
  if (!canUseBrowser() || !eventName) return;

  const eventPayload = {
    event_category: 'website_assistant',
    ...params
  };

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...eventPayload
    });
  }

  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventPayload);
  }

  window.dispatchEvent(new CustomEvent('urd:analytics', {
    detail: {
      eventName,
      params: eventPayload
    }
  }));
};
