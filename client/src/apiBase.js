console.log("ENV VALUE:", import.meta.env.VITE_API_BASE_URL);

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

export function apiUrl(pathname) {
  const path = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${API_BASE_URL}${path}`;
}
