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
  slogan: 'Creating impact online. Winning results together.',
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

// The five service lines. `text` is what the Services section shows and what the chat
// assistant is told to describe each line with.
export const SERVICES = [
  {
    id: 'website-development',
    title: 'Website Development',
    text: 'Websites built to perform — designed around conversion optimization, not decoration.'
  },
  {
    id: 'digital-marketing',
    title: 'Digital Marketing',
    text: 'Grow your digital presence with social media strategy and engaging content.'
  },
  {
    id: 'performance-marketing',
    title: 'Performance Marketing',
    text: 'Campaign planning and execution backed by analytics and growth strategy.'
  },
  {
    id: 'ai-solutions',
    title: 'AI Powered Solutions',
    text: 'AI-powered strategies applied to marketing, so decisions move faster.'
  },
  {
    id: 'content-management',
    title: 'Content Design & Management',
    text: 'Engaging content, designed and managed end to end.'
  }
];

// The eight areas of expertise. Their titles are also the JSON-LD `knowsAbout` list.
export const EXPERTISE = [
  {
    id: 'website-development',
    title: 'Website Development',
    text: 'Design, build and launch — WordPress, Shopify or custom-coded.'
  },
  {
    id: 'performance-marketing',
    title: 'Digital Performance Marketing',
    text: 'Google and Meta ads plus SEO — managed against cost per lead, not impressions.'
  },
  {
    id: 'ai-marketing',
    title: 'AI Powered Marketing Solutions',
    text: 'Chat assistants, content systems and automation wired into your funnel.'
  },
  {
    id: 'conversion-optimization',
    title: 'Conversion Optimization',
    text: 'Fixing the leaks — forms, page speed, mobile flow, enquiry follow-up.'
  },
  {
    id: 'analytics',
    title: 'Analytics & Growth Strategy',
    text: 'GA4, Search Console and call tracking set up so the numbers are trustworthy.'
  },
  {
    id: 'content',
    title: 'Content Design & Management',
    text: 'Shoots, graphics, reels and copy — produced and scheduled every month.'
  },
  {
    id: 'social-media',
    title: 'Social Media Strategy',
    text: 'Calendar, creative and community handling for Instagram, Facebook, LinkedIn.'
  },
  {
    id: 'campaigns',
    title: 'Campaign Planning & Execution',
    text: 'Festive, launch and seasonal pushes planned, run and measured.'
  }
];

// Pages listed in sitemap.xml. `lastmod` is the date the page's content last changed:
// update it when you edit that page, so search engines know to look again.
export const SITE_PAGES = [
  { path: '', lastmod: '2026-11-11', changefreq: 'weekly', priority: '1.0' },
  { path: 'privacy.html', lastmod: '2026-11-11', changefreq: 'yearly', priority: '0.2' }
];
