"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, BACKEND_READY } from "@/lib/api";
import type { MetricsValues } from "@/schemas/metrics";
import type { MetricsResult } from "@/types";

interface MetricsState {
  metrics: MetricsValues | null;
  result: MetricsResult | null;
  status: "idle" | "saving" | "saved";
  /** Persist onboarding body metrics. Shaped for POST /metrics. */
  saveMetrics: (values: MetricsValues, result: MetricsResult) => Promise<void>;
  /** Update only the goal (Change goal page). Shaped for PATCH /metrics. */
  updateGoal: (goal: MetricsValues["goal"], result: MetricsResult) => Promise<void>;
  /** Update dietary / unit preferences (Settings). */
  updatePreferences: (patch: Partial<Pick<MetricsValues, "unit" | "dietary">>) => void;
  reset: () => void;
}

export const useMetricsStore = create<MetricsState>()(
  persist(
    (set, get) => ({
      metrics: null,
      result: null,
      status: "idle",

      saveMetrics: async (values, result) => {
        set({ status: "saving" });
        if (BACKEND_READY) {
          await api.post("/metrics", values);
        } else {
          await new Promise((r) => setTimeout(r, 700));
        }
        set({ metrics: values, result, status: "saved" });
      },

      updateGoal: async (goal, result) => {
        const current = get().metrics;
        if (!current) return;
        const next = { ...current, goal };
        set({ status: "saving" });
        if (BACKEND_READY) {
          await api.patch("/metrics", { goal });
        } else {
          await new Promise((r) => setTimeout(r, 500));
        }
        set({ metrics: next, result, status: "saved" });
      },

      updatePreferences: (patch) => {
        const current = get().metrics;
        if (!current) return;
        set({ metrics: { ...current, ...patch } });
      },

      reset: () => set({ metrics: null, result: null, status: "idle" }),
    }),
    { name: "mb-metrics" }
  )
);
