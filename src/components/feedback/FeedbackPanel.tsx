"use client";

import { useState } from "react";
import { toast } from "sonner";
import { cx } from "@/lib/utils";
import { api, BACKEND_READY } from "@/lib/api";

const REASON_CHIPS = [
  "Loved the variety",
  "Too repetitive",
  "Portions too big",
  "Portions too small",
  "Great protein",
  "More veggies please",
];

export function FeedbackPanel({ planId }: { planId?: string }) {
  const [stars, setStars] = useState(0);
  const [hover, setHover] = useState(0);
  const [chips, setChips] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function toggleChip(chip: string) {
    setChips((c) => (c.includes(chip) ? c.filter((x) => x !== chip) : [...c, chip]));
  }

  async function submit() {
    if (stars === 0) {
      toast.error("Pick a star rating first");
      return;
    }
    setSubmitting(true);
    try {
      if (BACKEND_READY) {
        await api.post("/feedback", { plan_id: planId, stars, reason_chips: chips, comment });
      } else {
        await new Promise((r) => setTimeout(r, 700));
      }
      setDone(true);
      toast.success("Thanks! Your feedback tunes future recommendations.");
    } catch {
      toast.error("Couldn't submit feedback. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-brand-pale/20 bg-white p-6 text-center">
        <div className="text-3xl" aria-hidden>🎉</div>
        <p className="mt-2 font-medium text-brand-deep">Feedback received</p>
        <p className="mt-1 text-sm text-ink-mid">We&apos;ll factor it into next week&apos;s plan.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-brand-pale/20 bg-white p-6">
      <h3 className="font-display text-lg font-semibold text-brand-deep">Rate this week&apos;s plan</h3>
      <p className="mt-1 text-sm text-ink-mid">Your rating helps the model learn your taste.</p>

      <div className="mt-4 flex gap-1" role="radiogroup" aria-label="Star rating">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={stars === n}
            aria-label={`${n} star${n > 1 ? "s" : ""}`}
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
            className="text-3xl transition-transform hover:scale-110"
          >
            <span className={cx((hover || stars) >= n ? "text-amber" : "text-brand-pale/30")}>★</span>
          </button>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {REASON_CHIPS.map((chip) => (
          <button
            key={chip}
            onClick={() => toggleChip(chip)}
            className={cx(
              "rounded-full border px-3 py-1.5 text-xs font-medium transition",
              chips.includes(chip)
                ? "border-brand-mid bg-brand-mid/10 text-brand-deep"
                : "border-brand-pale/30 text-ink-mid hover:border-brand-mid/40"
            )}
          >
            {chip}
          </button>
        ))}
      </div>

      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Anything else? (optional)"
        rows={2}
        className="mt-4 w-full resize-none rounded-xl border border-brand-pale/30 bg-cream/40 px-4 py-3 text-sm text-ink-dark outline-none transition focus:border-brand-mid"
      />

      <button
        onClick={submit}
        disabled={submitting}
        className="mt-4 w-full rounded-full bg-brand-bright py-3 text-sm font-semibold text-white transition hover:bg-brand-mid disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Submit feedback"}
      </button>
    </div>
  );
}
