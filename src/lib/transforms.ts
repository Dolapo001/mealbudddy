import type { DayPlan, DietaryTag, Food, MealTime, PlannedFood } from "@/types";

const DAY_LABEL: Record<string, string> = {
  mon: "Mon", tue: "Tue", wed: "Wed", thu: "Thu", fri: "Fri", sat: "Sat", sun: "Sun",
};
const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
const MEAL_LABEL: Record<string, MealTime> = {
  breakfast: "Breakfast", lunch: "Lunch", dinner: "Dinner", snack: "Snack",
};

interface ApiFood {
  slug: string;
  name: string;
  emoji: string;
  kcal: number;
  description: string;
  serving_size: string;
  macros: { protein: number; carbs: number; fat: number };
  tags: string[];
}
interface ApiItem {
  day: string;
  meal_time: string;
  food: ApiFood;
}
export interface ApiPlan {
  id: string;
  items: ApiItem[];
}

function foodFromApi(f: ApiFood): Food {
  return {
    id: f.slug,
    name: f.name,
    emoji: f.emoji,
    kcal: f.kcal,
    macros: f.macros,
    tags: f.tags as DietaryTag[],
    description: f.description,
    servingSize: f.serving_size,
  };
}

/** Turn a DRF MealPlan payload into the dashboard's DayPlan[] shape. */
export function planFromApi(plan: ApiPlan): DayPlan[] {
  const byDay = new Map<string, PlannedFood[]>();
  for (const item of plan.items) {
    const meals = byDay.get(item.day) ?? [];
    meals.push({ ...foodFromApi(item.food), mealTime: MEAL_LABEL[item.meal_time] });
    byDay.set(item.day, meals);
  }
  return DAY_ORDER.filter((d) => byDay.has(d)).map((d) => ({
    day: DAY_LABEL[d],
    meals: byDay.get(d)!,
  }));
}
