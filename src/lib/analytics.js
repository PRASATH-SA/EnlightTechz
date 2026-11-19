/**
 * Google Analytics 4 + behavioural + form tracking.
 *
 * - Set VITE_GA_MEASUREMENT_ID (e.g. G-XXXXXXXXXX) to turn it on. Without it every call is a no-op.
 * - Page views are sent manually on every route change (SPA), so in GA4 turn OFF
 *   Admin → Data streams → Enhanced measurement → "Page changes based on browser history events",
 *   otherwise each navigation is counted twice.
 * - Nothing is tracked on /admin.
 * - No personal data is ever sent: forms report field NAMES only, never what visitors typed.
 */

const GA_ID = (import.meta.env.VITE_GA_MEASUREMENT_ID || '').trim();
const DEBUG = import.meta.env.DEV || import.meta.env.VITE_GA_DEBUG === 'true';

let initialised = false;
const isBrowser = typeof window !== 'undefined';
const isAdminPath = () => isBrowser && window.location.pathname.startsWith('/admin');

export const analyticsEnabled = () => Boolean(GA_ID) && isBrowser;

/** Send a GA4 event. Safe to call anywhere; ignored when GA is off or on admin pages. */
export function track(name, params = {}) {
  if (!analyticsEnabled() || isAdminPath()) return;
  if (!initialised) initAnalytics();
  const clean = {};
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === '') continue;
    clean[k] = typeof v === 'string' ? v.slice(0, 100) : v; // GA4 truncates params at 100 chars
  }
  window.gtag('event', name, clean);
  if (DEBUG) console.debug('[analytics]', name, clean);
}

