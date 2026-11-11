// Relative, with the extension: `api/chat.js` imports this file directly, so the Vite `@`
// alias would not resolve inside the serverless function.
import { CONTACT_EMAIL, WHATSAPP_NUMBER_DISPLAY } from './contactChannels.js';
import { SERVICES } from '../data/siteContent.js';

const serviceById = (id) => {
  const service = SERVICES.find((item) => item.id === id);
  if (!service) throw new Error(`servicePlaybook: no service "${id}" in siteContent.js`);
  return service;
};

// Said back to the visitor when no model could be reached. Both ends of the chat import
// this one literal: the endpoint writes it into the `urd_fallback` frame, and the widget
// compares the finished reply against it to recognise that frame even if it missed the
// flag. Two hand-written copies would drift, and a drifted copy is a fallback reply the
// widget no longer recognises and leaves on screen.
export const FALLBACK_REPLY =
  `I am having trouble connecting right now. You can WhatsApp Up Rank Digital at ${WHATSAPP_NUMBER_DISPLAY} or email ${CONTACT_EMAIL}, and the team will pick this up directly.`;

// The words the model uses to invite a visitor to a consultation. The widget looks for them
// to offer the in-chat consultation form, and the endpoint looks for them to know the
// invitation has already been made, so all three key on this one literal.
export const CONSULTATION_PHRASE = 'request a consultation';

// `aliases` route a visitor's wording to a service and are deliberately broad.
// `fit` and `bullets` are spoken back to the visitor, so they stay limited to the five service
// lines and eight areas of expertise published on the site.
export const SERVICE_PLAYBOOK = [
  {
    id: 'website-development',
    title: serviceById('website-development').title,
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'landing', 'conversion page', 'ecommerce', 'e-commerce', 'shopify', 'redesign', 'custom website'],
    fit: serviceById('website-development').text,
    bullets: ['Website Development', 'Conversion Optimization']
  },
  {
    id: 'digital-marketing',
    title: serviceById('digital-marketing').title,
    aliases: ['marketing', 'digital marketing', 'seo', 'search engine optimization', 'local search', 'email marketing', 'newsletter', 'organic growth', 'traffic', 'search presence', 'organic', 'social media', 'social'],
    fit: serviceById('digital-marketing').text,
    bullets: ['Social Media Strategy', 'Content Design & Management']
  },
  {
    id: 'performance-marketing',
    title: serviceById('performance-marketing').title,
    aliases: ['performance marketing', 'ads', 'advertising', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'linkedin ads', 'ppc', 'paid search', 'paid social', 'paid media', 'campaign planning', 'campaign'],
    fit: serviceById('performance-marketing').text,
    bullets: ['Campaign Planning & Execution', 'Analytics & Growth Strategy', 'Digital Performance Marketing']
  },
  {
    id: 'ai-solutions',
    title: serviceById('ai-solutions').title,
    aliases: ['ai', 'artificial intelligence', 'automation', 'chatbot', 'chat bot', 'voice agent', 'voice bot', 'ai agent', 'copilot', 'workflow automation', 'ai marketing'],
    fit: serviceById('ai-solutions').text,
    bullets: ['AI Powered Marketing Solutions']
  },
  {
    id: 'content-management',
    title: serviceById('content-management').title,
    aliases: ['content', 'content design', 'content management', 'copy', 'copywriting', 'graphics', 'visuals', 'storytelling', 'reels', 'photoshoot', 'photo shoot', 'video', 'video production', 'shoot', 'social media management', 'creative', 'brand creative'],
    fit: serviceById('content-management').text,
    bullets: ['Content Design & Management', 'Social Media Strategy']
  }
];

const INTENT_SIGNAL_RULES = [
  {
    id: 'urgent',
    label: 'Urgent handoff',
    aliases: ['urgent', 'asap', 'immediately', 'today', 'call me', 'need a call', 'talk to human', 'human', 'support']
  },
  {
    id: 'ai-agent',
    label: 'AI agent build',
    aliases: ['chatbot', 'chat bot', 'voice agent', 'ai agent', 'copilot', 'virtual agent', 'rag', 'llm', 'automation']
  },
  {
    id: 'budget',
    label: 'Budget question',
    aliases: ['price', 'pricing', 'cost', 'budget', 'package', 'quote', 'proposal']
  },
  {
    id: 'measurement',
    label: 'Measurement focus',
    aliases: ['roi', 'analytics', 'report', 'tracking', 'dashboard', 'conversion', 'leads', 'sales']
  }
];

export const getServiceMatch = (input) => {
  if (!input || typeof input !== 'string') return null;
  const lower = input.toLowerCase();
  
  let bestMatch = null;
  let longestAliasLength = 0;

  SERVICE_PLAYBOOK.forEach(service => {
    service.aliases.forEach(alias => {
      // Escape special characters in alias
      const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      // Match whole word or phrase, with optional plural 's' at the end
      const regex = new RegExp(`\\b${escaped}s?\\b`, 'i');
      if (regex.test(lower)) {
        // If this match is more specific (longer text), it takes priority
        if (alias.length > longestAliasLength) {
          longestAliasLength = alias.length;
          bestMatch = service;
        }
      }
    });
  });

  return bestMatch;
};

export const getLeadIntentSignals = (input) => {
  if (!input || typeof input !== 'string') return [];
  const lower = input.toLowerCase();

  return INTENT_SIGNAL_RULES.filter(signal =>
    signal.aliases.some(alias => {
      const escaped = alias.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return new RegExp(`\\b${escaped}s?\\b`, 'i').test(lower);
    })
  ).map(({ id, label }) => ({ id, label }));
};
