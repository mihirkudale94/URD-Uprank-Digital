// The one place the site's facts live. The components, the chat assistant, the lead
// endpoint, the JSON-LD in index.html and the static privacy page all read from here, so
// the phone number, the address or a service line is changed once and changes everywhere.
//
// Plain JS with no imports and no JSX: the serverless functions in /api and vite.config.js
// load this file directly under Node, outside the Vite build.

export const SITE_URL = 'https://uprankdigital.com/';

export const BUSINESS = {
  name: 'Up Rank Digital',
  legalName: 'URD Solutions Pvt. Ltd.',
  shortName: 'URD Solutions',
  alternateNames: ['URD', 'URD Solutions', 'URD Solutions Pvt. Ltd.'],
  slogan: 'Websites and marketing measured on enquiries.',
  description:
    'Pune-based digital agency providing website development, performance marketing, content design and analytics for growing businesses.',
  foundingYear: '2017',
  logoPath: 'img/logo-header.png',
  languages: ['English', 'Hindi', 'Marathi']
};

export const CONTACT = {
  email: 'sachin@uprankdigital.com',
  phoneE164: '919371116165',
  phoneDisplay: '+91 93711 16165'
};

// One address, written one way. `lines` is how it is shown on the page; the JSON-LD
// builds its PostalAddress from the same fields, so the two cannot disagree.
export const ADDRESS = {
  streetAddress: 'Shyamal CHS',
  locality: 'Pune',
  region: 'Maharashtra',
  postalCode: '411048',
  country: 'India',
  countryCode: 'IN'
};

export const ADDRESS_LINES = [
  ADDRESS.streetAddress,
  `${ADDRESS.locality}, ${ADDRESS.region} ${ADDRESS.postalCode}, ${ADDRESS.country}`
];

export const FULL_ADDRESS = ADDRESS_LINES.join(', ');

export const AREA_SERVED = [
  { type: 'City', name: ADDRESS.locality },
  { type: 'State', name: ADDRESS.region },
  { type: 'Country', name: ADDRESS.country }
];

export const FOUNDER = {
  name: 'Sachin Raje',
  jobTitle: 'Managing Director'
};

export const SOCIAL_LINKS = {
  linkedin: 'https://in.linkedin.com/company/uprankdigital',
  facebook: 'https://www.facebook.com/UpRankDigital/'
};

// The five service lines: what a client actually buys. `text` is the one-line outcome the
// Services card leads with, and what the chat assistant is told to describe each line with.
// `forWho` and `includes` fill out the card so a visitor can tell which line is theirs.
export const SERVICES = [
  {
    id: 'website-development',
    title: 'Website Development',
    text: 'A website built to turn visitors into enquiries, not just to look good.',
    forWho: 'For new businesses, and for sites that get traffic but not calls.',
    includes: [
      'Conversion-first design and copy',
      'WordPress, Shopify or custom build',
      'Fast on mobile, with SEO foundations',
      'Forms, GA4 and call tracking wired in'
    ]
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    text: 'Stay visible and trusted where your customers already spend their time.',
    forWho: 'For brands that need a steady presence without hiring an in-house team.',
    includes: [
      'A monthly social media plan',
      'Instagram, Facebook and LinkedIn handled',
      'Community replies and page management',
      'Monthly review of reach and response'
    ]
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing',
    text: 'Google and Meta campaigns managed against cost per lead, not impressions.',
    forWho: 'For businesses ready to spend on ads that want to know what each lead costs.',
    includes: [
      'Google Search and Meta ads',
      'SEO for the searches that bring buyers',
      'Festive, launch and seasonal campaigns',
      'Budget moved toward what converts'
    ]
  },
  {
    id: 'ai-solutions',
    title: 'AI Powered Solutions',
    text: 'AI put to work where it saves your team time or wins you more leads.',
    forWho: 'For teams losing enquiries to slow replies, or spending hours on repeat work.',
    includes: [
      'Chat assistants that answer and route enquiries',
      'AI-assisted content production',
      'Lead follow-up and reporting automation',
      'Built into the tools you already use'
    ]
  },
  {
    id: 'content-management',
    title: 'Content Design & Management',
    text: 'Photos, reels, graphics and copy, produced and published every month.',
    forWho: 'For brands whose products need to look as good online as they do in hand.',
    includes: [
      'Product and brand photo shoots',
      'Reels and short-form video',
      'Graphics and copywriting',
      'Scheduled and published for you'
    ]
  }
];

