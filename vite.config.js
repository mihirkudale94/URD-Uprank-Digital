import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { renderJsonLdScript } from './src/data/structuredData.js'
import { SITE_FILES } from './src/data/siteFiles.js'
import { BUSINESS, CONTACT, FOUNDER, FULL_ADDRESS, SITE_URL } from './src/data/siteContent.js'

// Fills the static HTML pages (index.html, privacy.html) from src/data/siteContent.js, the
// same file the React components read, so the structured data and the privacy page's
// contact block can never disagree with what the site shows.
const escapeHtml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const siteTokens = {
  __SITE_URL__: SITE_URL,
  __SITE_DOMAIN__: new URL(SITE_URL).hostname,
  __SITE_LEGAL_NAME__: BUSINESS.legalName,
  __SITE_FOUNDING_YEAR__: BUSINESS.foundingYear,
  __SITE_FOUNDER__: FOUNDER.name,
  __SITE_FOUNDER_ROLE__: FOUNDER.jobTitle,
  __SITE_ADDRESS__: FULL_ADDRESS,
  __SITE_EMAIL__: CONTACT.email,
  __SITE_PHONE_E164__: CONTACT.phoneE164,
  __SITE_PHONE_DISPLAY__: CONTACT.phoneDisplay,
}

const siteContentPlugin = () => ({
  name: 'urd-site-content',
  // robots.txt and sitemap.xml: served from memory in dev, written into dist/ at build.
  configureServer(server) {
    server.middlewares.use((req, res, next) => {
      const file = SITE_FILES[req.url?.split('?')[0].replace(/^\//, '')]
      if (!file) return next()
      res.setHeader('Content-Type', file.type)
      res.end(file.render())
    })
  },
  generateBundle(options) {
    if (options.dir && path.basename(options.dir) === 'dist-ssr') return
    for (const [fileName, file] of Object.entries(SITE_FILES)) {
      this.emitFile({ type: 'asset', fileName, source: file.render() })
    }
  },
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      let out = html.replace('<!--site:json-ld-->', renderJsonLdScript())
      for (const [token, value] of Object.entries(siteTokens)) {
        out = out.split(token).join(escapeHtml(value))
      }
      const leftover = out.match(/__SITE_[A-Z0-9_]+__|<!--site:[a-z-]+-->/)
      if (leftover) throw new Error(`siteContent: unknown placeholder ${leftover[0]}`)
      return out
    },
  },
})

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [react(), siteContentPlugin()],
  server: {
    // Honour a PORT assigned by the environment so preview tooling can find the server
    port: Number(process.env.PORT) || 5173,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    // Two pages: the site itself and the static privacy policy.
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html'),
        privacy: path.resolve(__dirname, 'privacy.html'),
      },
    },
  },
})
