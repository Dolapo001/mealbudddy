import { cx } from "@/lib/utils";

const STEPS = ["Account", "Body metrics", "Recommendations"];

export function ProgressStrip({ current }: { current: number }) {
  return (
    <ol className="flex items-center gap-2">
      {STEPS.map((label, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              className={cx(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition",
                done && "bg-accent-green text-white",
                active && "bg-brand-bright text-white",
                !done && !active && "bg-brand-pale/15 text-ink-muted"
              )}
            >
              {done ? "✓" : step}
            </span>
            <span
              className={cx(
                "hidden text-xs font-medium sm:block",
                active ? "text-brand-deep" : "text-ink-muted"
              )}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <span className="h-px flex-1 bg-brand-pale/25" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}
