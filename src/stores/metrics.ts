"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, BACKEND_READY } from "@/lib/api";
import { toMetric } from "@/lib/calc";
import type { MetricsValues } from "@/schemas/metrics";
import type { MetricsResult } from "@/types";

/** Map the frontend form (with unit toggle) to the backend's metric payload. */
function toApiPayload(values: MetricsValues) {
  const { wKg, hCm } = toMetric(values.weight, values.height, values.unit);
  return {
    age: values.age,
    sex: values.sex,
    weight_kg: Number(wKg.toFixed(1)),
    height_cm: Number(hCm.toFixed(1)),
    activity: values.activity,
    goal: values.goal,
  };
}

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
          await api.post("/metrics", toApiPayload(values));
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
          // A new goal recomputes everything server-side: re-POST the snapshot.
          await api.post("/metrics", toApiPayload(next));
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
