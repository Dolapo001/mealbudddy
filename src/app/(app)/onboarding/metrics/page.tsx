"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function MetricsPlaceholder() {
  const user = useAuthStore((s) => s.user);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-20">
      <div className="font-display text-3xl font-extrabold tracking-tight text-brand-deep">
        Meal<span className="text-brand-bright">Buddy</span>
      </div>
      <div className="rounded-3xl border border-brand-pale/30 bg-white p-10 shadow-[0_24px_64px_rgba(26,74,46,0.10)]">
        <p className="text-sm font-medium uppercase tracking-[2px] text-ink-muted">Step 2 · Body metrics</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-brand-deep">
          Tell us about yourself{user ? `, ${user.firstName}` : ""}
        </h1>
        <p className="mt-3 leading-relaxed text-ink-mid">
          The live BMI / TDEE form (Mifflin–St Jeor, unit toggle, activity, goal, dietary chips) is
          ported in <strong>Milestone&nbsp;2</strong>. Its math already lives in{" "}
          <code className="rounded bg-cream px-1.5 py-0.5 text-[0.8em]">src/lib/calc.ts</code>.
        </p>
        <div className="mt-7">
          <Link
            href="/dashboard"
            className="rounded-full bg-brand-bright px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
          >
            Continue to dashboard →
          </Link>
        </div>
      </div>
    </main>
  );
}
