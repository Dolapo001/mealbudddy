"use client";

import type { Food, MealTime } from "@/types";

export function FoodCard({
  food,
  mealTime,
  onClick,
}: {
  food: Food;
  mealTime?: MealTime;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-4 rounded-2xl border border-brand-pale/20 bg-white p-4 text-left shadow-[0_8px_28px_rgba(33,30,175,0.05)] transition hover:-translate-y-0.5 hover:border-brand-mid/40 hover:shadow-[0_14px_38px_rgba(33,30,175,0.12)] focus-visible:border-brand-bright"
    >
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-pale/10 text-2xl"
        aria-hidden
      >
        {food.emoji}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between gap-2">
          <span className="truncate font-medium text-brand-deep">{food.name}</span>
          <span className="shrink-0 rounded-full bg-amber-light px-2.5 py-0.5 text-xs font-semibold text-amber">
            {food.kcal} kcal
          </span>
        </span>
        <span className="mt-1 flex gap-3 text-xs text-ink-mid">
          <span>P {food.macros.protein}g</span>
          <span>C {food.macros.carbs}g</span>
          <span>F {food.macros.fat}g</span>
        </span>
      </span>
    </button>
  );
}
