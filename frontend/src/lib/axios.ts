import axios from "axios";
import { getAccessToken } from "./authTokenStore.js";

// in production, there's no localhost so we have to make this dynamic
const BASE_URL = import.meta.env.MODE !== "production" ? "http://localhost:5000/api" : "/api";

const api = axios.create({
  baseURL: BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;