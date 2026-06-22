import type { ReactNode } from "react";

export function EmptyState({
  emoji = "🍽️",
  title,
  hint,
  action,
}: {
  emoji?: string;
  title: string;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-brand-pale/40 bg-white/60 px-8 py-16 text-center">
      <div className="text-5xl" aria-hidden>
        {emoji}
      </div>
      <h3 className="mt-4 font-display text-xl font-semibold text-brand-deep">{title}</h3>
      {hint && <p className="mt-2 max-w-sm text-sm text-ink-mid">{hint}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
