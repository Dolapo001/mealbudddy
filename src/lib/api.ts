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

/**
 * Flag: when true, the stores call the real Django API instead of mock mode.
 * Driven by env so the frontend runs standalone (mock) by default, and against
 * the backend simply by setting NEXT_PUBLIC_BACKEND_READY=true.
 */
export const BACKEND_READY = process.env.NEXT_PUBLIC_BACKEND_READY === "true";

/** Shape the DRF user payload (snake_case) into the frontend `User` (camelCase). */
export function normalizeUser(data: Record<string, unknown>) {
  return {
    id: String(data.id),
    firstName: (data.first_name as string) ?? "",
    lastName: (data.last_name as string) ?? "",
    email: (data.email as string) ?? "",
    studentId: (data.student_id as string) ?? "",
    department: (data.department as string) ?? "",
    role: (data.role as "user" | "admin" | "super_admin") ?? "user",
    isEmailVerified: Boolean(data.is_email_verified),
  };
}
