"use client";

import { cx } from "@/lib/utils";
import { DIETARY_OPTIONS } from "@/lib/constants";
import type { DietaryTag } from "@/types";

export function DietaryChips({
  value,
  onChange,
}: {
  value: DietaryTag[];
  onChange: (next: DietaryTag[]) => void;
}) {
  function toggle(tag: DietaryTag) {
    onChange(value.includes(tag) ? value.filter((t) => t !== tag) : [...value, tag]);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {DIETARY_OPTIONS.map((opt) => {
        const active = value.includes(opt.key);
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            aria-pressed={active}
            className={cx(
              "flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-sm font-medium transition",
              active
                ? "border-brand-mid bg-brand-mid/10 text-brand-deep"
                : "border-brand-pale/30 text-ink-mid hover:border-brand-mid/40"
            )}
          >
            <span aria-hidden>{opt.emoji}</span>
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
