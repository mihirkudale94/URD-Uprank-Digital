// Remembers where a visitor came from, so a lead can say which campaign, keyword or
// site sent it. Ad clicks land with UTM tags and click IDs in the URL, but by the time
// someone fills in the form they may have scrolled for ten minutes or come back three
// days later, and the URL is clean. So the source is read once on arrival and kept.
//
// Two touches are kept:
//   first: the visit that introduced them (kept 90 days, never overwritten)
//   last:  the most recent visit that carried a campaign tag or an outside referrer
// Nothing here is personal data: it is the URL they landed on and the site they came from.

const STORAGE_KEY = 'urd_attribution';
const MAX_AGE_MS = 90 * 24 * 60 * 60 * 1000;

export const ATTRIBUTION_PARAMS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'gclid', // Google Ads
  'gbraid', // Google Ads, iOS app-to-web
  'wbraid', // Google Ads, iOS web-to-web
  'fbclid', // Meta
  'li_fat_id', // LinkedIn
  'msclkid' // Microsoft Ads
];

const TOUCH_FIELDS = [...ATTRIBUTION_PARAMS, 'referrer', 'landing_page', 'captured_at'];

const clip = (value, max = 300) => String(value ?? '').trim().slice(0, max);

const hostOf = (url) => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

/**
 * Reads one visit's source from its URL and referrer. Pure, so it is testable.
 * Returns null when the visit carries no source worth recording (a direct visit or a
 * click from another page of this site).
 */
export const parseTouch = (pageUrl, referrer = '', now = Date.now()) => {
  let url;
  try {
    url = new URL(pageUrl);
  } catch {
    return null;
  }

  const touch = {};
  for (const key of ATTRIBUTION_PARAMS) {
    const value = clip(url.searchParams.get(key), 200);
    if (value) touch[key] = value;
  }

  const ownHost = url.hostname.replace(/^www\./, '');
  const referrerHost = hostOf(referrer);
  const externalReferrer = referrerHost && referrerHost !== ownHost ? clip(referrer) : '';

  if (!Object.keys(touch).length && !externalReferrer) return null;

  if (externalReferrer) touch.referrer = externalReferrer;
  touch.landing_page = clip(`${url.origin}${url.pathname}${url.search}`);
  touch.captured_at = new Date(now).toISOString();
  return touch;
};

/** Merges a new visit into what is stored. Pure. */
export const mergeAttribution = (stored, touch, now = Date.now()) => {
  const firstIsFresh =
    stored?.first?.captured_at && now - Date.parse(stored.first.captured_at) < MAX_AGE_MS;
  const current = firstIsFresh ? stored : {};

  if (!touch) return current;
  return { first: current.first || touch, last: touch };
};

/** Keeps only known fields with short string values, whatever shape arrives. */
export const sanitizeTouch = (touch) => {
  if (!touch || typeof touch !== 'object') return null;
  const clean = {};
  for (const key of TOUCH_FIELDS) {
    const value = clip(touch[key]);
    if (value) clean[key] = value;
  }
  return Object.keys(clean).length ? clean : null;
};

const readStored = () => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null');
  } catch {
    return null;
  }
};

/** Call once on page load. Safe if storage is blocked: attribution is just lost. */
export const captureAttribution = () => {
  if (typeof window === 'undefined') return;
  const touch = parseTouch(window.location.href, document.referrer);
  const merged = mergeAttribution(readStored(), touch);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Private mode or blocked storage. The lead still goes through without a source.
  }
};

/** What the form sends with a lead. */
export const getAttribution = () => {
  if (typeof window === 'undefined') return {};
  const stored = mergeAttribution(readStored(), null);
  return {
    first: sanitizeTouch(stored.first),
    last: sanitizeTouch(stored.last)
  };
};
