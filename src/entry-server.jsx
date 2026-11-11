// Build-time only: renders the page to HTML so crawlers and link previews that do not
// run JavaScript still see the content. scripts/prerender.js writes the result into
// dist/index.html, and main.jsx hydrates it in the browser.
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './App.jsx';

export const render = () => renderToString(<App />);
