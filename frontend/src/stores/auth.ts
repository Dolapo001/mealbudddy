"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, BACKEND_READY, normalizeUser } from "@/lib/api";
import { setCookie, deleteCookie } from "@/lib/utils";
import type { AuthTokens, User } from "@/types";
import type { RegisterValues, LoginValues } from "@/schemas/auth";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  status: "idle" | "loading" | "authenticated";
  register: (values: RegisterValues) => Promise<void>;
  login: (values: LoginValues) => Promise<void>;
  updateProfile: (
    patch: Partial<Pick<User, "firstName" | "lastName" | "department">>
  ) => Promise<void>;
  logout: () => void;
}

// Until M4 wires the Django endpoints, register/login run in mock mode so the
// full journey (landing → auth → onboarding → dashboard) is clickable today.
// Swapping to the real API is a one-line change guarded by BACKEND_READY.
function mockTokens(): AuthTokens {
  return { access: `mock.${crypto.randomUUID()}`, refresh: `mock.${crypto.randomUUID()}` };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      status: "idle",

      register: async (values) => {
        set({ status: "loading" });
        let tokens: AuthTokens;
        let user: User;
        if (BACKEND_READY) {
          const { data } = await api.post("/auth/register", {
            first_name: values.firstName,
            last_name: values.lastName,
            student_id: values.studentId,
            email: values.email,
            department: values.department,
            password: values.password,
          });
          tokens = data.tokens;
          user = normalizeUser(data.user);
        } else {
          await new Promise((r) => setTimeout(r, 900));
          tokens = mockTokens();
          user = {
            id: crypto.randomUUID(),
            firstName: values.firstName,
            lastName: values.lastName,
            email: values.email,
            studentId: values.studentId,
            department: values.department,
            role: "user",
            isEmailVerified: false,
          };
        }
        setCookie("mb_access", tokens.access);
        set({ user, tokens, status: "authenticated" });
      },

      login: async (values) => {
        set({ status: "loading" });
        let tokens: AuthTokens;
        let user: User;
        if (BACKEND_READY) {
          const { data } = await api.post("/auth/login", values);
          tokens = data.tokens;
          user = normalizeUser(data.user);
        } else {
          await new Promise((r) => setTimeout(r, 800));
          tokens = mockTokens();
          user = {
            id: crypto.randomUUID(),
            firstName: "David",
            lastName: "Adebiyi",
            email: values.identifier.includes("@") ? values.identifier : "david@university.edu.ng",
            studentId: "BU/22/CSC/0000",
            department: "Computer Science",
            role: "user",
            isEmailVerified: true,
          };
        }
        setCookie("mb_access", tokens.access);
        set({ user, tokens, status: "authenticated" });
      },

      updateProfile: async (patch) => {
        if (BACKEND_READY) {
          await api.patch("/accounts/me/profile", {
            first_name: patch.firstName,
            last_name: patch.lastName,
            department: patch.department,
          });
        } else {
          await new Promise((r) => setTimeout(r, 500));
        }
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user }));
      },

      logout: () => {
        deleteCookie("mb_access");
        set({ user: null, tokens: null, status: "idle" });
      },
    }),
    { name: "mb-auth" }
  )
);
