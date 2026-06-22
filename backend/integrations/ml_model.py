"""Pluggable ML scorer adapter.

The blueprint treats the recommender as a pluggable service: a transparent
baseline scorer ships first, and the trained Random Forest artifact can be
loaded later WITHOUT changing the API. Both implement `MealScorer`.

Scorer resolution order (get_scorer):
  1. MLFoodScorer  — loaded from ml/models/ if artifacts exist
  2. BaselineScorer — fallback when model has not been trained yet
"""
from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Protocol

logger = logging.getLogger(__name__)


@dataclass
class ScoringContext:
    target_kcal: int
    protein_target_g: int
    goal_offset_kcal: int
    dietary_tags: frozenset[str]
    # Added to support ML food scorer (populated by RecommendationService).
    bmi_category: str = field(default="")
    goal: str = field(default="")


class MealScorer(Protocol):
    def score(self, food, ctx: ScoringContext, meal_time: str) -> float: ...


class BaselineScorer:
    """Transparent rules/heuristic scorer (0–100).

    Rewards: matching dietary tags, protein density for muscle/weight goals,
    and a per-meal calorie fit against the daily target. Penalises foods that
    violate a hard dietary preference. Deterministic and explainable — used as
    the fallback when the ML model artifact is not yet available.
    """

    MEAL_SHARE = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10}

    def score(self, food, ctx: ScoringContext, meal_time: str) -> float:
        score = 50.0
        food_tags = {t.label for t in food.tags.all()} if hasattr(food, "tags") else set()

        if ctx.dietary_tags:
            matched = ctx.dietary_tags & food_tags
            score += 8 * len(matched)
            for exclusive in ("vegan", "vegetarian", "halal"):
                if exclusive in ctx.dietary_tags and exclusive not in food_tags:
                    score -= 25

        if ctx.goal_offset_kcal > 0:
            score += min(20, food.protein_g * 0.6)
        elif ctx.goal_offset_kcal < 0:
            score += max(-15, (400 - food.kcal) * 0.03)

        ideal = ctx.target_kcal * self.MEAL_SHARE.get(meal_time, 0.25)
        if ideal > 0:
            fit = 1 - min(1.0, abs(food.kcal - ideal) / ideal)
            score += 20 * fit

        return round(max(0.0, min(100.0, score)), 2)


def get_scorer() -> MealScorer:
    """Return the active scorer.

    Attempts to load the trained MLFoodScorer from ml/models/.  Falls back to
    BaselineScorer gracefully if the artifacts have not been generated yet —
    run `python -m ml.training.train_food_scorer` from backend/ to train.
    """
    try:
        from ml.services.food_scorer import MLFoodScorer, ModelNotReadyError  # noqa: PLC0415

        return MLFoodScorer.load()
    except ModuleNotFoundError:
        logger.debug("ml package not importable; using BaselineScorer.")
    except Exception as exc:  # ModelNotReadyError or any load failure
        logger.info("ML scorer not available (%s); using BaselineScorer.", exc)

    return BaselineScorer()
