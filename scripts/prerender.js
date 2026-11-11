// Runs after `vite build` and the SSR build (see the "build" script). Puts the rendered
// page into dist/index.html in place of the empty root, so the HTML that is served
// already contains every heading, paragraph and link.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const htmlPath = path.join(root, 'dist', 'index.html');
const serverEntry = path.join(root, 'dist-ssr', 'entry-server.js');

const { render } = await import(pathToFileURL(serverEntry).href);
const appHtml = render();

const EMPTY_ROOT = '<div id="root"></div>';
const html = fs.readFileSync(htmlPath, 'utf8');
if (!html.includes(EMPTY_ROOT)) {
  throw new Error(`prerender: ${EMPTY_ROOT} not found in dist/index.html`);
}
if (!appHtml.includes('<h1')) {
  throw new Error('prerender: rendered page has no <h1>, refusing to write it');
}

fs.writeFileSync(htmlPath, html.replace(EMPTY_ROOT, `<div id="root">${appHtml}</div>`));
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true });
console.log(`prerender: wrote ${(appHtml.length / 1024).toFixed(1)} kB of HTML into dist/index.html`);
