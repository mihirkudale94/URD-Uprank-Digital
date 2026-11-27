// Builds robots.txt and sitemap.xml from siteContent.js. vite.config.js serves them in
// dev and writes them into dist/ at build, so the site address is never typed into them.
import {
  BUSINESS,
  CONTACT,
  FOUNDER,
  FULL_ADDRESS,
  SERVICES,
  SITE_PAGES,
  SITE_URL,
  WHY_US,
  servicePath
} from './siteContent.js';

const pageUrl = (pagePath) => new URL(pagePath, SITE_URL).href;

export const renderRobotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${pageUrl('sitemap.xml')}\n`;

export const renderSitemapXml = () => {
  const urls = SITE_PAGES.map(
    (page) => `  <url>
    <loc>${pageUrl(page.path)}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  ).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

// llms.txt (llmstxt.org): a plain summary AI assistants such as ChatGPT, Perplexity and
// Gemini read when someone asks them for an IT company in Pune. Built from the same
// facts as the page, so it cannot describe a service the site does not offer.
export const renderLlmsTxt = () =>
  [
    `# ${BUSINESS.name}`,
    '',
    `> ${BUSINESS.description}`,
    '',
    `${BUSINESS.name} (${BUSINESS.legalName}) is founder-led by ${FOUNDER.name}, ${FOUNDER.jobTitle}, and has been in business since ${BUSINESS.foundingYear}. Office: ${FULL_ADDRESS}. Works in ${BUSINESS.languages.join(', ')}.`,
    '',
    '## Services',
    '',
    ...SERVICES.map((service) => `- [${service.title}](${pageUrl(servicePath(service.id))}): ${service.text} ${service.forWho}`),
    '',
    '## Why clients choose us',
    '',
    ...WHY_US.map((item) => `- ${item.title}: ${item.text}`),
    '',
    '## Contact',
    '',
    `- Website: ${SITE_URL}`,
    `- Phone and WhatsApp: ${CONTACT.phoneDisplay}`,
    `- Email: ${CONTACT.email}`,
    `- Start with a free discovery call: ${pageUrl('#contact')}`,
    ''
  ].join('\n');

export const SITE_FILES = {
  'robots.txt': { type: 'text/plain; charset=utf-8', render: renderRobotsTxt },
  'llms.txt': { type: 'text/plain; charset=utf-8', render: renderLlmsTxt },
  'sitemap.xml': { type: 'application/xml; charset=utf-8', render: renderSitemapXml }
};
