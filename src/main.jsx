import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { initAnalytics } from './utils/analyticsLoader.js'
import { captureAttribution } from './utils/attribution.js'

// Before anything can change the URL: the UTM tags and click IDs are only here on arrival.
captureAttribution()

// No-op unless VITE_GTM_ID or VITE_GA_MEASUREMENT_ID is set at build time.
initAnalytics()

const app = (
  <StrictMode>
    <App />
  </StrictMode>
)
const rootElement = document.getElementById('root')

// A production build ships the page already rendered (scripts/prerender.js), so React
// attaches to that HTML. `vite dev` serves an empty root and renders from scratch.
if (rootElement.hasChildNodes()) {
  hydrateRoot(rootElement, app)
} else {
  createRoot(rootElement).render(app)
}
