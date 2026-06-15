"use client";

import { useEffect, useState, useCallback } from "react";
import { api, BACKEND_READY } from "@/lib/api";
import { buildWeeklyPlan } from "@/lib/mock-data";
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
export function useRecommendations(recommendationId = "current"): UseRecommendations {
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      if (BACKEND_READY) {
        const { data } = await api.get(`/recommendations/${recommendationId}`);
        if (active) setPlan(data.plan as DayPlan[]);
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
  }, [recommendationId]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    if (BACKEND_READY) {
      const { data } = await api.post(`/recommendations/${recommendationId}/refresh`);
      setPlan(data.plan as DayPlan[]);
    } else {
      await new Promise((r) => setTimeout(r, 1000));
      // Re-shuffle the mock by rotating day order to feel "fresh".
      setPlan((prev) => {
        if (!prev.length) return buildWeeklyPlan();
        return [...prev.slice(1), prev[0]].map((d, i) => ({
          ...d,
          meals: d.meals,
          day: prev[i].day,
        }));
      });
    }
    setRefreshing(false);
  }, [recommendationId]);

  return { plan, loading, refreshing, refresh };
}
