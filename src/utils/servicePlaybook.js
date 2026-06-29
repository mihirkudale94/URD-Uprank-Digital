export const SERVICE_PLAYBOOK = [
  {
    id: 'digital',
    title: 'Digital & UI/UX',
    aliases: ['website', 'web', 'ui', 'ux', 'design', 'landing page', 'ecommerce', 'shopify'],
    fit: 'Best for new websites, redesigns, landing pages, and conversion-focused digital experiences.',
    bullets: ['Website and landing page builds', 'UI/UX design systems', 'Conversion-first page structure']
  },
  {
    id: 'marketing',
    title: 'Performance Marketing',
    aliases: ['growth', 'leads', 'seo', 'traffic', 'campaign', 'performance', 'funnel'],
    fit: 'Best for brands that need more qualified traffic, stronger funnels, and measurable growth.',
    bullets: ['SEO and lead-generation strategy', 'Growth funnel planning', 'Analytics and reporting']
  },
  {
    id: 'ai-growth',
    title: 'AI Growth & CRO',
    aliases: ['ai', 'automation', 'analytics', 'cro', 'conversion', 'optimize', 'optimisation', 'optimization', 'growth strategy', 'reporting', 'dashboard'],
    fit: 'Best for businesses that want AI-supported campaign planning, conversion optimization, analytics, and smarter growth decisions.',
    bullets: ['AI-powered marketing workflows', 'Conversion optimization', 'Analytics and growth strategy']
  },
  {
    id: 'advertising',
    title: 'Paid Advertising',
    aliases: ['ads', 'advertising', 'google ads', 'meta', 'linkedin', 'ppc', 'paid'],
    fit: 'Best for brands ready to drive demand through Google, Meta, LinkedIn, and paid media.',
    bullets: ['Search and display campaigns', 'Social media ads', 'Budget and audience planning']
  },
  {
    id: 'content',
    title: 'Content Design',
    aliases: ['content', 'video', 'shoot', 'photoshoot', 'copy', 'brand', 'creative'],
    fit: 'Best for brands that need sharper storytelling, product visuals, and campaign-ready content.',
    bullets: ['Brand storytelling', 'Product shoots and videos', 'Social content systems']
  },
  {
    id: 'software',
    title: 'Custom Software',
    aliases: ['software', 'app', 'application', 'cms', 'lms', 'api', 'integration', 'portal'],
    fit: 'Best for businesses that need custom apps, portals, CMS/LMS work, or business integrations.',
    bullets: ['Web and mobile applications', 'CMS/LMS integrations', 'Business system workflows']
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