/** Load gtag.js once and wire up the global behavioural + form listeners. */
export function initAnalytics() {
  if (initialised || !analyticsEnabled()) return;
  initialised = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function gtag() { window.dataLayer.push(arguments); }; // eslint-disable-line prefer-rest-params
  window.gtag('js', new Date());
  // Note: GA treats any debug_mode value (even false) as "on", so only pass it when wanted.
  window.gtag('config', GA_ID, { send_page_view: false, ...(DEBUG ? { debug_mode: true } : {}) });

  const s = document.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`;
  document.head.appendChild(s);

  bindClicks();
  bindScroll();
  bindForms();
  bindSections();
  bindLifecycle();
}

/* ------------------------------------------------------------------ */
/* Page views + per-page engagement                                    */
/* ------------------------------------------------------------------ */

let page = null; // state for the current page view
let pageViews = 0;

function newPageState(path) {
  return { path, start: Date.now(), visibleMs: 0, visibleSince: document.visibilityState === 'visible' ? Date.now() : null, depths: new Set(), sections: new Set(), ended: false };
}

/** Close the current page view: report engaged time and any abandoned forms. */
function endPage() {
  if (!page || page.ended) return;
  page.ended = true;
  if (page.visibleSince) page.visibleMs += Date.now() - page.visibleSince;
  const seconds = Math.round(page.visibleMs / 1000);
  flushAbandonedForms();
  if (seconds > 0) {
    track('page_engagement', {
      page_path: page.path,
      engaged_seconds: seconds,
      max_scroll_percent: Math.max(0, ...page.depths),
      sections_viewed: page.sections.size
    });
  }
}

/** Call on every route change (after the page has set its title). */
export function trackPageView(path) {
  if (!analyticsEnabled()) return;
  endPage();
  if (path.startsWith('/admin')) { page = null; return; }
  if (!initialised) initAnalytics();
  const first = !page && !pageViews;
  pageViews += 1;
  page = newPageState(path);
  track('page_view', {
    page_path: path + window.location.search,
    page_location: window.location.href,
    page_title: document.title,
    page_referrer: first ? document.referrer || undefined : undefined
  });
  // Reset scroll depth for the new page once the scroll-to-top has happened.
  requestAnimationFrame(checkScroll);
  scheduleSectionScan();
}

function bindLifecycle() {
  document.addEventListener('visibilitychange', () => {
    if (!page || page.ended) return;
    if (document.visibilityState === 'hidden') {
      if (page.visibleSince) { page.visibleMs += Date.now() - page.visibleSince; page.visibleSince = null; }
      flushAbandonedForms();
    } else if (!page.visibleSince) {
      page.visibleSince = Date.now();
    }
  });
  window.addEventListener('pagehide', endPage);
}

/* ------------------------------------------------------------------ */
/* Clicks: CTAs, outbound, email / phone / WhatsApp, downloads, rage   */
/* ------------------------------------------------------------------ */

const DOWNLOAD_RE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar|csv|txt|mp4|mov)$/i;

function regionOf(el) {
  if (el.closest('header')) return 'header';
  if (el.closest('footer')) return 'footer';
  if (el.closest('.chat-panel, .chat-launch')) return 'chatbot';
  const section = el.closest('section[id], [data-track-section]');
  return section ? (section.getAttribute('data-track-section') || section.id) : 'main';
}

function labelOf(el) {
  return (el.getAttribute('data-track-label') || el.getAttribute('aria-label') || el.textContent || '')
    .replace(/\s+/g, ' ').trim().slice(0, 80);
}

function bindClicks() {
  let recent = [];

  document.addEventListener('click', (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    // Rage clicks: 3+ clicks in ~0.7s within 30px — a sign something looks clickable but isn't working.
    const now = Date.now();
    recent = recent.filter((c) => now - c.t < 700 && Math.abs(c.x - e.clientX) < 30 && Math.abs(c.y - e.clientY) < 30);
    recent.push({ t: now, x: e.clientX, y: e.clientY });
    if (recent.length === 3) {
      track('rage_click', { element: describe(target), region: regionOf(target), page_path: location.pathname });
    }

    const el = target.closest('a, button, [data-track]');
    if (!el || el.closest('form') && el.type === 'submit') return; // submits are handled by form tracking

    const custom = el.getAttribute('data-track');
    const href = el.tagName === 'A' ? el.getAttribute('href') || '' : '';
    const base = { link_text: labelOf(el), region: regionOf(el), page_path: location.pathname };

    if (custom) return track(custom, { ...base, link_url: href || undefined });
    if (href.startsWith('mailto:')) return track('email_click', base);
    if (href.startsWith('tel:')) return track('phone_click', base);
    if (/wa\.me|whatsapp\.com/i.test(href)) return track('whatsapp_click', base);

    if (href && /^https?:/i.test(href)) {
      let url;
      try { url = new URL(href, location.href); } catch { url = null; }
      if (url && url.host !== location.host) {
        return track('outbound_click', { ...base, link_url: url.href, link_domain: url.hostname });
      }
    }
    if (href && DOWNLOAD_RE.test(href.split('?')[0])) {
      return track('file_download', { ...base, link_url: href, file_extension: href.split('?')[0].split('.').pop() });
    }

    if (el.classList.contains('et-btn') || el.closest('nav')) {
      return track(el.closest('nav') && !el.classList.contains('et-btn') ? 'nav_click' : 'cta_click', { ...base, link_url: href || undefined });
    }
  }, { capture: true });
}

function describe(el) {
  const id = el.id ? `#${el.id}` : '';
  const cls = typeof el.className === 'string' && el.className.trim() ? `.${el.className.trim().split(/\s+/).slice(0, 2).join('.')}` : '';
  return `${el.tagName.toLowerCase()}${id}${cls}`.slice(0, 100);
}

/* ------------------------------------------------------------------ */
/* Scroll depth                                                        */
/* ------------------------------------------------------------------ */

const DEPTHS = [25, 50, 75, 90, 100];

function checkScroll() {
  if (!page || page.ended) return;
  const doc = document.documentElement;
  const scrollable = doc.scrollHeight - window.innerHeight;
  if (scrollable <= 0) return;
  const pct = Math.min(100, Math.round((window.scrollY / scrollable) * 100));
  for (const d of DEPTHS) {
    if (pct >= d && !page.depths.has(d)) {
      page.depths.add(d);
      track('scroll_depth', { percent_scrolled: d, page_path: page.path });
    }
  }
}

function bindScroll() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    setTimeout(() => { ticking = false; checkScroll(); }, 250);
  }, { passive: true });
}

/* ------------------------------------------------------------------ */
/* Section views (which parts of a page people actually see)           */
/* ------------------------------------------------------------------ */

let sectionObserver = null;
let scanTimer = null;

function bindSections() {
  if (!('IntersectionObserver' in window)) return;
  sectionObserver = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !page || page.ended) continue;
      const name = entry.target.getAttribute('data-track-section') || entry.target.id;
      if (page.sections.has(name)) continue;
      page.sections.add(name);
      track('section_view', { section_name: name, page_path: page.path });
    }
  }, { threshold: 0.4 });

  // Pages render content after data loads, so rescan when the DOM changes.
  new MutationObserver(scheduleSectionScan).observe(document.body, { childList: true, subtree: true });
}

