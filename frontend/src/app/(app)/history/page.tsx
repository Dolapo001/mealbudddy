"use client";

import { useMemo } from "react";
import { buildHistory } from "@/lib/mock-data";
import { useMetricsStore } from "@/stores/metrics";
import { cx } from "@/lib/utils";

export default function HistoryPage() {
  const target = useMetricsStore((s) => s.result?.targetKcal) ?? 2200;
  const history = useMemo(() => buildHistory(target), [target]);
  const maxKcal = Math.max(...history.map((d) => Math.max(d.consumedKcal, d.targetKcal)));

  const avg = Math.round(history.reduce((s, d) => s + d.consumedKcal, 0) / history.length);

  return (
    <div>
      <header>
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">Last 7 days</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Nutrition history</h1>
        <p className="mt-2 text-ink-mid">How your intake tracked against your daily target.</p>
      </header>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Stat label="Avg intake" value={`${avg} kcal`} />
        <Stat label="Daily target" value={`${target} kcal`} />
        <Stat label="On-target days" value={`${history.filter((d) => Math.abs(d.consumedKcal - target) < 150).length}/7`} />
      </div>

      <section className="mt-8 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-deep">Calories vs target</h2>
        <div className="mt-6 flex items-end justify-between gap-3" style={{ height: 200 }}>
          {history.map((d) => {
            const h = (d.consumedKcal / maxKcal) * 100;
            const over = d.consumedKcal > d.targetKcal;
            return (
              <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                <div className="relative flex w-full flex-1 items-end justify-center">
                  <div
                    className={cx(
                      "w-7 rounded-t-lg transition-all",
                      over ? "bg-amber" : "bg-brand-bright"
                    )}
                    style={{ height: `${h}%` }}
                    title={`${d.consumedKcal} kcal`}
                  />
                  <div
                    className="absolute left-0 right-0 border-t-2 border-dashed border-accent-green"
                    style={{ bottom: `${(d.targetKcal / maxKcal) * 100}%` }}
                    aria-hidden
                  />
                </div>
                <span className="text-[0.65rem] text-ink-muted">{d.label}</span>
              </div>
            );
          })}
        </div>
        <div className="mt-4 flex gap-4 text-xs text-ink-mid">
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-brand-bright" /> On/under target</span>
          <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded bg-amber" /> Over target</span>
          <span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-accent-green" /> Target line</span>
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-brand-pale/20 bg-white p-4">
      <p className="text-xs uppercase tracking-[1.5px] text-ink-muted">{label}</p>
      <p className="mt-1 font-display text-2xl font-extrabold text-brand-deep">{value}</p>
    </div>
  );
}
