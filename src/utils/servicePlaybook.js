// `aliases` route a visitor's wording to a service and are deliberately broad.
// `fit` and `bullets` are spoken back to the visitor, so they stay limited to the five service
// lines and eight areas of expertise published on the site.
export const SERVICE_PLAYBOOK = [
  {
    id: 'website-development',
    title: 'Website Development',
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'landing', 'conversion page', 'ecommerce', 'e-commerce', 'shopify', 'redesign', 'custom website'],
    fit: 'Websites built to perform, designed around conversion optimization rather than decoration.',
    bullets: ['Website Development', 'Conversion Optimization']
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    aliases: ['marketing', 'digital marketing', 'seo', 'search engine optimization', 'local search', 'email marketing', 'newsletter', 'organic growth', 'traffic', 'search presence', 'organic', 'social media', 'social'],
    fit: 'Grow your digital presence with social media strategy and engaging content.',
    bullets: ['Social Media Strategy', 'Content Design & Management']
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing',
    aliases: ['performance marketing', 'ads', 'advertising', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'linkedin ads', 'ppc', 'paid search', 'paid social', 'paid media', 'campaign planning', 'campaign'],
    fit: 'Campaign planning and execution backed by analytics and growth strategy.',
    bullets: ['Campaign Planning & Execution', 'Analytics & Growth Strategy', 'Digital Performance Marketing']
  },
  {
    id: 'ai-solutions',
    title: 'AI Powered Solutions',
    aliases: ['ai', 'artificial intelligence', 'automation', 'chatbot', 'chat bot', 'voice agent', 'voice bot', 'ai agent', 'copilot', 'workflow automation', 'ai marketing'],
    fit: 'AI-powered strategies applied to marketing, so decisions move faster.',
    bullets: ['AI Powered Marketing Solutions']
  },
  {
    id: 'content-management',
    title: 'Content Design & Management',
    aliases: ['content', 'content design', 'content management', 'copy', 'copywriting', 'graphics', 'visuals', 'storytelling', 'reels', 'photoshoot', 'photo shoot', 'video', 'video production', 'shoot', 'social media management', 'creative', 'brand creative'],
    fit: 'Engaging content, designed and managed end to end.',
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
