import axios from "axios";

// Central Axios instance. Points at the Django REST API once M4 lands.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach the access token (read lazily to avoid SSR window access).
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("mb-auth");
      const token = raw ? JSON.parse(raw)?.state?.tokens?.access : null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      /* no-op */
    }
  }
  return config;
});

// Refresh-on-401 is wired in M4 once the refresh endpoint exists.
api.interceptors.response.use(
  (res) => res,
  (error) => Promise.reject(error)
);

/** Flag: real backend calls switch on once NEXT_PUBLIC_API_URL is live (M4). */
export const BACKEND_READY = false;
