// Base URL of the Express API (separate Vercel project), e.g. https://enlighttechz-api.vercel.app
// Leave VITE_API_URL empty to call the same origin (local dev uses the Vite /api proxy).
const API_BASE = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

/** Turn an API path like '/api/services' into a full URL on the backend. */
export const apiUrl = (path) => `${API_BASE}${path}`;
