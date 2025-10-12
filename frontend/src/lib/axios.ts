import axios from "axios";
import { getAccessToken, setAccessToken } from "./authTokenStore.js";

// in production, there's no localhost so we have to make this dynamic
const BASE_URL = import.meta.env.MODE !== "production" ? "http://localhost:5000/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = refreshClient
      .post("/auth/refresh")
      .then((response) => response.data?.accessToken ?? null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { response, config } = error ?? {};
    const originalConfig = config as typeof config & { _retry?: boolean };

    if (response?.status === 401 && originalConfig && !originalConfig._retry) {
      originalConfig._retry = true;
      try {
  const newToken = await refreshAccessToken();
        if (newToken) {
          setAccessToken(newToken);
          originalConfig.headers = originalConfig.headers ?? {};
          originalConfig.headers.Authorization = `Bearer ${newToken}`;
          return api(originalConfig);
        }
      } catch (refreshError) {
        setAccessToken(null);
        return Promise.reject(refreshError);
      }
      setAccessToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;