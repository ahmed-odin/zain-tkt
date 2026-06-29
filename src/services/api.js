import axios from 'axios';
import { mockAdapter } from './mock/mockAdapter';

// Mock mode (dummy data, no backend) is ON by default so the app works
// standalone — e.g. the Vercel deployment, or local dev before a server exists.
// To talk to a real backend instead, set VITE_USE_MOCK=false (and optionally
// VITE_API_URL) in a .env file. See README / SETUP for details.
const USE_MOCK = String(import.meta.env.VITE_USE_MOCK ?? 'true').toLowerCase() !== 'false';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
  ...(USE_MOCK ? { adapter: mockAdapter } : {}),
});

if (USE_MOCK && typeof console !== 'undefined') {
  // eslint-disable-next-line no-console
  console.info('[tktzain] Running in MOCK mode — all data is dummy data stored in your browser. Run window.__resetMockData() to reset.');
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('tktzain_auth');
    }
    return Promise.reject(error);
  }
);

export default api;
