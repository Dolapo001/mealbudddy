"use client";

import type { Macros } from "@/types";

const COLORS = {
  carbs: "#3db870",
  protein: "#4c67ed",
  fat: "#f2a024",
} as const;

/** SVG macro donut (carbs / protein / fat by calorie share). */
export function NutritionDonut({ macros, size = 168 }: { macros: Macros; size?: number }) {
  const kcal = { carbs: macros.carbs * 4, protein: macros.protein * 4, fat: macros.fat * 9 };
  const total = kcal.carbs + kcal.protein + kcal.fat || 1;
  const r = size / 2 - 16;
  const circ = 2 * Math.PI * r;

  let offset = 0;
  const segments = (["carbs", "protein", "fat"] as const).map((key) => {
    const frac = kcal[key] / total;
    const seg = {
      key,
      dash: frac * circ,
      gap: circ - frac * circ,
      rotation: (offset / total) * 360 - 90,
    };
    offset += kcal[key];
    return seg;
  });

  return (
    <div className="relative inline-flex" style={{ width: size, height: size }}>
      <svg width={size} height={size} role="img" aria-label="Macro breakdown">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef0fb" strokeWidth={16} />
        {segments.map((s) => (
          <circle
            key={s.key}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={COLORS[s.key]}
            strokeWidth={16}
            strokeDasharray={`${s.dash} ${s.gap}`}
            strokeLinecap="round"
            transform={`rotate(${s.rotation} ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray .6s ease" }}
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-2xl font-extrabold text-brand-deep">
          {Math.round(total)}
        </span>
        <span className="text-[0.7rem] uppercase tracking-[1.5px] text-ink-muted">kcal</span>
      </div>
    </div>
  );
}

export function MacroLegend({ macros }: { macros: Macros }) {
  const rows = [
    { key: "carbs", label: "Carbs", grams: macros.carbs, color: COLORS.carbs },
    { key: "protein", label: "Protein", grams: macros.protein, color: COLORS.protein },
    { key: "fat", label: "Fat", grams: macros.fat, color: COLORS.fat },
  ] as const;
  const maxG = Math.max(...rows.map((r) => r.grams), 1);

  return (
    <ul className="flex w-full flex-col gap-3">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-ink-mid">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </span>
            <span className="font-medium text-brand-deep">{r.grams} g</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-brand-pale/10">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(r.grams / maxG) * 100}%`, background: r.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
