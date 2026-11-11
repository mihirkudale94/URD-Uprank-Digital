// Builds robots.txt and sitemap.xml from siteContent.js. vite.config.js serves them in
// dev and writes them into dist/ at build, so the site address is never typed into them.
import { SITE_PAGES, SITE_URL } from './siteContent.js';

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

export const SITE_FILES = {
  'robots.txt': { type: 'text/plain; charset=utf-8', render: renderRobotsTxt },
  'sitemap.xml': { type: 'application/xml; charset=utf-8', render: renderSitemapXml }
};
