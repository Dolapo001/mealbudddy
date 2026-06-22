"use client";

import { useMemo } from "react";
import {
  toMetric,
  bmi,
  bmiCategory,
  bmr,
  tdee,
  macroTargets,
} from "@/lib/calc";
import { ACTIVITY_MULTIPLIERS, GOAL_OFFSETS } from "@/lib/constants";
import type { MetricsValues } from "@/schemas/metrics";
import type { MetricsResult } from "@/types";

/**
 * Pure derivation of all live metrics from raw form values.
 * Returns null when inputs aren't usable yet so the panel can show a hint.
 */
export function computeMetrics(values: Partial<MetricsValues>): MetricsResult | null {
  const { unit, age, sex, weight, height, activity, goal } = values;
  if (
    !unit ||
    !sex ||
    !activity ||
    !goal ||
    !age ||
    !weight ||
    !height ||
    age <= 0 ||
    weight <= 0 ||
    height <= 0
  ) {
    return null;
  }

  const { wKg, hCm } = toMetric(weight, height, unit);
  const bmiValue = bmi(wKg, hCm);
  const bmrValue = Math.round(bmr(wKg, hCm, age, sex));
  const tdeeValue = tdee(bmrValue, ACTIVITY_MULTIPLIERS[activity]);
  const offset = GOAL_OFFSETS[goal];
  const targetKcal = Math.max(1200, tdeeValue + offset);
  const { protein, carbs } = macroTargets(targetKcal, wKg, offset);

  return {
    bmiValue: Math.round(bmiValue * 10) / 10,
    bmiLabel: bmiCategory(bmiValue).label,
    bmrValue,
    tdeeValue,
    targetKcal,
    protein,
    carbs,
  };
}

/** React hook wrapper used by the live form panel. */
export function useMetrics(values: Partial<MetricsValues>): MetricsResult | null {
  return useMemo(
    () => computeMetrics(values),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      values.unit,
      values.age,
      values.sex,
      values.weight,
      values.height,
      values.activity,
      values.goal,
    ]
  );
}
