"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, BACKEND_READY } from "@/lib/api";
import { toMetric } from "@/lib/calc";
import { ACTIVITY_OPTIONS } from "@/lib/constants";
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
  /** Pull the user's current metrics from the backend (returning user). */
  hydrate: () => Promise<void>;
  reset: () => void;
}

/** Reverse-map a stored activity multiplier back to its key. */
function activityKeyFromMultiplier(m: number): MetricsValues["activity"] {
  const match = ACTIVITY_OPTIONS.find((o) => Math.abs(o.multiplier - m) < 0.001);
  return match?.key ?? "moderate";
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

      hydrate: async () => {
        if (!BACKEND_READY || get().result) return;
        try {
          const { data } = await api.get("/metrics/current");
          const result: MetricsResult = {
            bmiValue: data.bmi,
            bmiLabel: data.bmi_category,
            bmrValue: data.bmr,
            tdeeValue: data.tdee,
            targetKcal: data.target_kcal,
            protein: data.protein_target_g,
            carbs: data.carb_target_g,
          };
          const metrics: MetricsValues = {
            unit: "metric",
            age: data.age,
            sex: data.sex,
            weight: data.weight_kg,
            height: data.height_cm,
            activity: activityKeyFromMultiplier(data.activity_multiplier),
            goal: data.goal,
            dietary: [],
          };
          set({ metrics, result, status: "saved" });
        } catch {
          /* no metrics on file yet — onboarding will create them */
        }
      },

      reset: () => set({ metrics: null, result: null, status: "idle" }),
    }),
    { name: "mb-metrics" }
  )
);