function scheduleSectionScan() {
  if (!sectionObserver) return;
  clearTimeout(scanTimer);
  scanTimer = setTimeout(() => {
    sectionObserver.disconnect();
    document.querySelectorAll('main section[id], [data-track-section]').forEach((el) => sectionObserver.observe(el));
  }, 300);
}

/* ------------------------------------------------------------------ */
/* Forms: start, field interaction, validation errors, submit,         */
/* success / failure, abandonment                                      */
/* ------------------------------------------------------------------ */

// Keyed by form element. Tracks only which fields were touched — never their values.
const forms = new Map();

function formName(form) {
  return form.getAttribute('data-track-form') || form.id || form.getAttribute('name') || describe(form);
}

function fieldName(el) {
  return el.name || el.id || el.type || 'field';
}

function formState(form) {
  let st = forms.get(form);
  if (!st) {
    st = { name: formName(form), started: 0, touched: new Set(), lastField: '', submitted: false, done: false, path: location.pathname };
    forms.set(form, st);
  }
  return st;
}

function trackable(form) {
  return form && !form.closest('[data-track-ignore]') && !location.pathname.startsWith('/admin');
}

function bindForms() {
  document.addEventListener('focusin', (e) => {
    const el = e.target;
    const form = el?.form || el?.closest?.('form');
    if (!trackable(form) || !el.matches('input, select, textarea')) return;
    const st = formState(form);
    if (!st.started) {
      st.started = Date.now();
      st.done = false;
      track('form_start', { form_name: st.name, first_field: fieldName(el), page_path: location.pathname });
    }
    st.lastField = fieldName(el);
  });

  // A field counts as "completed" when the visitor leaves it with something filled in.
  document.addEventListener('change', (e) => {
    const el = e.target;
    const form = el?.form;
    if (!trackable(form) || !el.matches('input, select, textarea')) return;
    const st = formState(form);
    const name = fieldName(el);
    if (el.value && !st.touched.has(name)) {
      st.touched.add(name);
      track('form_field_complete', { form_name: st.name, field_name: name, field_index: st.touched.size });
    }
  });

  // Native validation failures ("invalid" doesn't bubble, so capture it).
  document.addEventListener('invalid', (e) => {
    const el = e.target;
    const form = el?.form;
    if (!trackable(form)) return;
    const st = formState(form);
    const v = el.validity || {};
    const reason = v.valueMissing ? 'required' : v.typeMismatch ? 'format' : v.tooLong ? 'too_long' : v.patternMismatch ? 'pattern' : 'invalid';
    track('form_validation_error', { form_name: st.name, field_name: fieldName(el), error_type: reason });
  }, true);

  document.addEventListener('submit', (e) => {
    const form = e.target;
    if (!trackable(form)) return;
    const st = formState(form);
    st.submitted = true;
    track('form_submit', {
      form_name: st.name,
      fields_completed: st.touched.size,
      time_to_submit_seconds: st.started ? Math.round((Date.now() - st.started) / 1000) : undefined,
      page_path: location.pathname
    });
  }, true);
}

/**
 * Report the server's answer to a form submit. Call from the submit handler.
 * @param {string} name   same value as the form's data-track-form attribute
 * @param {boolean} ok
 * @param {object} extra  non-personal details only (e.g. selected service)
 */
export function trackFormResult(name, ok, extra = {}) {
  for (const [form, st] of forms) {
    if (st.name === name) {
      if (ok) { st.done = true; forms.delete(form); } else { st.submitted = false; }
    }
  }
  track(ok ? 'form_success' : 'form_error', { form_name: name, page_path: location.pathname, ...extra });
}

/** Forms someone started but didn't successfully submit before leaving the page or tab. */
function flushAbandonedForms() {
  for (const [form, st] of forms) {
    if (!st.started || st.done || st.submitted) continue;
    track('form_abandon', {
      form_name: st.name,
      last_field: st.lastField,
      fields_completed: st.touched.size,
      seconds_in_form: Math.round((Date.now() - st.started) / 1000),
      page_path: st.path
    });
    st.done = true; // report once
    if (!document.contains(form)) forms.delete(form);
  }
}
