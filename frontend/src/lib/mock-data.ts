import type { Food, DayPlan, PlannedFood, MealTime } from "@/types";

// Realistic Nigerian foods with plausible kcal/macros (per serving).
// Centralised here so the API swap in M5 is a single import change.
export const NIGERIAN_FOODS: Food[] = [
  {
    id: "jollof-rice",
    name: "Jollof Rice",
    emoji: "🍚",
    kcal: 510,
    macros: { protein: 12, carbs: 86, fat: 13 },
    tags: ["vegetarian", "halal"],
    description: "Smoky party-style rice cooked in a rich tomato-pepper base.",
    servingSize: "1 plate (300g)",
  },
  {
    id: "egusi-soup",
    name: "Egusi Soup",
    emoji: "🍲",
    kcal: 430,
    macros: { protein: 24, carbs: 14, fat: 31 },
    tags: ["high_protein", "low_carb", "halal", "gluten_free"],
    description: "Melon-seed soup with leafy greens, assorted meat and fish.",
    servingSize: "1 bowl (250g)",
  },
  {
    id: "pounded-yam",
    name: "Pounded Yam",
    emoji: "🥣",
    kcal: 340,
    macros: { protein: 4, carbs: 80, fat: 1 },
    tags: ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    description: "Smooth, stretchy yam swallow — the classic soup partner.",
    servingSize: "1 wrap (200g)",
  },
  {
    id: "moi-moi",
    name: "Moi Moi",
    emoji: "🫓",
    kcal: 210,
    macros: { protein: 13, carbs: 22, fat: 8 },
    tags: ["vegetarian", "high_protein", "halal", "gluten_free"],
    description: "Steamed bean pudding with peppers, onions and egg.",
    servingSize: "1 piece (150g)",
  },
  {
    id: "akara",
    name: "Akara",
    emoji: "🧆",
    kcal: 180,
    macros: { protein: 9, carbs: 14, fat: 10 },
    tags: ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    description: "Crispy deep-fried bean fritters — a beloved breakfast bite.",
    servingSize: "3 balls (90g)",
  },
  {
    id: "efo-riro",
    name: "Efo Riro",
    emoji: "🥬",
    kcal: 290,
    macros: { protein: 18, carbs: 11, fat: 20 },
    tags: ["high_protein", "low_carb", "halal", "gluten_free", "pescatarian"],
    description: "Rich Yoruba spinach stew with peppers, locust beans and fish.",
    servingSize: "1 bowl (220g)",
  },
  {
    id: "suya",
    name: "Suya",
    emoji: "🍢",
    kcal: 320,
    macros: { protein: 34, carbs: 6, fat: 18 },
    tags: ["high_protein", "low_carb", "halal", "gluten_free", "lactose_free"],
    description: "Spicy grilled beef skewers crusted in peanut yaji spice.",
    servingSize: "1 stick (160g)",
  },
  {
    id: "beans-plantain",
    name: "Beans & Plantain",
    emoji: "🍌",
    kcal: 460,
    macros: { protein: 17, carbs: 72, fat: 12 },
    tags: ["vegetarian", "vegan", "high_protein", "halal", "lactose_free"],
    description: "Stewed honey beans paired with fried ripe plantain.",
    servingSize: "1 plate (300g)",
  },
  {
    id: "ofada-rice",
    name: "Ofada Rice & Ayamase",
    emoji: "🍛",
    kcal: 540,
    macros: { protein: 20, carbs: 74, fat: 18 },
    tags: ["halal", "gluten_free"],
    description: "Local unpolished rice with smoky green-pepper designer stew.",
    servingSize: "1 plate (320g)",
  },
  {
    id: "pepper-soup",
    name: "Catfish Pepper Soup",
    emoji: "🐟",
    kcal: 240,
    macros: { protein: 30, carbs: 5, fat: 11 },
    tags: ["high_protein", "low_carb", "pescatarian", "halal", "gluten_free", "lactose_free"],
    description: "Light, fiery broth of catfish simmered with native spices.",
    servingSize: "1 bowl (250g)",
  },
  {
    id: "yam-porridge",
    name: "Yam Porridge (Asaro)",
    emoji: "🍠",
    kcal: 420,
    macros: { protein: 8, carbs: 78, fat: 10 },
    tags: ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    description: "Soft mashed yam pottage in a palm-oil pepper sauce.",
    servingSize: "1 bowl (280g)",
  },
  {
    id: "eba",
    name: "Eba & Okra",
    emoji: "🍵",
    kcal: 380,
    macros: { protein: 10, carbs: 70, fat: 8 },
    tags: ["vegetarian", "halal", "gluten_free", "pescatarian"],
    description: "Garri swallow served with draw-y okra and seafood.",
    servingSize: "1 wrap + soup (260g)",
  },
  {
    id: "akamu-akara",
    name: "Akamu (Pap)",
    emoji: "🥛",
    kcal: 160,
    macros: { protein: 3, carbs: 34, fat: 1 },
    tags: ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    description: "Smooth fermented corn pap — a gentle, warming breakfast.",
    servingSize: "1 cup (250ml)",
  },
  {
    id: "fried-rice",
    name: "Nigerian Fried Rice",
    emoji: "🍚",
    kcal: 530,
    macros: { protein: 16, carbs: 78, fat: 16 },
    tags: ["halal"],
    description: "Curry-kissed rice tossed with liver, veg and shrimp.",
    servingSize: "1 plate (300g)",
  },
  {
    id: "chicken-grilled",
    name: "Grilled Chicken",
    emoji: "🍗",
    kcal: 280,
    macros: { protein: 38, carbs: 2, fat: 13 },
    tags: ["high_protein", "low_carb", "halal", "gluten_free", "lactose_free"],
    description: "Marinated chicken thigh grilled to a charred finish.",
    servingSize: "1 piece (150g)",
  },
  {
    id: "plantain-chips",
    name: "Plantain Chips",
    emoji: "🍌",
    kcal: 150,
    macros: { protein: 1, carbs: 24, fat: 6 },
    tags: ["vegetarian", "vegan", "halal", "gluten_free", "lactose_free"],
    description: "Crunchy thin-sliced plantain — the perfect snack.",
    servingSize: "1 pack (40g)",
  },
];

