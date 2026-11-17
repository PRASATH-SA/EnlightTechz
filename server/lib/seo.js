// Builds the <head> SEO / Open Graph / WhatsApp tags for a route from shared/seo.json.
// Used by the Express server and by the Vite plugin (dev server + per-route HTML at build time),
// so link previews work for crawlers that never run JavaScript (WhatsApp, Facebook, LinkedIn, X).
const seo = require('../../shared/seo.json');

const { site, pages } = seo;
const ROUTES = Object.keys(pages);
const MARKER = /<!--seo-->[\s\S]*?<!--\/seo-->/;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const abs = (p) => (/^https?:/.test(p) ? p : `${site.url}${p}`);

function normalise(pathname = '/') {
  const p = pathname.split(/[?#]/)[0].replace(/\/index\.html$/, '/').replace(/\/+$/, '');
  return p || '/';
}

function pageMeta(pathname) {
  const route = normalise(pathname);
  const page = pages[route] || pages['/'];
  const known = Boolean(pages[route]);
  return {
    route,
    known,
    title: page.title ? `${page.title} | ${site.name}` : site.defaultTitle,
    description: page.description,
    keywords: [...new Set([...(page.keywords || []), ...site.baseKeywords])].join(', '),
    url: abs(known ? (route === '/' ? '/' : route) : '/'),
    image: abs(page.image || pages['/'].image),
    imageAlt: page.imageAlt || pages['/'].imageAlt,
    noindex: route.startsWith('/admin')
  };
}

function renderTags(pathname) {
  const m = pageMeta(pathname);
  return [
    `<title>${esc(m.title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    `<meta name="keywords" content="${esc(m.keywords)}">`,
    `<meta name="robots" content="${m.noindex ? 'noindex, nofollow' : 'index, follow, max-image-preview:large'}">`,
    `<link rel="canonical" href="${esc(m.url)}">`,
    // Open Graph: Facebook, LinkedIn, WhatsApp, Telegram, Slack, Discord
    `<meta property="og:site_name" content="${esc(site.name)}">`,
    `<meta property="og:locale" content="${esc(site.locale)}">`,
    `<meta property="og:type" content="website">`,
    `<meta property="og:url" content="${esc(m.url)}">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    // 1200x630 card first. Under 300 KB, so WhatsApp shows it as a large preview.
    `<meta property="og:image" content="${esc(m.image)}">`,
    `<meta property="og:image:secure_url" content="${esc(m.image)}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(m.imageAlt)}">`,
    // Square fallback for apps that show a small square thumbnail (WhatsApp chats list, some messengers).
    `<meta property="og:image" content="${esc(abs(site.waImage))}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:width" content="600">`,
    `<meta property="og:image:height" content="600">`,
    `<meta property="og:image:alt" content="${esc(site.name)} logo">`,
    // X / Twitter
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.description)}">`,
    `<meta name="twitter:image" content="${esc(m.image)}">`,
    `<meta name="twitter:image:alt" content="${esc(m.imageAlt)}">`
  ].join('\n    ');
}

/** Replace the <!--seo-->…<!--/seo--> block in index.html with the tags for this route. */
function injectSeo(html, pathname) {
  return html.replace(MARKER, `<!--seo-->\n    ${renderTags(pathname)}\n    <!--/seo-->`);
}

module.exports = { seo, ROUTES, normalise, pageMeta, renderTags, injectSeo };
