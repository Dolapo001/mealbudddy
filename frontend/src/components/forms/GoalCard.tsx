"use client";

import { cx } from "@/lib/utils";
import { GOAL_OPTIONS } from "@/lib/constants";
import type { GoalKey } from "@/types";

export function GoalCardGrid({
  value,
  onChange,
}: {
  value: GoalKey | undefined;
  onChange: (key: GoalKey) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {GOAL_OPTIONS.map((goal) => {
        const active = value === goal.key;
        return (
          <button
            key={goal.key}
            type="button"
            onClick={() => onChange(goal.key)}
            aria-pressed={active}
            className={cx(
              "flex flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center transition",
              active
                ? "border-brand-bright bg-brand-bright/5 shadow-[0_8px_24px_rgba(33,30,175,0.10)]"
                : "border-brand-pale/25 bg-white hover:border-brand-mid/40"
            )}
          >
            <span className="text-2xl" aria-hidden>
              {goal.emoji}
            </span>
            <span className="text-sm font-semibold text-brand-deep">{goal.label}</span>
            <span className="text-xs text-ink-muted">{goal.hint}</span>
          </button>
        );
      })}
    </div>
  );
}
