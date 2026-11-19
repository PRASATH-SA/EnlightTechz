// Base URL of the Express API (separate Vercel project).
// - Production builds default to https://api.enlighttechz.in, so a missing env var can't break forms.
// - Dev defaults to same origin (the Vite /api proxy → localhost:5000).
// - Set VITE_API_URL to override either.
const DEFAULT_API = import.meta.env.PROD ? 'https://api.enlighttechz.in' : '';
let API_BASE = (import.meta.env.VITE_API_URL || DEFAULT_API).trim().replace(/\/+$/, '');
// An http:// API from an https:// page is blocked by the browser (mixed content), so upgrade it.
if (typeof window !== 'undefined' && window.location.protocol === 'https:') {
  API_BASE = API_BASE.replace(/^http:\/\//i, 'https://');
}

/** Turn an API path like '/api/services' into a full URL on the backend. */
export const apiUrl = (path) => `${API_BASE}${path}`;