// The eight capabilities: the skills behind the five service lines. Their titles are also
// the JSON-LD `knowsAbout` list.
export const EXPERTISE = [
  {
    id: 'website-development',
    title: 'Website Development',
    text: 'Design, build and launch on WordPress, Shopify or custom code. Fast on mobile and easy for your team to update.'
  },
  {
    id: 'performance-marketing',
    title: 'Digital Performance Marketing',
    text: 'Google Ads, Meta Ads and SEO, judged on cost per lead and enquiry quality instead of impressions.'
  },
  {
    id: 'ai-marketing',
    title: 'AI Powered Marketing Solutions',
    text: 'Chat assistants, content workflows and follow-up automation built into your sales funnel.'
  },
  {
    id: 'conversion-optimization',
    title: 'Conversion Optimization',
    text: 'Finding where enquiries leak, from slow pages and long forms to missed follow-ups, and fixing it.'
  },
  {
    id: 'analytics',
    title: 'Analytics & Growth Strategy',
    text: 'GA4, Search Console and call tracking set up first, so every decision rests on numbers you can trust.'
  },
  {
    id: 'content',
    title: 'Content Design & Management',
    text: 'Photo shoots, graphics, reels and copy, planned ahead and produced every month.'
  },
  {
    id: 'social-media',
    title: 'Social Media Strategy',
    text: 'Content calendars, creative and community management for Instagram, Facebook and LinkedIn.'
  },
  {
    id: 'campaigns',
    title: 'Campaign Planning & Execution',
    text: 'Festive, launch and seasonal pushes planned in advance, run on time and measured afterwards.'
  }
];

// Why work with us. Every claim is one the business already commits to elsewhere on the
// site (the founder's pitch, the process, the enquiry form), so none of it is filler.
export const WHY_US = [
  {
    id: 'founder-led',
    title: 'The founder works on your account',
    text: `${FOUNDER.name} is on your discovery call and reads your numbers every month. You are never handed down to someone you have not met.`
  },
  {
    id: 'enquiries',
    title: 'Measured on enquiries, not clicks',
    text: 'We report on enquiries and what each one cost. Likes, impressions and traffic only matter if they lead there.'
  },
  {
    id: 'ownership',
    title: 'You own everything',
    text: 'Your website, ad accounts and analytics are set up in your business name. If we ever part ways, you keep all of it.'
  },
  {
    id: 'one-team',
    title: 'One team, no finger-pointing',
    text: 'The people who build your site also run your ads and content. When something underperforms, one team owns the fix.'
  },
  {
    id: 'honest-scope',
    title: 'Only what you need right now',
    text: 'We start with the service that will move your numbers most, and add the next when results justify it. No padded packages.'
  },
  {
    id: 'proven',
    title: 'Trusted by Indian businesses',
    text: 'Businesses across every industry, from food brands to manufacturers to local services, rely on us for their growth. We work in English, Hindi and Marathi.'
  }
];

// How we work: four steps from first call to monthly report.
export const PROCESS_STEPS = [
  {
    id: 'discovery',
    title: 'Free discovery call',
    text: 'We look at your website, ads and enquiry flow and tell you honestly where leads are slipping away, even if the answer is that you do not need us yet.'
  },
  {
    id: 'plan',
    title: 'A plan in writing',
    text: 'What we will do first, what it costs, and the numbers we will be judged on. Nothing starts until you agree to it.'
  },
  {
    id: 'launch',
    title: 'Build and launch',
    text: 'We fix the site, set up tracking and take campaigns live, all inside accounts registered to your business.'
  },
  {
    id: 'report',
    title: 'Report and improve, monthly',
    text: 'Every month: what changed, how many enquiries it brought, what each one cost, and what we do next. In plain language.'
  }
];

// Pages listed in sitemap.xml. `lastmod` is the date the page's content last changed:
// update it when you edit that page, so search engines know to look again.
export const SITE_PAGES = [
  { path: '', lastmod: '2026-11-11', changefreq: 'weekly', priority: '1.0' },
  { path: 'privacy.html', lastmod: '2026-11-11', changefreq: 'yearly', priority: '0.2' }
];
