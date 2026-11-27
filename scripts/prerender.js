// Runs after `vite build` and the SSR build (see the "build" script). Puts the rendered
// page into dist/index.html in place of the empty root, so the HTML that is served
// already contains every heading, paragraph and link. Each service landing page is
// written the same way to dist/services/<id>/index.html, with its own title and meta.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { SERVICE_PAGES, SITE_URL, servicePath } from '../src/data/siteContent.js';
import { buildServicePageJsonLd, renderJsonLdScript } from '../src/data/structuredData.js';

const root = process.cwd();
const htmlPath = path.join(root, 'dist', 'index.html');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');

const { render } = await import(pathToFileURL(serverEntry).href);

const EMPTY_ROOT = '<div id="root"></div>';
const template = fs.readFileSync(htmlPath, 'utf8');
if (!template.includes(EMPTY_ROOT)) {
  throw new Error(`prerender: ${EMPTY_ROOT} not found in dist/index.html`);
}

const escapeAttr = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Swaps one tag's value, and fails the build if the tag is missing, so a page can never
// ship carrying the homepage's title or canonical by accident.
const swap = (html, pattern, value) => {
  if (!pattern.test(html)) throw new Error(`prerender: ${pattern} not found in template`);
  return html.replace(pattern, `$1${escapeAttr(value)}$2`);
};

const writePage = (outPath, appHtml, html) => {
  if (!appHtml.includes('<h1')) {
    throw new Error(`prerender: ${outPath} has no <h1>, refusing to write it`);
  }
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, html.replace(EMPTY_ROOT, `<div id="root">${appHtml}</div>`));
  console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} kB into ${path.relative(root, outPath)}`);
};

for (const [id, page] of Object.entries(SERVICE_PAGES)) {
  const url = new URL(servicePath(id), SITE_URL).href;
  let html = template;
  html = swap(html, /(<title>)[^<]*(<\/title>)/, page.metaTitle);
  html = swap(html, /(<meta name="description" content=")[^"]*(")/, page.metaDescription);
  html = swap(html, /(<link rel="canonical" href=")[^"]*(")/, url);
  for (const prefix of ['og', 'twitter']) {
    html = swap(html, new RegExp(`(<meta property="${prefix}:url" content=")[^"]*(")`), url);
    html = swap(html, new RegExp(`(<meta property="${prefix}:title" content=")[^"]*(")`), page.metaTitle);
    html = swap(html, new RegExp(`(<meta property="${prefix}:description" content=")[^"]*(")`), page.metaDescription);
  }
  html = html.replace('</head>', `${renderJsonLdScript(buildServicePageJsonLd(id))}\n</head>`);
  writePage(path.join(root, 'dist', servicePath(id), 'index.html'), render(id), html);
}

writePage(htmlPath, render(), template);
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
