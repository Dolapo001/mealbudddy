"use client";

import Link from "next/link";
import { useAuthStore } from "@/stores/auth";

export default function DashboardPlaceholder() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-6 px-6 py-20">
      <div className="font-display text-3xl font-extrabold tracking-tight text-brand-deep">
        Meal<span className="text-brand-bright">Buddy</span>
      </div>
      <div className="rounded-3xl border border-brand-pale/30 bg-white p-10 shadow-[0_24px_64px_rgba(26,74,46,0.10)]">
        <p className="text-sm font-medium uppercase tracking-[2px] text-ink-muted">Dashboard</p>
        <h1 className="mt-3 font-display text-2xl font-extrabold text-brand-deep">
          Welcome{user ? `, ${user.firstName}` : ""} 👋
        </h1>
        <p className="mt-3 leading-relaxed text-ink-mid">
          You&apos;ve completed the auth flow. The full recommendations dashboard — weekly meal plan,
          food detail modal, nutrition donut, and ML feedback — is ported faithfully in{" "}
          <strong>Milestone&nbsp;2</strong>.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/onboarding/metrics"
            className="rounded-full bg-brand-bright px-6 py-3 text-sm font-medium text-white transition hover:bg-brand-mid"
          >
            Update metrics
          </Link>
          <button
            onClick={logout}
            className="rounded-full border border-brand-pale/40 px-6 py-3 text-sm font-medium text-brand-deep transition hover:bg-brand-pale/10"
          >
            Sign out
          </button>
        </div>
      </div>
    </main>
  );
}
