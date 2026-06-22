export type Role = "user" | "admin" | "super_admin";

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  studentId: string;
  department: string;
  role: Role;
  isEmailVerified: boolean;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

// ── Domain types (M2) ──────────────────────────────────────────────

export type Sex = "male" | "female";
export type Unit = "metric" | "imperial";

export type ActivityKey =
  | "sedentary"
  | "light"
  | "moderate"
  | "active"
  | "very_active";

export type GoalKey = "lose" | "maintain" | "gain_muscle" | "gain_weight";

export type DietaryTag =
  | "vegetarian"
  | "vegan"
  | "halal"
  | "low_carb"
  | "high_protein"
  | "gluten_free"
  | "lactose_free"
  | "pescatarian";

export type MealTime = "Breakfast" | "Lunch" | "Dinner" | "Snack";

export interface Macros {
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
}

export interface Food {
  id: string;
  name: string;
  emoji: string;
  kcal: number;
  macros: Macros;
  tags: DietaryTag[];
  description: string;
  servingSize: string;
}

export interface PlannedFood extends Food {
  mealTime: MealTime;
}

export interface DayPlan {
  day: string; // "Mon" .. "Sun"
  meals: PlannedFood[];
}

export interface MetricsResult {
  bmiValue: number;
  bmiLabel: string;
  bmrValue: number;
  tdeeValue: number;
  targetKcal: number;
  protein: number;
  carbs: number;
}