export function getFoodById(id: string): Food | undefined {
  return NIGERIAN_FOODS.find((f) => f.id === id);
}

// Deterministic weekly plan so the dashboard renders the same every load.
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

const PLAN_TEMPLATE: Record<MealTime, string[]> = {
  Breakfast: ["akara", "akamu-akara", "moi-moi", "plantain-chips"],
  Lunch: ["jollof-rice", "beans-plantain", "ofada-rice", "fried-rice"],
  Dinner: ["egusi-soup", "pounded-yam", "efo-riro", "eba"],
  Snack: ["suya", "pepper-soup", "chicken-grilled", "yam-porridge"],
};

const MEAL_ORDER: MealTime[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export function buildWeeklyPlan(): DayPlan[] {
  return DAYS.map((day, di) => {
    const meals: PlannedFood[] = MEAL_ORDER.map((mealTime) => {
      const pool = PLAN_TEMPLATE[mealTime];
      const food = getFoodById(pool[di % pool.length])!;
      return { ...food, mealTime };
    });
    return { day, meals };
  });
}

export interface HistoryDay {
  date: string; // ISO
  label: string; // "Mon 9"
  consumedKcal: number;
  targetKcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

// 7 days of mock nutrition history vs a target.
export function buildHistory(targetKcal = 2200): HistoryDay[] {
  const today = new Date("2026-06-14T00:00:00");
  const variances = [-180, 120, -60, 240, -320, 80, -40];
  return variances.map((v, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (variances.length - 1 - i));
    const consumed = targetKcal + v;
    return {
      date: d.toISOString(),
      label: d.toLocaleDateString("en-US", { weekday: "short", day: "numeric" }),
      consumedKcal: consumed,
      targetKcal,
      protein: Math.round((consumed * 0.25) / 4),
      carbs: Math.round((consumed * 0.5) / 4),
      fat: Math.round((consumed * 0.25) / 9),
    };
  });
}
