export const SERVICE_PLAYBOOK = [
  {
    id: 'website-development',
    title: 'Website Development',
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'landing', 'conversion page', 'ecommerce', 'shopify', 'redesign', 'custom website'],
    fit: 'Best for custom website designs, Shopify e-commerce, landing page optimization, and UI/UX systems.',
    bullets: ['Custom website design & dev', 'E-commerce & Shopify builds', 'Landing page optimization', 'UI/UX interface systems']
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    aliases: ['marketing', 'digital marketing', 'seo', 'search engine optimization', 'local search', 'email marketing', 'newsletter', 'organic growth', 'traffic', 'search presence', 'organic'],
    fit: 'Best for brands that want to grow their organic presence, improve search visibility, and increase social media engagement.',
    bullets: ['Search Engine Optimization (SEO)', 'Social Media Strategy & Marketing', 'Local Search Presence', 'Organic Traffic Growth']
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing',
    aliases: ['performance marketing', 'ads', 'advertising', 'google ads', 'meta ads', 'facebook ads', 'instagram ads', 'linkedin ads', 'ppc', 'paid search', 'paid social', 'paid media', 'remarketing', 'campaign planning'],
    fit: 'Best for businesses ready to scale with data-driven paid advertising campaigns, paid social, and campaign planning.',
    bullets: ['Google PPC & Paid Search', 'Meta & LinkedIn Advertising', 'Conversion Rate Optimization (CRO)', 'ROI Analytics & Campaign Strategy']
  },
  {
    id: 'ai-solutions',
    title: 'AI Powered Solutions',
    aliases: ['ai', 'artificial intelligence', 'automation', 'chatbot', 'chat bot', 'voice agent', 'voice bot', 'ai agent', 'copilot', 'rag', 'smart solutions', 'workflow automation', 'agent integration'],
    fit: 'Best for teams wanting to integrate AI lead-qualification chatbots, conversational AI voice agents, and custom workflow automation.',
    bullets: ['AI Lead Gen Chatbots', 'Conversational AI & Voice Agents', 'Workflow & Business Automation', 'Smart Customer Support Integration']
  },
  {
    id: 'content-management',
    title: 'Content Design & Management',
    aliases: ['content', 'content design', 'content management', 'copy', 'copywriting', 'graphics', 'visuals', 'storytelling', 'reels', 'photoshoot', 'video production', 'social media management', 'shoot', 'brand creative'],
    fit: 'Best for brands needing high-impact storytelling, premium visuals, copy, and complete social channel management.',
    bullets: ['Professional Copywriting', 'Graphic Design & Brand Collateral', 'High-Impact Photo & Video Shoots', 'Social Feed Design & Management']
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
