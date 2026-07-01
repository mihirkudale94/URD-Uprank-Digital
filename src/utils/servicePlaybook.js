export const SERVICE_PLAYBOOK = [
  {
    id: 'digital',
    title: 'Digital & UI/UX',
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'landing', 'conversion page', 'ecommerce', 'shopify', 'redesign'],
    fit: 'Best for new websites, redesigns, landing pages, and conversion-focused digital experiences.',
    bullets: ['Website and landing page builds', 'UI/UX design systems', 'Conversion-first page structure']
  },
  {
    id: 'marketing',
    title: 'Performance Marketing',
    aliases: ['growth', 'leads', 'lead generation', 'seo', 'traffic', 'campaign', 'performance', 'funnel', 'qualified leads', 'roi reporting'],
    fit: 'Best for brands that need more qualified traffic, stronger funnels, and measurable growth.',
    bullets: ['SEO and lead-generation strategy', 'Growth funnel planning', 'Analytics and reporting']
  },
  {
    id: 'ai-growth',
    title: 'AI Growth & CRO',
    aliases: ['ai', 'automation', 'analytics', 'cro', 'conversion', 'convert', 'not converting', 'optimize', 'optimisation', 'optimization', 'growth strategy', 'reporting', 'dashboard', 'chatbot', 'chat bot', 'voice agent', 'voice bot', 'ai agent', 'copilot', 'rag', 'customer support automation', 'lead qualification', 'sales automation'],
    fit: 'Best for businesses that want AI chat or voice agents, conversion optimization, analytics, and smarter growth workflows connected to measurable outcomes.',
    bullets: ['AI chatbots and voice-agent lead qualification', 'Conversion optimization and funnel testing', 'Analytics, reporting, and growth automation']
  },
  {
    id: 'advertising',
    title: 'Paid Advertising',
    aliases: ['ads', 'advertising', 'google ads', 'meta', 'facebook', 'instagram', 'linkedin', 'ppc', 'paid', 'paid media', 'remarketing'],
    fit: 'Best for brands ready to drive demand through Google, Meta, LinkedIn, and paid media.',
    bullets: ['Search and display campaigns', 'Social media ads', 'Budget and audience planning']
  },
  {
    id: 'content',
    title: 'Content Design',
    aliases: ['content', 'video', 'shoot', 'photoshoot', 'copy', 'brand', 'creative', 'social media', 'reels', 'campaign creative'],
    fit: 'Best for brands that need sharper storytelling, product visuals, and campaign-ready content.',
    bullets: ['Brand storytelling', 'Product shoots and videos', 'Social content systems']
  },
  {
    id: 'software',
    title: 'Custom Software',
    aliases: ['software', 'app', 'application', 'cms', 'lms', 'api', 'integration', 'portal', 'dashboard', 'crm', 'workflow'],
    fit: 'Best for businesses that need custom apps, portals, CMS/LMS work, or business integrations.',
    bullets: ['Web and mobile applications', 'CMS/LMS integrations', 'Business system workflows']
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
