"use client";

import { useMemo, useState } from "react";
import { NIGERIAN_FOODS } from "@/lib/mock-data";
import { DIETARY_OPTIONS } from "@/lib/constants";
import { cx } from "@/lib/utils";
import { FoodCard } from "@/components/dashboard/FoodCard";
import { FoodDetailModal } from "@/components/dashboard/FoodDetailModal";
import { EmptyState } from "@/components/ui/EmptyState";
import type { DietaryTag, Food } from "@/types";

export default function FoodsPage() {
  const [query, setQuery] = useState("");
  const [tags, setTags] = useState<DietaryTag[]>([]);
  const [selected, setSelected] = useState<Food | null>(null);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NIGERIAN_FOODS.filter((f) => {
      const matchesQuery = !q || f.name.toLowerCase().includes(q) || f.description.toLowerCase().includes(q);
      const matchesTags = tags.every((t) => f.tags.includes(t));
      return matchesQuery && matchesTags;
    });
  }, [query, tags]);

  function toggleTag(tag: DietaryTag) {
    setTags((t) => (t.includes(tag) ? t.filter((x) => x !== tag) : [...t, tag]));
  }

  return (
    <div>
      <header>
        <p className="text-xs font-medium uppercase tracking-[2px] text-ink-muted">NFCT catalogue</p>
        <h1 className="mt-1 font-display text-3xl font-extrabold text-brand-deep">Nigerian foods</h1>
        <p className="mt-2 text-ink-mid">Browse the Nigerian Food Composition Table — search and filter by diet.</p>
      </header>

      <div className="mt-6 flex flex-col gap-4">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search foods… (e.g. jollof, egusi)"
          className="mb-input max-w-md"
        />
        <div className="flex flex-wrap gap-2">
          {DIETARY_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => toggleTag(opt.key)}
              className={cx(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition",
                tags.includes(opt.key)
                  ? "border-brand-mid bg-brand-mid/10 text-brand-deep"
                  : "border-brand-pale/30 text-ink-mid hover:border-brand-mid/40"
              )}
            >
              {opt.emoji} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {results.length ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {results.map((food) => (
            <FoodCard key={food.id} food={food} onClick={() => setSelected(food)} />
          ))}
        </div>
      ) : (
        <div className="mt-6">
          <EmptyState emoji="🔍" title="No foods match" hint="Try a different search or clear some filters." />
        </div>
      )}

      <FoodDetailModal food={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
