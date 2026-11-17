import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const require = createRequire(import.meta.url);
const { injectSeo, ROUTES } = require('./server/lib/seo.js');

/**
 * Per-route SEO / Open Graph tags (shared/seo.json).
 * - Dev: index.html gets the tags for the requested URL.
 * - Build: writes dist/<route>/index.html for every page, so static hosts also serve the right
 *   link preview to WhatsApp, Facebook and other crawlers that don't run JavaScript.
 */
function seoPages() {
  let outDir;
  return {
    name: 'enlight-seo',
    configResolved(config) { outDir = path.resolve(config.root, config.build.outDir); },
    transformIndexHtml: {
      order: 'post',
      handler: (html, ctx) => (ctx.server ? injectSeo(html, ctx.originalUrl || '/') : html)
    },
    closeBundle() {
      const indexFile = path.join(outDir, 'index.html');
      if (!fs.existsSync(indexFile)) return;
      const base = fs.readFileSync(indexFile, 'utf8');
      for (const route of ROUTES) {
        if (route === '/') continue;
        const dir = path.join(outDir, route.slice(1));
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'index.html'), injectSeo(base, route));
      }
    }
  };
}

export default defineConfig({
  plugins: [react(), seoPages()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    },
    allowedHosts: [
      'commander-reported-seem-nutrition.trycloudflare.com'
    ]
  }
});
