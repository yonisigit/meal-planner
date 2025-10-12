import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";
import { clearTokens, getAccessToken, getRefreshToken, updateTokens } from "./authTokenStore.js";

// in production, there's no localhost so we have to make this dynamic
const BASE_URL = import.meta.env.MODE !== "production" ? "http://localhost:5000/api" : "/api";

type AuthenticatedRequestConfig = InternalAxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  _retry?: boolean;
};

const api = axios.create({
  baseURL: BASE_URL,
});

const AUTH_ENDPOINTS = ["/auth/login", "/auth/signup", "/auth/refresh", "/auth/revoke"];

function shouldBypassRefresh(url?: string) {
  return !url || AUTH_ENDPOINTS.some((endpoint) => url.includes(endpoint));
}

api.interceptors.request.use((config: AuthenticatedRequestConfig) => {
  if (!config.skipAuthRefresh) {
    const token = getAccessToken();
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await api.post<{ accessToken: string; refreshToken?: string }>(
      "/auth/refresh",
      undefined,
      {
        headers: { Authorization: `Bearer ${refreshToken}` },
        skipAuthRefresh: true,
      } as AuthenticatedRequestConfig,
    );
    const { accessToken, refreshToken: rotatedRefreshToken } = response.data;
    updateTokens({ accessToken, refreshToken: rotatedRefreshToken ?? refreshToken });
    return accessToken;
  } catch (error) {
    clearTokens();
    return null;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const response = error.response;
    const originalRequest = error.config as AuthenticatedRequestConfig | undefined;

    if (!response || !originalRequest) {
      return Promise.reject(error);
    }

    if (
      response.status === 401 &&
      !originalRequest.skipAuthRefresh &&
      !originalRequest._retry &&
      !shouldBypassRefresh(originalRequest.url)
    ) {
      originalRequest._retry = true;

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      if (!newAccessToken) {
        return Promise.reject(error);
      }

      originalRequest.headers = originalRequest.headers ?? {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return api(originalRequest);
    }

    return Promise.reject(error);
  },
);

export default api;