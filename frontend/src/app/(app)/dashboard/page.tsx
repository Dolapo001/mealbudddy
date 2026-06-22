"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { useMetricsStore } from "@/stores/metrics";
import { useRecommendations } from "@/hooks/useRecommendations";
import { goalLabel } from "@/lib/constants";
import { StatCard } from "@/components/dashboard/StatCard";
import { DayTabs } from "@/components/dashboard/DayTabs";
import { FoodCard } from "@/components/dashboard/FoodCard";
import { FoodDetailModal } from "@/components/dashboard/FoodDetailModal";
import { FeedbackPanel } from "@/components/feedback/FeedbackPanel";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Food, MealTime } from "@/types";

const MEAL_ORDER: MealTime[] = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const metrics = useMetricsStore((s) => s.result);
  const savedMetrics = useMetricsStore((s) => s.metrics);
  const hydrate = useMetricsStore((s) => s.hydrate);
  const { plan, loading, refreshing, refresh } = useRecommendations();

  // Returning users: pull current metrics from the backend to fill the stat cards.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const [activeDay, setActiveDay] = useState("Mon");
  const [selected, setSelected] = useState<Food | null>(null);

  const days = useMemo(() => plan.map((d) => d.day), [plan]);
  const dayPlan = plan.find((d) => d.day === activeDay) ?? plan[0];

  const target = metrics?.targetKcal ?? 2200;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">
            My recommendations
          </p>
          <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">
            Welcome back{user ? `, ${user.firstName}` : ""} 👋
          </h1>
        </div>
        <button
          onClick={refresh}
          disabled={refreshing}
          className="rounded-full border border-brand-pale/30 bg-white px-5 py-2.5 text-sm font-medium text-brand-deep shadow-sm transition hover:bg-brand-pale/10 disabled:opacity-60"
        >
          {refreshing ? "Refreshing…" : "↻ Refresh recommendations"}
        </button>
      </header>

      {/* Stat cards */}
      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard index={0} label="Daily target" value={target} suffix=" kcal" emoji="🔥" hint="Calorie goal" />
        <StatCard index={1} label="BMI" value={metrics?.bmiValue ?? 0} decimals={1} emoji="⚖️" hint={metrics?.bmiLabel ?? "Add metrics"} />
        <StatCard index={2} label="Protein" value={metrics?.protein ?? 0} suffix=" g" emoji="💪" hint="Daily target" />
        <StatCard
          index={3}
          label="Goal"
          value={0}
          emoji="🎯"
          hint={savedMetrics ? goalLabel(savedMetrics.goal) : "Not set"}
        />
      </div>
      {!savedMetrics && (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-amber/30 bg-amber-light/60 px-5 py-3 text-sm text-ink-dark">
          <span>Add your body metrics to personalise these numbers.</span>
          <Link href="/onboarding/metrics" className="shrink-0 font-semibold text-brand-bright underline">
            Add metrics →
          </Link>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        {/* Weekly plan */}
        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-xl font-bold text-brand-deep">Your weekly plan</h2>
          </div>
          <div className="mt-4">
            <DayTabs days={days.length ? days : ["Mon"]} active={activeDay} onChange={setActiveDay} />
          </div>

          {loading ? (
            <div className="mt-5 space-y-6">
              {MEAL_ORDER.map((m) => (
                <div key={m}>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="mt-3 h-20 w-full" />
                </div>
              ))}
            </div>
          ) : dayPlan ? (
            <motion.div
              key={activeDay}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-5 space-y-6"
            >
              {MEAL_ORDER.map((mealTime) => {
                const meal = dayPlan.meals.find((m) => m.mealTime === mealTime);
                if (!meal) return null;
                return (
                  <div key={mealTime}>
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-[1.5px] text-ink-muted">
                      {mealTime}
                    </h3>
                    <FoodCard food={meal} mealTime={mealTime} onClick={() => setSelected(meal)} />
                  </div>
                );
              })}
            </motion.div>
          ) : (
            <div className="mt-5">
              <EmptyState
                title="No plan yet"
                hint="Add your metrics and we'll generate a week of meals."
                action={
                  <Link
                    href="/onboarding/metrics"
                    className="rounded-full bg-brand-bright px-6 py-3 text-sm font-medium text-white"
                  >
                    Get started
                  </Link>
                }
              />
            </div>
          )}
        </section>

        {/* Side column */}
        <aside className="flex flex-col gap-6">
          <FeedbackPanel />
        </aside>
      </div>

      <FoodDetailModal food={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
