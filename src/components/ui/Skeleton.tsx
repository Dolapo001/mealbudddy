import { cx } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        "animate-pulse rounded-xl bg-gradient-to-r from-brand-pale/10 via-brand-pale/20 to-brand-pale/10",
        className
      )}
    />
  );
}
