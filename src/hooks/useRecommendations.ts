"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, BACKEND_READY } from "@/lib/api";
import { buildWeeklyPlan } from "@/lib/mock-data";
import { planFromApi } from "@/lib/transforms";
import type { DayPlan } from "@/types";

interface UseRecommendations {
  plan: DayPlan[];
  loading: boolean;
  refreshing: boolean;
  /** Shaped for POST /recommendations/:id/refresh */
  refresh: () => Promise<void>;
}

/**
 * Returns the weekly recommendation plan. Mock now; the same shape is
 * returned by GET /recommendations once M5 lands.
 */
export function useRecommendations(): UseRecommendations {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const planId = useRef<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      if (BACKEND_READY) {
        // Use the active plan if one exists, otherwise generate the first one.
        try {
          const { data } = await api.get("/recommendations/current");
          planId.current = data.id;
          if (active) setPlan(planFromApi(data));
        } catch {
          const { data } = await api.post("/recommendations/generate", {});
          planId.current = data.id;
          if (active) setPlan(planFromApi(data));
        }
      } else {
        await new Promise((r) => setTimeout(r, 900));
        if (active) setPlan(buildWeeklyPlan());
      }
      if (active) setLoading(false);
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (BACKEND_READY && planId.current) {
      const { data } = await api.post(`/recommendations/${planId.current}/refresh`, {});
      planId.current = data.id;
      setPlan(planFromApi(data));
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      // Re-shuffle the mock by rotating day order to feel "fresh".
      setPlan((prev) => {
        if (!prev.length) return buildWeeklyPlan();
        return prev.map((d, i) => ({ ...d, meals: prev[(i + 1) % prev.length].meals }));
      });
    }
    setRefreshing(false);
  }, []);

  return { plan, loading, refreshing, refresh };
}
