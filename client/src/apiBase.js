// Centralized API base URL.
// - In dev, keep this empty to use Vite's proxy for /api.
// - If you need to bypass the proxy (or deploy frontend separately), set VITE_API_BASE_URL.

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export function apiUrl(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${path}`;
}
