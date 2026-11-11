// Every WhatsApp, phone and email entry point on the site reads from here. The values
// themselves live in src/data/siteContent.js; this file builds the links from them.
// Relative import with the extension, because /api imports this file under plain Node.
import { CONTACT } from '../data/siteContent.js';

export const WHATSAPP_NUMBER_E164 = CONTACT.phoneE164;
export const WHATSAPP_NUMBER_DISPLAY = CONTACT.phoneDisplay;
export const CONTACT_EMAIL = CONTACT.email;
// tel: dials straight away on a phone, which is the most common way a local lead calls.
export const PHONE_TEL_URL = `tel:+${WHATSAPP_NUMBER_E164}`;
export const EMAIL_URL = `mailto:${CONTACT_EMAIL}`;

const DEFAULT_WHATSAPP_MESSAGE =
  "Hi Up Rank Digital, I'd like to talk about my website and marketing.";

// wa.me opens the app on mobile and WhatsApp Web on desktop. The prefilled text is
// a starting point the visitor can edit before sending, not a sent message.
export const buildWhatsAppUrl = (message = DEFAULT_WHATSAPP_MESSAGE) =>
  `https://wa.me/${WHATSAPP_NUMBER_E164}?text=${encodeURIComponent(message)}`;

export const WHATSAPP_URL = buildWhatsAppUrl();
