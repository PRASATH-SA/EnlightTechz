import { useEffect, useState } from 'react';
import { apiUrl } from '../lib/api';
import { applySeo } from '../lib/seo';

const cache = new Map();

/** GET a JSON endpoint once per session, starting from a fallback so the page never renders empty. */
export function useApiData(url, fallback) {
  const [data, setData] = useState(() => cache.get(url) || fallback);
  useEffect(() => {
    if (cache.has(url)) return undefined;
    let alive = true;
    fetch(apiUrl(url))
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((json) => {
        if (!Array.isArray(json) || !json.length) return;
        cache.set(url, json);
        if (alive) setData(json);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [url]);
  return data;
}

/** POST a form body as JSON. Resolves to { ok, message }. */
export async function postJSON(url, body) {
  try {
    const res = await fetch(apiUrl(url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok && data.success !== false, message: data.message, data };
  } catch {
    return { ok: false, message: 'We could not reach the server. Please check your connection, or email info@enlighttechz.in.' };
  }
}

export function usePageTitle(title, description) {
  useEffect(() => {
    applySeo(window.location.pathname, { title, description });
  }, [title, description]);
}
