// Loads the Google tag so the events in analytics.js have somewhere to go.
//
// Nothing is injected unless an ID is configured, so local development and any
// build without analytics stays request-free. The ID is read from Vite env at
// build time, which is why it lives in the host's environment variables rather
// than hardcoded in index.html: it differs between staging and production, and
// changing it must not require a code edit.
//
// Set one of:
//   VITE_GTM_ID=GTM-XXXXXXX          preferred if the client already uses Tag Manager
//   VITE_GA_MEASUREMENT_ID=G-XXXXXXX plain GA4, no container

const GTM_ID_PATTERN = /^GTM-[A-Z0-9]{4,}$/i;
const GA4_ID_PATTERN = /^G-[A-Z0-9]{4,}$/i;

export const isValidGtmId = (value) => GTM_ID_PATTERN.test(String(value || '').trim());
export const isValidGa4Id = (value) => GA4_ID_PATTERN.test(String(value || '').trim());

/**
 * Decides which tag to load. Pure, so it can be tested without a browser.
 * Returns { mode: 'gtm' | 'ga4' | 'none', id, warning }.
 */
export const resolveAnalyticsConfig = (env = {}) => {
  const gtmId = String(env.VITE_GTM_ID || '').trim();
  const ga4Id = String(env.VITE_GA_MEASUREMENT_ID || '').trim();

  if (gtmId && ga4Id) {
    // Loading both usually double-counts, because a GTM container almost always
    // carries its own GA4 tag. Tag Manager wins; it can fire GA4 itself.
    return {
      mode: 'gtm',
      id: gtmId,
      warning:
        'Both VITE_GTM_ID and VITE_GA_MEASUREMENT_ID are set. Using Tag Manager only, to avoid counting every event twice. Configure GA4 inside the container instead.'
    };
  }

  if (gtmId) {
    return isValidGtmId(gtmId)
      ? { mode: 'gtm', id: gtmId, warning: '' }
      : { mode: 'none', id: '', warning: `VITE_GTM_ID "${gtmId}" is not a valid container ID (expected GTM-XXXXXXX).` };
  }

  if (ga4Id) {
    return isValidGa4Id(ga4Id)
      ? { mode: 'ga4', id: ga4Id, warning: '' }
      : { mode: 'none', id: '', warning: `VITE_GA_MEASUREMENT_ID "${ga4Id}" is not a valid measurement ID (expected G-XXXXXXX).` };
  }

  return { mode: 'none', id: '', warning: '' };
};

const loadScript = (src) => {
  const script = document.createElement('script');
  script.async = true;
  script.src = src;
  document.head.appendChild(script);
};

const startGtm = (id) => {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
  loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`);
  // The <noscript> iframe is deliberately omitted: this is a React app that
  // renders nothing without JavaScript, so it could never record a visit.
};

const startGa4 = (id) => {
  window.dataLayer = window.dataLayer || [];
  // Must use `arguments`, not a rest array: gtag.js reads the raw arguments object.
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', id);
  loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`);
};

/**
 * Installs the configured tag once. Safe to call more than once.
 * Returns the active mode so callers can log or branch on it.
 */
export const initAnalytics = (env = import.meta.env) => {
  if (typeof window === 'undefined') return 'none';
  if (window.__urdAnalyticsMode) return window.__urdAnalyticsMode;

  const { mode, id, warning } = resolveAnalyticsConfig(env);

  if (warning) {
    console.warn(`[analytics] ${warning}`);
  }

  if (mode === 'gtm') {
    startGtm(id);
  } else if (mode === 'ga4') {
    startGa4(id);
  }

  // analytics.js reads this to pick exactly one delivery path.
  window.__urdAnalyticsMode = mode;
  return mode;
};
