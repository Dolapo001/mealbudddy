"use client";

import { cx } from "@/lib/utils";

export function DayTabs({
  days,
  active,
  onChange,
}: {
  days: string[];
  active: string;
  onChange: (day: string) => void;
}) {
  return (
    <div
      className="flex gap-1.5 overflow-x-auto rounded-full border border-brand-pale/20 bg-white p-1.5"
      role="tablist"
      aria-label="Day of the week"
    >
      {days.map((day) => (
        <button
          key={day}
          role="tab"
          aria-selected={active === day}
          onClick={() => onChange(day)}
          className={cx(
            "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
            active === day
              ? "bg-brand-bright text-white shadow"
              : "text-ink-mid hover:bg-brand-pale/10"
          )}
        >
          {day}
        </button>
      ))}
    </div>
  );
}
