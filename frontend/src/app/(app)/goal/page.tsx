"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMetricsStore } from "@/stores/metrics";
import { computeMetrics } from "@/hooks/useMetrics";
import { GoalCardGrid } from "@/components/forms/GoalCard";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import type { GoalKey } from "@/types";

export default function GoalPage() {
  const router = useRouter();
  const metrics = useMetricsStore((s) => s.metrics);
  const updateGoal = useMetricsStore((s) => s.updateGoal);
  const [goal, setGoal] = useState<GoalKey | undefined>(metrics?.goal);
  const [saving, setSaving] = useState(false);

  if (!metrics) {
    return (
      <EmptyState
        emoji="🎯"
        title="No metrics yet"
        hint="Set up your body metrics first, then you can change your goal here."
        action={
          <Link href="/onboarding/metrics" className="rounded-full bg-brand-bright px-6 py-3 text-sm font-medium text-white">
            Add metrics
          </Link>
        }
      />
    );
  }

  async function save() {
    if (!goal || !metrics) return;
    setSaving(true);
    const res = computeMetrics({ ...metrics, goal });
    if (res) await updateGoal(goal, res);
    setSaving(false);
    toast.success("Goal updated — your targets have been recalculated");
    router.push("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">Adjust your plan</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Change goal</h1>
        <p className="mt-2 text-ink-mid">Pick a new goal and we&apos;ll recompute your calorie and macro targets.</p>
      </header>

      <div className="mt-8 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <GoalCardGrid value={goal} onChange={setGoal} />
        <button
          onClick={save}
          disabled={saving || goal === metrics.goal}
          className="mt-6 w-full rounded-full bg-brand-bright py-3.5 text-sm font-semibold text-white transition hover:bg-brand-mid disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save new goal"}
        </button>
      </div>
    </div>
  );
}
