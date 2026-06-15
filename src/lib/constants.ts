import type { ActivityKey, GoalKey, DietaryTag } from "@/types";

export const ACTIVITY_OPTIONS: ReadonlyArray<{
  key: ActivityKey;
  label: string;
  hint: string;
  multiplier: number;
  emoji: string;
}> = [
  { key: "sedentary", label: "Sedentary", hint: "Little or no exercise", multiplier: 1.2, emoji: "🛋️" },
  { key: "light", label: "Lightly active", hint: "1–3 days / week", multiplier: 1.375, emoji: "🚶" },
  { key: "moderate", label: "Moderately active", hint: "3–5 days / week", multiplier: 1.55, emoji: "🏃" },
  { key: "active", label: "Very active", hint: "6–7 days / week", multiplier: 1.725, emoji: "🏋️" },
  { key: "very_active", label: "Extra active", hint: "Hard daily / physical job", multiplier: 1.9, emoji: "🔥" },
];

export const GOAL_OPTIONS: ReadonlyArray<{
  key: GoalKey;
  label: string;
  hint: string;
  offset: number;
  emoji: string;
}> = [
  { key: "lose", label: "Lose weight", hint: "Calorie deficit", offset: -500, emoji: "📉" },
  { key: "maintain", label: "Maintain", hint: "Stay balanced", offset: 0, emoji: "⚖️" },
  { key: "gain_muscle", label: "Gain muscle", hint: "Lean surplus", offset: 300, emoji: "💪" },
  { key: "gain_weight", label: "Gain weight", hint: "Calorie surplus", offset: 500, emoji: "📈" },
];

export const DIETARY_OPTIONS: ReadonlyArray<{ key: DietaryTag; label: string; emoji: string }> = [
  { key: "vegetarian", label: "Vegetarian", emoji: "🥗" },
  { key: "vegan", label: "Vegan", emoji: "🌱" },
  { key: "halal", label: "Halal", emoji: "🕌" },
  { key: "low_carb", label: "Low-carb", emoji: "🥩" },
  { key: "high_protein", label: "High-protein", emoji: "🍗" },
  { key: "gluten_free", label: "Gluten-free", emoji: "🌾" },
  { key: "lactose_free", label: "Lactose-free", emoji: "🥛" },
  { key: "pescatarian", label: "Pescatarian", emoji: "🐟" },
];

export const ACTIVITY_MULTIPLIERS: Record<ActivityKey, number> = ACTIVITY_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.key]: o.multiplier }),
  {} as Record<ActivityKey, number>
);

export const GOAL_OFFSETS: Record<GoalKey, number> = GOAL_OPTIONS.reduce(
  (acc, o) => ({ ...acc, [o.key]: o.offset }),
  {} as Record<GoalKey, number>
);

export function dietaryLabel(tag: DietaryTag): string {
  return DIETARY_OPTIONS.find((o) => o.key === tag)?.label ?? tag;
}

export function goalLabel(key: GoalKey): string {
  return GOAL_OPTIONS.find((o) => o.key === key)?.label ?? key;
}
