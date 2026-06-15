"use client";

import { motion } from "framer-motion";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";

interface Props {
  label: string;
  value: number;
  decimals?: number;
  suffix?: string;
  hint?: string;
  emoji: string;
  index?: number;
}

export function StatCard({ label, value, decimals, suffix, hint, emoji, index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: "easeOut" }}
      className="rounded-2xl border border-brand-pale/20 bg-white p-5 shadow-[0_12px_40px_rgba(33,30,175,0.06)]"
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-[1.5px] text-ink-muted">
          {label}
        </span>
        <span className="text-xl" aria-hidden>
          {emoji}
        </span>
      </div>
      <div className="mt-3 font-display text-3xl font-extrabold text-brand-deep">
        <AnimatedCounter value={value} decimals={decimals} suffix={suffix} />
      </div>
      {hint && <p className="mt-1 text-xs text-ink-mid">{hint}</p>}
    </motion.div>
  );
}
