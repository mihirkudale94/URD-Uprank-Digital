// The one place the site's facts live. The components, the chat assistant, the lead
// endpoint, the JSON-LD in index.html and the static privacy page all read from here, so
// the phone number, the address or a service line is changed once and changes everywhere.
//
// Plain JS with no imports and no JSX: the serverless functions in /api and vite.config.js
// load this file directly under Node, outside the Vite build.

// The address the site is actually served from. Vercel 308-redirects the bare domain to
// www, so the canonical tag, sitemap, robots.txt, Open Graph and JSON-LD must all say www:
// pointing them at an address that redirects tells Google two different things.
export const SITE_URL = 'https://www.uprankdigital.com/';

export const BUSINESS = {
  name: 'Up Rank Digital',
  legalName: 'URD Solutions Pvt. Ltd.',
  shortName: 'URD Solutions',
  alternateNames: ['URD', 'URD Solutions', 'URD Solutions Pvt. Ltd.'],
  slogan: 'IT solutions measured on enquiries.',
  description:
    'Pune-based IT solutions company providing website development, AI automation, digital and performance marketing, content design and analytics for growing businesses.',
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
  streetAddress: 'Shyamal CHS, VIIT College Road, Kondhwa Budruk',
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

// The office on Google Maps. No API key: the map is Google's keyless embed.
//
// MAP_LINK is the office's own Google Maps share link: "Get directions" opens it, so the
// visitor lands on exactly the place the business chose.
//
// MAP_PLACE is what the embedded map searches for to drop its pin. An embed cannot take a
// share link, so it needs the place itself: its name as Google Maps shows it, a plus code,
// or "lat,lng". Do not put the street line here: Google does not know "Shyamal CHS" and
// drops the pin in the wrong village. If the name ever resolves wrongly, the plus code
// 'FV4J+VQQ Kondhwa Budruk, Pune, Maharashtra 411048' pins the same spot.
const MAP_LINK = 'https://maps.app.goo.gl/hMVzpkcoUZSXPKnr9';
const MAP_PLACE = 'Shyamal Society, VIIT College Rd, Kondhwa Budruk, Pune, Maharashtra 411048';
export const MAP_QUERY =
  MAP_PLACE || `${ADDRESS.locality}, ${ADDRESS.region} ${ADDRESS.postalCode}, ${ADDRESS.country}`;
// Street level for the exact office; neighbourhood level for the postcode fallback.
export const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&z=${MAP_PLACE ? 16 : 13}&output=embed`;
export const MAP_DIRECTIONS_URL =
  MAP_LINK || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

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
      'Shopify or custom build',
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
    text: 'Design, build and launch on Shopify or custom code. Fast on mobile and easy for your team to update.'
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

// One landing page per service line, served at /services/<id>/. Each targets the search a
// Pune buyer actually types, so the title and h1 lead with the service and the city.
// Keep every answer to something the business already commits to elsewhere on the site.
export const SERVICE_PAGES = {
  'website-development': {
    metaTitle: 'Website Development Company in Pune | Up Rank Digital',
    metaDescription:
      'Fast Shopify and custom websites built to turn visitors into enquiries, with GA4, call tracking and SEO foundations included. Pune-based, founder-led.',
    heading: 'Website development in Pune, built to bring in enquiries',
    intro:
      'Most business websites look fine and still do not ring the phone. We design and build Shopify and custom websites where every page has one job: turning a visitor into a call, a WhatsApp message or a form.',
    problems: [
      'Your site gets traffic, but almost nobody calls or fills the form',
      'It is slow on mobile, where most of your visitors are',
      'You cannot tell which page or ad an enquiry came from',
      'Every small text change means waiting on a developer'
    ],
    faqs: [
      {
        q: 'Do you build on Shopify or custom code?',
        a: 'Both. Shopify suits most online stores; a custom build suits service businesses and anything Shopify cannot do well. We recommend one on the discovery call based on what you sell.'
      },
      {
        q: 'Who owns the website and the domain?',
        a: 'You do. The domain, hosting, store and analytics are registered in your business name. If we ever part ways, you keep all of it.'
      },
      {
        q: 'How long does a website take and what does it cost?',
        a: 'It depends on the number of pages, products and integrations. After the free discovery call you get a written plan with the scope, timeline and price before any work starts.'
      },
      {
        q: 'Will the site be set up for SEO and tracking?',
        a: 'Yes. Every site launches with mobile speed work, SEO foundations, GA4, Search Console and form and call tracking, so you can see what each page brings in.'
      }
    ]
  },
  'digital-marketing': {
    metaTitle: 'Social Media Marketing in Pune | Up Rank Digital',
    metaDescription:
      'Monthly content plans and Instagram, Facebook and LinkedIn management from a Pune IT solutions company, with a monthly review of results.',
    heading: 'Social media and digital marketing in Pune, handled every month',
    intro:
      'Customers check your Instagram and LinkedIn before they call. We plan, post and manage your pages every month so your brand looks active and trustworthy, without you hiring an in-house team.',
    problems: [
      'Your pages have not been updated in weeks',
      'Posting happens only when someone remembers',
      'Messages and comments go unanswered',
      'You cannot tell whether social media is doing anything for the business'
    ],
    faqs: [
      {
        q: 'Which platforms do you manage?',
        a: 'Instagram, Facebook and LinkedIn. We pick the ones your customers actually use rather than being everywhere for the sake of it.'
      },
      {
        q: 'Do I approve posts before they go live?',
        a: 'Yes. You see the monthly plan in advance and approve it before anything is scheduled.'
      },
      {
        q: 'Do you create the content too?',
        a: 'Yes. Graphics, copy and reels are produced by the same team. Photo and video shoots are part of our content design service.'
      },
      {
        q: 'How do you report results?',
        a: 'A monthly review in plain language: reach, response, enquiries that came from social, and what we will change next month.'
      }
    ]
  },
  'performance-marketing': {
    metaTitle: 'Google Ads & Meta Ads Management in Pune | Up Rank Digital',
    metaDescription:
      'Google Search, Meta ads and SEO managed against cost per lead, not impressions. Accounts in your name, monthly reporting on enquiries.',
    heading: 'Google Ads and Meta Ads in Pune, managed against cost per lead',
    intro:
      'Clicks and impressions do not pay salaries. We run Google Search, Meta ads and SEO measured on one number: what each genuine enquiry costs you, and we move budget toward whatever brings that down.',
    problems: [
      'You spend on ads every month but cannot say what a lead costs',
      'Reports talk about impressions and clicks, not enquiries',
      'Leads come in, but many are not serious buyers',
      'The ad account was set up by someone else and you do not have access'
    ],
    faqs: [
      {
        q: 'What budget do I need to start?',
        a: 'It depends on your market and how competitive your keywords are. On the discovery call we look at your numbers and suggest a starting budget you can test without risking much.'
      },
      {
        q: 'Who owns the ad accounts?',
        a: 'You do. Google Ads, Meta Business Manager and analytics are set up in your business name, with your billing.'
      },
      {
        q: 'How do you track which ads bring enquiries?',
        a: 'We set up GA4, conversion tracking and call and form tracking before ads go live, and tag every campaign, so each enquiry can be traced to the ad and keyword that produced it.'
      },
      {
        q: 'Do you also do SEO?',
        a: 'Yes, focused on the searches that bring buyers in your city and category, so you are not paying for every visit forever.'
      }
    ]
  },
  'ai-solutions': {
    metaTitle: 'AI Chatbots & Automation in Pune | Up Rank Digital',
    metaDescription:
      'AI chat assistants that answer and route enquiries, plus content and lead follow-up automation, built into the tools you already use.',
    heading: 'AI chatbots and automation that answer leads faster',
    intro:
      'Enquiries are often won by whoever replies first. We build AI assistants that answer visitors instantly and pass serious leads to your team, and automate the follow-up and reporting work your team repeats every day.',
    problems: [
      'Enquiries that arrive at night or on weekends wait hours for a reply',
      'Your team answers the same questions again and again',
      'Leads are not followed up consistently',
      'Weekly reports take hours to put together by hand'
    ],
    faqs: [
      {
        q: 'Can I see an example?',
        a: 'Yes. The chat assistant on this website is one we built. Open it and ask it anything about our services.'
      },
      {
        q: 'Will the chatbot make things up about my business?',
        a: 'It is set up to answer only from information you approve, and to hand the conversation to your team when it does not know.'
      },
      {
        q: 'Does it work with WhatsApp, my CRM or my email?',
        a: 'We build it into the tools you already use, so leads land where your team already works instead of in yet another dashboard.'
      },
      {
        q: 'Do I need a technical team to run it?',
        a: 'No. We set it up, test it and keep it updated as your services and prices change.'
      }
    ]
  },
  'content-management': {
    metaTitle: 'Product Photography & Reels in Pune | Up Rank Digital',
    metaDescription:
      'Pune content design and management: product and brand photo shoots, reels, graphics and copywriting, produced and published every month.',
    heading: 'Product shoots, reels and content in Pune, produced every month',
    intro:
      'Good products lose sales to bad photos. We plan and produce product and brand shoots, reels, graphics and copy, then schedule and publish them, so your brand looks as good online as it does in hand.',
    problems: [
      'Your product photos were taken on a phone and it shows',
      'You know you need reels but nobody has time to make them',
      'Your brand looks different on every platform',
      'Content is made at the last minute, before every festival'
    ],
    faqs: [
      {
        q: 'Do you shoot products in Pune?',
        a: 'Yes. We plan and run product and brand shoots, including large product ranges in a short time, and deliver images ready for your website, marketplaces and social media.'
      },
      {
        q: 'Do you make reels and short videos?',
        a: 'Yes. Reels and short-form video are planned, shot, edited and published as part of the monthly plan.'
      },
      {
        q: 'Can you write copy in Hindi and Marathi?',
        a: 'We work in English, Hindi and Marathi, so content can speak to customers in the language they prefer.'
      },
      {
        q: 'Who owns the photos and videos?',
        a: 'You do. Everything we produce for you is yours to use on any channel.'
      }
    ]
  }
};

export const servicePath = (id) => `services/${id}/`;

// Pages listed in sitemap.xml. `lastmod` is the date the page's content last changed:
// update it when you edit that page, so search engines know to look again.
export const SITE_PAGES = [
  { path: '', lastmod: '2026-11-27', changefreq: 'weekly', priority: '1.0' },
  ...Object.keys(SERVICE_PAGES).map((id) => ({
    path: servicePath(id),
    lastmod: '2026-11-27',
    changefreq: 'monthly',
    priority: '0.8'
  })),
  { path: 'privacy.html', lastmod: '2026-11-11', changefreq: 'yearly', priority: '0.2' }
];
