"use client";

import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { metricsSchema, type MetricsValues } from "@/schemas/metrics";
import { ACTIVITY_OPTIONS } from "@/lib/constants";
import { cx } from "@/lib/utils";
import { computeMetrics, useMetrics } from "@/hooks/useMetrics";
import { useMetricsStore } from "@/stores/metrics";
import { bmiCategory } from "@/lib/calc";
import { ProgressStrip } from "@/components/forms/ProgressStrip";
import { GoalCardGrid } from "@/components/forms/GoalCard";
import { DietaryChips } from "@/components/forms/DietaryChips";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

export default function MetricsPage() {
  const router = useRouter();
  const saveMetrics = useMetricsStore((s) => s.saveMetrics);
  const saved = useMetricsStore((s) => s.metrics);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<MetricsValues>({
    resolver: zodResolver(metricsSchema),
    defaultValues: saved ?? {
      unit: "metric",
      sex: "male",
      activity: "moderate",
      goal: "maintain",
      dietary: [],
    },
  });

  const values = watch();
  const result = useMetrics(values);
  const unit = values.unit;

  async function onSubmit(data: MetricsValues) {
    const res = computeMetrics(data);
    if (!res) {
      toast.error("Fill in your metrics to continue");
      return;
    }
    await saveMetrics(data, res);
    toast.success("Metrics saved — generating your plan");
    router.push("/dashboard");
  }

  const bmiKey = result ? bmiCategory(result.bmiValue).key : null;

  return (
    <div className="mx-auto max-w-5xl">
      <ProgressStrip current={2} />

      <header className="mt-7">
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">
          Step 2 · Body metrics
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold text-brand-deep">
          Tell us about yourself
        </h1>
        <p className="mt-2 text-ink-mid">
          We compute your calorie target with the Mifflin–St Jeor equation and tailor your weekly
          plan to it.
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col gap-6">
          {/* Basics */}
          <section className="rounded-3xl border border-brand-pale/20 bg-white p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-brand-deep">The basics</h2>
              <Controller
                control={control}
                name="unit"
                render={({ field }) => (
                  <div className="flex rounded-full border border-brand-pale/30 p-1 text-sm">
                    {(["metric", "imperial"] as const).map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => field.onChange(u)}
                        className={cx(
                          "rounded-full px-3 py-1 font-medium capitalize transition",
                          field.value === u ? "bg-brand-bright text-white" : "text-ink-mid"
                        )}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                )}
              />
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <Field label="Age" error={errors.age?.message}>
                <input type="number" {...register("age")} className="mb-input" placeholder="22" />
              </Field>
              <Field label="Sex" error={errors.sex?.message}>
                <select {...register("sex")} className="mb-input">
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
              <Field label={`Weight (${unit === "metric" ? "kg" : "lb"})`} error={errors.weight?.message}>
                <input
                  type="number"
                  step="any"
                  {...register("weight")}
                  className="mb-input"
                  placeholder={unit === "metric" ? "72" : "159"}
                />
              </Field>
              <Field label={`Height (${unit === "metric" ? "cm" : "in"})`} error={errors.height?.message}>
                <input
                  type="number"
                  step="any"
                  {...register("height")}
                  className="mb-input"
                  placeholder={unit === "metric" ? "178" : "70"}
                />
              </Field>
            </div>
          </section>

          {/* Activity */}
          <section className="rounded-3xl border border-brand-pale/20 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-deep">Activity level</h2>
            <Controller
              control={control}
              name="activity"
              render={({ field }) => (
                <div className="mt-4 flex flex-col gap-2">
                  {ACTIVITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => field.onChange(opt.key)}
                      className={cx(
                        "flex items-center gap-3 rounded-xl border-2 px-4 py-3 text-left transition",
                        field.value === opt.key
                          ? "border-brand-bright bg-brand-bright/5"
                          : "border-brand-pale/20 hover:border-brand-mid/40"
                      )}
                    >
                      <span className="text-xl" aria-hidden>{opt.emoji}</span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-brand-deep">{opt.label}</span>
                        <span className="block text-xs text-ink-muted">{opt.hint}</span>
                      </span>
                      <span className="text-xs font-semibold text-brand-light">×{opt.multiplier}</span>
                    </button>
                  ))}
                </div>
              )}
            />
          </section>

          {/* Goal */}
          <section className="rounded-3xl border border-brand-pale/20 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-deep">Your goal</h2>
            <p className="mt-1 text-sm text-ink-mid">This adjusts your daily calorie target.</p>
            <div className="mt-4">
              <Controller
                control={control}
                name="goal"
                render={({ field }) => (
                  <GoalCardGrid value={field.value} onChange={field.onChange} />
                )}
              />
            </div>
          </section>

          {/* Dietary */}
          <section className="rounded-3xl border border-brand-pale/20 bg-white p-6">
            <h2 className="font-display text-lg font-semibold text-brand-deep">Dietary preferences</h2>
            <p className="mt-1 text-sm text-ink-mid">Optional — we&apos;ll prioritise foods that fit.</p>
            <div className="mt-4">
              <Controller
                control={control}
                name="dietary"
                render={({ field }) => (
                  <DietaryChips value={field.value ?? []} onChange={field.onChange} />
                )}
              />
            </div>
          </section>
        </div>

        {/* Live panel */}
        <aside className="lg:sticky lg:top-8 lg:self-start">
          <div className="rounded-3xl border border-brand-pale/20 bg-gradient-to-br from-brand-deep to-brand-bright p-6 text-white shadow-[0_20px_60px_rgba(33,30,175,0.25)]">
            <p className="text-xs font-medium uppercase tracking-[2px] text-white/70">Live preview</p>
            {result ? (
              <>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-5xl font-extrabold">
                    <AnimatedCounter value={result.bmiValue} decimals={1} />
                  </span>
                  <span className="pb-2 text-sm text-white/80">BMI</span>
                </div>
                <span
                  className={cx(
                    "mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold",
                    bmiKey === "normal" ? "bg-accent-green/30 text-white" : "bg-amber/30 text-white"
                  )}
                >
                  {result.bmiLabel}
                </span>

                <dl className="mt-6 space-y-3 text-sm">
                  <Row label="BMR" value={result.bmrValue} suffix=" kcal" />
                  <Row label="TDEE (maintenance)" value={result.tdeeValue} suffix=" kcal" />
                  <Row label="Daily target" value={result.targetKcal} suffix=" kcal" bold />
                  <Row label="Protein target" value={result.protein} suffix=" g" />
                  <Row label="Carb target" value={result.carbs} suffix=" g" />
                </dl>
              </>
            ) : (
              <p className="mt-4 text-sm leading-relaxed text-white/80">
                Enter your age, weight and height to see your live BMI and calorie target.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-4 w-full rounded-full bg-brand-bright py-3.5 text-sm font-semibold text-white shadow transition hover:bg-brand-mid disabled:opacity-60"
          >
            {isSubmitting ? "Saving…" : "Save & generate plan →"}
          </button>
        </aside>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-medium text-ink-mid">{label}</span>
      {children}
      {error && <span className="text-xs text-warm">{error}</span>}
    </label>
  );
}

function Row({
  label,
  value,
  suffix,
  bold,
}: {
  label: string;
  value: number;
  suffix?: string;
  bold?: boolean;
}) {
  return (
    <div className="flex items-center justify-between border-b border-white/10 pb-2">
      <dt className="text-white/75">{label}</dt>
      <dd className={cx(bold ? "font-display text-lg font-extrabold" : "font-medium")}>
        <AnimatedCounter value={value} suffix={suffix} />
      </dd>
    </div>
  );
}
