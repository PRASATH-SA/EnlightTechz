import seo from '../../shared/seo.json';

// Keeps the <head> tags in step with in-app navigation. The server (and the build) already sends the
// right tags on first load; this matters for search engines that render JavaScript and for browser shares.
const { site, pages } = seo;
const abs = (p) => (/^https?:/.test(p) ? p : `${site.url}${p}`);

function setAttr(selector, attr, value) {
  const el = document.head.querySelector(selector);
  if (el && value != null) el.setAttribute(attr, value);
}

export function applySeo(pathname, { title, description } = {}) {
  const route = pathname.replace(/\/+$/, '') || '/';
  const page = pages[route];
  const fullTitle = title ? `${title} | ${site.name}` : (page?.title ? `${page.title} | ${site.name}` : site.defaultTitle);
  const desc = description || page?.description || pages['/'].description;
  const url = abs(page ? route : '/');
  const image = abs(page?.image || pages['/'].image);
  const alt = page?.imageAlt || pages['/'].imageAlt;
  const keywords = [...new Set([...(page?.keywords || pages['/'].keywords), ...site.baseKeywords])].join(', ');

  document.title = fullTitle;
  setAttr('meta[name="description"]', 'content', desc);
  setAttr('meta[name="keywords"]', 'content', keywords);
  setAttr('meta[name="robots"]', 'content', route.startsWith('/admin') ? 'noindex, nofollow' : 'index, follow, max-image-preview:large');
  setAttr('link[rel="canonical"]', 'href', url);
  setAttr('meta[property="og:url"]', 'content', url);
  setAttr('meta[property="og:title"]', 'content', fullTitle);
  setAttr('meta[property="og:description"]', 'content', desc);
  setAttr('meta[property="og:image"]', 'content', image); // first og:image = the 1200x630 card
  setAttr('meta[property="og:image:secure_url"]', 'content', image);
  setAttr('meta[property="og:image:alt"]', 'content', alt);
  setAttr('meta[name="twitter:title"]', 'content', fullTitle);
  setAttr('meta[name="twitter:description"]', 'content', desc);
  setAttr('meta[name="twitter:image"]', 'content', image);
  setAttr('meta[name="twitter:image:alt"]', 'content', alt);
}
