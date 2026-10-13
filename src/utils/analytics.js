const canUseBrowser = () => typeof window !== 'undefined';

// Which delivery path is live. initAnalytics() sets __urdAnalyticsMode; the
// fallbacks below keep working if someone pastes a tag straight into index.html
// instead of configuring the env var.
const getAnalyticsMode = () => {
  if (window.__urdAnalyticsMode && window.__urdAnalyticsMode !== 'none') {
    return window.__urdAnalyticsMode;
  }
  if (Array.isArray(window.dataLayer)) return 'gtm';
  if (typeof window.gtag === 'function') return 'ga4';
  return 'none';
};

export const trackWebsiteEvent = (eventName, params = {}) => {
  if (!canUseBrowser() || !eventName) return;

  const eventPayload = {
    event_category: 'engagement',
    ...params
  };

  // Exactly one path. Sending to both double-counts every event, because a Tag
  // Manager container that defines gtag also forwards the dataLayer push.
  const mode = getAnalyticsMode();

  if (mode === 'gtm' && Array.isArray(window.dataLayer)) {
    window.dataLayer.push({
      event: eventName,
      ...eventPayload
    });
  } else if (mode === 'ga4' && typeof window.gtag === 'function') {
    window.gtag('event', eventName, eventPayload);
  }

  // Dispatched whether or not a tag is configured, so an external listener can
  // pick events up without Google Analytics in the middle.
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
