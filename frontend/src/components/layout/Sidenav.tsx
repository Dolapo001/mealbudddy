"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { cx } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", emoji: "📊" },
  { href: "/foods", label: "Nigerian foods", emoji: "🍲" },
  { href: "/history", label: "Nutrition history", emoji: "📈" },
  { href: "/goal", label: "Change goal", emoji: "🎯" },
  { href: "/settings", label: "Settings", emoji: "⚙️" },
  { href: "/profile", label: "Profile", emoji: "👤" },
];

export function Sidenav() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);

  function signOut() {
    logout();
    toast.success("Signed out");
    router.push("/auth");
  }

  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "MB"
    : "MB";

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-brand-pale/20 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <Link href="/dashboard" className="font-display text-xl font-extrabold text-brand-deep">
          Meal<span className="text-brand-bright">Buddy</span>
        </Link>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle menu"
          className="rounded-lg border border-brand-pale/30 px-3 py-1.5 text-brand-deep"
        >
          ☰
        </button>
      </div>

      <aside
        className={cx(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-brand-pale/20 bg-white px-4 py-6 transition-transform lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <Link
          href="/dashboard"
          className="px-3 font-display text-2xl font-extrabold tracking-tight text-brand-deep"
        >
          Meal<span className="text-brand-bright">Buddy</span>
        </Link>

        <nav className="mt-8 flex flex-1 flex-col gap-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                  active
                    ? "bg-brand-bright text-white shadow"
                    : "text-ink-mid hover:bg-brand-pale/10 hover:text-brand-deep"
                )}
              >
                <span aria-hidden>{item.emoji}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 rounded-2xl border border-brand-pale/20 bg-cream/50 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-bright text-sm font-semibold text-white">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-brand-deep">
                {user ? `${user.firstName} ${user.lastName}` : "Guest"}
              </p>
              <p className="truncate text-xs text-ink-muted">{user?.email ?? ""}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="mt-3 w-full rounded-lg border border-brand-pale/30 py-2 text-xs font-medium text-brand-deep transition hover:bg-brand-pale/10"
          >
            Sign out
          </button>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-30 bg-brand-deep/20 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}
    </>
  );
}
