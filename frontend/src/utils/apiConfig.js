import axios from 'axios';

const RAW_ENV_ORIGIN = (import.meta.env.VITE_API_ORIGIN || '').trim().replace(/\/+$/, '');

export const BACKEND_ORIGIN = RAW_ENV_ORIGIN;
export const API_BASE_URL = `${BACKEND_ORIGIN}/api`;
export const PIN_TOKEN_STORAGE_KEY = 'cine_catalog_pin_token_v1';
export const AUTH_REQUIRED_EVENT = 'cine-auth-required';

export function resolveBackendAssetUrl(url) {
  if (!url) return null;
  const trimmed = String(url).trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/uploads') && BACKEND_ORIGIN) {
    return `${BACKEND_ORIGIN}${trimmed}`;
  }
  return trimmed;
}

export function getStoredPinToken() {
  try {
    return localStorage.getItem(PIN_TOKEN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredPinToken(token) {
  try {
    if (token) {
      localStorage.setItem(PIN_TOKEN_STORAGE_KEY, token);
    } else {
      localStorage.removeItem(PIN_TOKEN_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export function clearStoredPinToken() {
  setStoredPinToken('');
}

let interceptorsConfigured = false;
export function setupApiInterceptors() {
  if (interceptorsConfigured) return;
  interceptorsConfigured = true;

  axios.interceptors.request.use((config) => {
    const token = getStoredPinToken();
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers['x-app-token']) {
        config.headers['x-app-token'] = token;
      }
      if (!config.headers.Authorization && !config.headers.authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  });

  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      const status = error?.response?.status;
      const code = error?.response?.data?.code;
      if (status === 401 && code === 'AUTH_REQUIRED') {
        clearStoredPinToken();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent(AUTH_REQUIRED_EVENT));
        }
      }
      return Promise.reject(error);
    }
  );
}

setupApiInterceptors();
