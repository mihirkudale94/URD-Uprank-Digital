// The contact form posts to /api/submit-lead, a Vercel serverless function that emails
// the inquiry. Same origin, so no keys and no CORS in the browser.

const LEAD_ENDPOINT = '/api/submit-lead';

const cleanText = (value, maxLength = 500) =>
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);

export const buildLeadPayload = ({ formData, websiteConfirmation = '' }) => ({
  name: cleanText(formData.name, 120),
  email: cleanText(formData.email, 254).toLowerCase(),
  phone: cleanText(formData.phone, 40),
  message: cleanText(formData.message, 3000),
  // The honeypot travels with the lead so the endpoint can catch a bot that filled it in
  // with JavaScript disabled or by posting here directly.
  website_confirmation: cleanText(websiteConfirmation, 100),
  page_url: cleanText(window.location.href, 500),
  user_agent: cleanText(navigator.userAgent, 500)
});

export const submitLead = async (leadPayload) => {
  let response;

  try {
    response = await fetch(LEAD_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leadPayload)
    });
  } catch {
    // Offline, DNS, blocked request: there is no response to read a message out of.
    throw new Error('We could not reach our server. Please check your connection, or WhatsApp us directly.');
  }

  // `vite dev` has no serverless runtime, so /api/* returns the index.html shell with a
  // 200 and JSON parsing blows up. Say so plainly instead of surfacing a parse error.
  const data = await response.json().catch(() => null);

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.message || 'We could not submit your inquiry right now. Please WhatsApp or email us directly.'
    );
  }

  return data ?? { success: true };
};
