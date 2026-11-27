// Per-visitor request limit shared by the public endpoints. The leading underscore keeps
// Vercel from turning this file into an endpoint of its own.
//
// shortcut: counts live in one warm instance's memory, so a burst spread across several
// instances gets more through. Fine as a cost and spam guard at this site's traffic;
// move to Vercel KV or Upstash if a real attack ever gets past it.

// The visitor's address as Vercel reports it. Vercel overwrites x-forwarded-for, so a
// visitor cannot spoof it.
export const clientKey = (request) => {
  const headers = request.headers || {};
  const forwarded = headers['x-forwarded-for'];
  const first = Array.isArray(forwarded) ? forwarded[0] : String(forwarded || '').split(',')[0];
  return first.trim() || headers['x-real-ip'] || request.socket?.remoteAddress || 'unknown';
};

// Returns isLimited(request): true once this visitor has gone past `max` calls in the
// last `windowMs`. `isLimited.reset()` clears every count, for tests.
export const createRateLimiter = ({ windowMs, max }) => {
  const recentHits = new Map();

  const isLimited = (request, now = Date.now()) => {
    const key = clientKey(request);
    const cutoff = now - windowMs;
    const hits = (recentHits.get(key) || []).filter((at) => at > cutoff);
    hits.push(now);
    recentHits.set(key, hits);

    // A long-lived instance would otherwise hold every address it has ever seen.
    if (recentHits.size > 500) {
      for (const [seen, times] of recentHits) {
        if (!times.some((at) => at > cutoff)) recentHits.delete(seen);
      }
    }

    return hits.length > max;
  };

  isLimited.reset = () => recentHits.clear();
  return isLimited;
};
