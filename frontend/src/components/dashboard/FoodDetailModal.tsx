"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { MacroLegend, NutritionDonut } from "./NutritionDonut";
import { dietaryLabel } from "@/lib/constants";
import type { Food } from "@/types";

export function FoodDetailModal({ food, onClose }: { food: Food | null; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (food) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [food, onClose]);

  return (
    <AnimatePresence>
      {food && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-brand-deep/40 p-4 backdrop-blur-sm sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${food.name} details`}
        >
          <motion.div
            className="w-full max-w-lg rounded-3xl bg-white p-7 shadow-2xl"
            initial={{ opacity: 0, y: 30, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-4">
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-pale/10 text-4xl" aria-hidden>
                {food.emoji}
              </span>
              <div className="flex-1">
                <h2 className="font-display text-2xl font-extrabold text-brand-deep">{food.name}</h2>
                <p className="text-sm text-ink-muted">{food.servingSize}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="rounded-full p-2 text-ink-muted transition hover:bg-brand-pale/10"
              >
                ✕
              </button>
            </div>

            <p className="mt-4 leading-relaxed text-ink-mid">{food.description}</p>

            <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
              <NutritionDonut macros={food.macros} />
              <div className="flex-1 self-stretch">
                <MacroLegend macros={food.macros} />
              </div>
            </div>

            {food.tags.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {food.tags.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-brand-pale/10 px-3 py-1 text-xs font-medium text-brand-light"
                  >
                    {dietaryLabel(t)}
                  </span>
                ))}
              </div>
            )}

            <button
              onClick={() => {
                toast.success(`${food.name} added to your meal plan`);
                onClose();
              }}
              className="mt-7 w-full rounded-full bg-brand-bright py-3.5 text-sm font-semibold text-white transition hover:bg-brand-mid"
            >
              Add to my meal plan
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
