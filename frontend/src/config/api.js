export const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) {
    const envUrl = import.meta.env.VITE_API_URL;
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  if (import.meta.env.VITE_API_BASE_URL) {
    const envUrl = import.meta.env.VITE_API_BASE_URL;
    return envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/$/, '')}/api`;
  }
  // In development mode on localhost, fallback to backend port 5000
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:5000/api';
  }
  // In production (Vercel / deployed host), fallback to relative path /api
  return '/api';
};

export const API_BASE_URL = getApiBaseUrl();
