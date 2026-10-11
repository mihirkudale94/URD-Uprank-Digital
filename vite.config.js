import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Mirrors the /privacy-policy rewrite in vercel.json, so the footer link behaves
// the same locally as it does in production instead of 404ing in dev.
const privacyPolicyRewrite = () => ({
  name: 'privacy-policy-rewrite',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url === '/privacy-policy' || req.url === '/privacy-policy/') {
        req.url = '/privacy.html';
      }
      next();
    });
  }
});

// https://vite.dev/config/
export default defineConfig({
  // Absolute, because the site is served from the domain root on Vercel and
  // /privacy-policy is served at a nested path. A relative base would resolve
  // assets against that path instead of the root.
  base: '/',
  plugins: [react(), privacyPolicyRewrite()],
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
  },
})
