import axios from 'axios';
import Cookies from 'js-cookie';

const ACCESS_TOKEN_KEY  = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';

// ─── Cookie helpers ──────────────────────────────────────────────────────────
const cookieOptions = {
  path: '/',
  sameSite: 'lax',
  secure: window.location.protocol === 'https:',
};

export const setTokens = ({ accessToken, refreshToken }) => {
  // Access token: 15 min (matches backend JWT)
  if (accessToken)
    Cookies.set(ACCESS_TOKEN_KEY, accessToken, { ...cookieOptions, expires: 1 / 96 });
  // Refresh token: 7 days (matches backend JWT)
  if (refreshToken)
    Cookies.set(REFRESH_TOKEN_KEY, refreshToken, { ...cookieOptions, expires: 7 });
};

export const clearTokens = () => {
  Cookies.remove(ACCESS_TOKEN_KEY,  { path: '/' });
  Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });
};

export const getAccessToken  = () => Cookies.get(ACCESS_TOKEN_KEY);
export const getRefreshToken = () => Cookies.get(REFRESH_TOKEN_KEY);

// isAuthenticated: true when either token is present (refresh token keeps session alive)
export const isAuthenticated = () =>
  Boolean(getAccessToken() || getRefreshToken());

// ─── Response normalizer ─────────────────────────────────────────────────────
const normalizeResponse = (response) => {
  const payload = response?.data;
  if (!payload || typeof payload !== 'object') return response;

  const hasEnvelope =
    Object.prototype.hasOwnProperty.call(payload, 'success') ||
    Object.prototype.hasOwnProperty.call(payload, 'message');
  if (!hasEnvelope) return response;

  const data = Object.prototype.hasOwnProperty.call(payload, 'data')
    ? payload.data
    : payload;

  if (Array.isArray(data)) {
    data.success = payload.success;
    data.message = payload.message;
    return { ...response, data };
  }

  if (data && typeof data === 'object') {
    return { ...response, data: { ...data, success: payload.success, message: payload.message } };
  }

  return { ...response, data: { data, success: payload.success, message: payload.message } };
};

export const isCachedResponse = (response) =>
  response?.status === 304 || response?.data?.isCached === true;

// ─── Axios instances ─────────────────────────────────────────────────────────
const BASE = import.meta.env.VITE_API_BASE_URL || '/api';

// Used only for the refresh call — no interceptors to avoid loops
const refreshClient = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
});

export const apiClient = axios.create({
  baseURL: BASE,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  validateStatus: (s) => (s >= 200 && s < 300) || s === 304,
});

// ─── Token refresh queue ─────────────────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = [];

const onTokenRefreshed = (token) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// ─── Core refresh function (reusable) ────────────────────────────────────────
export const doTokenRefresh = async () => {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token');

  const response = await refreshClient.post('/auth/refresh-token', { refreshToken });
  const resData = response.data;

  const newAccessToken =
    resData?.data?.accessToken ||
    resData?.accessToken;

  if (!newAccessToken) throw new Error('Refresh response missing access token');

  // Persist new access token; keep existing refresh token
  setTokens({ accessToken: newAccessToken, refreshToken: getRefreshToken() });

  return newAccessToken;
};

// ─── Proactive silent refresh on app startup ─────────────────────────────────
// Call this once in main.jsx or App root so the user is never logged out on reload
export const silentRefreshOnStartup = async () => {
  if (getAccessToken()) return; // access token still valid — nothing to do
  if (!getRefreshToken()) return; // no session at all

  try {
    await doTokenRefresh();
    console.log('🔄 Silent token refresh on startup succeeded');
  } catch (err) {
    console.warn('Silent refresh failed — clearing session', err.message);
    clearTokens();
  }
};

// ─── Request interceptor — attach access token ────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — auto-refresh on 401 ──────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    if (response.status === 304) {
      return { ...response, data: { ...response.data, isCached: true } };
    }
    return normalizeResponse(response);
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle 304 in error path
    if (error.response?.status === 304) {
      return { ...error.response, data: { ...error.response.data, isCached: true } };
    }

    // Auto-refresh on 401
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          refreshQueue.push((newToken) => {
            if (newToken) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
              resolve(axios(originalRequest).then(normalizeResponse));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const newAccessToken = await doTokenRefresh();

        onTokenRefreshed(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        const retryResponse = await axios(originalRequest);
        return normalizeResponse(retryResponse);

      } catch (refreshError) {
        onTokenRefreshed(null); // reject queued requests
        clearTokens();
        if (!window.location.pathname.includes('/auth/login')) {
          window.location.assign('/auth/login');
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// ─── Legacy fetch wrapper ─────────────────────────────────────────────────────
export const secureFetch = async (endpoint, options = {}) => {
  const token = getAccessToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const response = await fetch(`${BASE}${endpoint}`, {
      ...options,
      credentials: 'include',
      headers,
    });

    if (response.status === 401) {
      clearTokens();
      window.location.assign('/auth/login');
      return null;
    }

    return response;
  } catch (err) {
    throw err;
  }
};
