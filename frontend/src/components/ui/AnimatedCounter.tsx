"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "framer-motion";

interface Props {
  value: number;
  decimals?: number;
  suffix?: string;
  className?: string;
}

/** Counts up to `value` on mount / when value changes. Reduced-motion safe. */
export function AnimatedCounter({ value, decimals = 0, suffix = "", className }: Props) {
  const [display, setDisplay] = useState(0);
  const prev = useRef(0);

  useEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setDisplay(value);
      prev.current = value;
      return;
    }
    const controls = animate(prev.current, value, {
      duration: 0.9,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(v),
    });
    prev.current = value;
    return () => controls.stop();
  }, [value]);

  return (
    <span className={className}>
      {display.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
      {suffix}
    </span>
  );
}
