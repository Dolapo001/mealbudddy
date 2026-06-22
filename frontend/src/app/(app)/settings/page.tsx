"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMetricsStore } from "@/stores/metrics";
import { DietaryChips } from "@/components/forms/DietaryChips";
import { cx } from "@/lib/utils";
import type { DietaryTag, Unit } from "@/types";

export default function SettingsPage() {
  const metrics = useMetricsStore((s) => s.metrics);
  const updatePreferences = useMetricsStore((s) => s.updatePreferences);

  const [unit, setUnit] = useState<Unit>(metrics?.unit ?? "metric");
  const [dietary, setDietary] = useState<DietaryTag[]>(metrics?.dietary ?? []);
  const [notifications, setNotifications] = useState({ weekly: true, tips: false, email: true });

  function save() {
    updatePreferences({ unit, dietary });
    toast.success("Settings saved");
  }

  return (
    <div className="mx-auto max-w-2xl">
      <header>
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">Preferences</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Settings</h1>
      </header>

      <section className="mt-7 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-deep">Units</h2>
        <div className="mt-3 flex rounded-full border border-brand-pale/30 p-1 text-sm">
          {(["metric", "imperial"] as const).map((u) => (
            <button
              key={u}
              onClick={() => setUnit(u)}
              className={cx(
                "flex-1 rounded-full px-3 py-2 font-medium capitalize transition",
                unit === u ? "bg-brand-bright text-white" : "text-ink-mid"
              )}
            >
              {u}
            </button>
          ))}
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-deep">Dietary preferences</h2>
        <div className="mt-4">
          <DietaryChips value={dietary} onChange={setDietary} />
        </div>
      </section>

      <section className="mt-5 rounded-3xl border border-brand-pale/20 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-deep">Notifications</h2>
        <div className="mt-4 flex flex-col gap-3">
          <Toggle label="Weekly plan ready" checked={notifications.weekly} onChange={(v) => setNotifications((n) => ({ ...n, weekly: v }))} />
          <Toggle label="Nutrition tips" checked={notifications.tips} onChange={(v) => setNotifications((n) => ({ ...n, tips: v }))} />
          <Toggle label="Email updates" checked={notifications.email} onChange={(v) => setNotifications((n) => ({ ...n, email: v }))} />
        </div>
      </section>

      <button
        onClick={save}
        className="mt-6 w-full rounded-full bg-brand-bright py-3.5 text-sm font-semibold text-white transition hover:bg-brand-mid"
      >
        Save settings
      </button>
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between">
      <span className="text-sm text-ink-dark">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cx(
          "relative h-6 w-11 rounded-full transition",
          checked ? "bg-brand-bright" : "bg-brand-pale/30"
        )}
      >
        <span
          className={cx(
            "absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all",
            checked ? "left-[22px]" : "left-0.5"
          )}
        />
      </button>
    </label>
  );
}
