// Body-metric math, ported 1:1 from the prototype's metrics page.
// Used by the onboarding form in M2 and mirrored server-side in M5.

export type Sex = "male" | "female";
export type Unit = "metric" | "imperial";

export function toMetric(weight: number, height: number, unit: Unit) {
  return unit === "metric"
    ? { wKg: weight, hCm: height }
    : { wKg: weight * 0.453592, hCm: height * 2.54 };
}

export function bmi(wKg: number, hCm: number): number {
  const hM = hCm / 100;
  return wKg / (hM * hM);
}

export function bmiCategory(value: number) {
  if (value < 18.5) return { label: "Underweight", key: "under" as const };
  if (value < 25) return { label: "Normal weight", key: "normal" as const };
  if (value < 30) return { label: "Overweight", key: "over" as const };
  return { label: "Obese", key: "obese" as const };
}

/** Mifflin–St Jeor BMR. */
export function bmr(wKg: number, hCm: number, age: number, sex: Sex): number {
  return sex === "male"
    ? 10 * wKg + 6.25 * hCm - 5 * age + 5
    : 10 * wKg + 6.25 * hCm - 5 * age - 161;
}

export function tdee(bmrValue: number, activityMultiplier: number): number {
  return Math.round(bmrValue * activityMultiplier);
}

export function macroTargets(targetKcal: number, wKg: number, goalOffset: number) {
  const protein = Math.round(wKg * (goalOffset === 300 ? 2.0 : 1.6));
  const carbs = Math.round((targetKcal * 0.5) / 4);
  return { protein, carbs };
}
