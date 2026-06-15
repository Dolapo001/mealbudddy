"""Pluggable ML scorer adapter.

The blueprint treats the recommender as a pluggable service: a transparent
baseline scorer ships first, and the trained KNN/Random-Forest artifact can be
loaded later WITHOUT changing the API. Both implement `MealScorer`.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Protocol


@dataclass
class ScoringContext:
    target_kcal: int
    protein_target_g: int
    goal_offset_kcal: int
    dietary_tags: frozenset[str]


class MealScorer(Protocol):
    def score(self, food, ctx: ScoringContext, meal_time: str) -> float: ...


class BaselineScorer:
    """Transparent rules/heuristic scorer (0–100).

    Rewards: matching dietary tags, protein density for muscle/weight goals,
    and a per-meal calorie fit against the daily target. Penalises foods that
    violate a hard dietary preference. Deterministic and explainable — easy to
    swap for the trained model once its artifact is available.
    """

    # Rough share of the daily calorie target per meal slot.
    MEAL_SHARE = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10}

    def score(self, food, ctx: ScoringContext, meal_time: str) -> float:
        score = 50.0
        food_tags = {t.label for t in food.tags.all()} if hasattr(food, "tags") else set()

        # Hard dietary match: every chosen preference the food satisfies is a win.
        if ctx.dietary_tags:
            matched = ctx.dietary_tags & food_tags
            score += 8 * len(matched)
            # If the user asked for vegan/vegetarian and the food lacks it, drop hard.
            for exclusive in ("vegan", "vegetarian", "halal"):
                if exclusive in ctx.dietary_tags and exclusive not in food_tags:
                    score -= 25

        # Protein emphasis for muscle/weight-gain goals.
        if ctx.goal_offset_kcal > 0:
            score += min(20, food.protein_g * 0.6)
        elif ctx.goal_offset_kcal < 0:
            # Cutting: reward lower energy density.
            score += max(-15, (400 - food.kcal) * 0.03)

        # Calorie fit for this meal slot.
        ideal = ctx.target_kcal * self.MEAL_SHARE.get(meal_time, 0.25)
        if ideal > 0:
            fit = 1 - min(1.0, abs(food.kcal - ideal) / ideal)
            score += 20 * fit

        return round(max(0.0, min(100.0, score)), 2)


def get_scorer() -> MealScorer:
    """Factory — returns the active scorer. Swap here when the trained model
    artifact is ready (e.g. read a path from settings and load it once)."""
    return BaselineScorer()
