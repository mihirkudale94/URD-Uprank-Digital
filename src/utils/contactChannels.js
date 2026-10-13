// Every WhatsApp and email entry point on the site reads from here, so the number,
// the address and the prefilled greeting cannot drift apart between the floating
// button, the contact section and the footer.

export const WHATSAPP_NUMBER_E164 = '919371116165';
export const WHATSAPP_NUMBER_DISPLAY = '+91 93711 16165';
export const CONTACT_EMAIL = 'sachin@uprankdigital.com';

const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Up Rank Digital, I'd like to talk about my website and marketing.";

// wa.me opens the app on mobile and WhatsApp Web on desktop. The prefilled text is
// a starting point the visitor can edit before sending, not a sent message.
export const buildWhatsAppUrl = (message = DEFAULT_WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(message)}`;

export const WHATSAPP_URL = buildWhatsAppUrl();
