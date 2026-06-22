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

    def score(self, bowen_food, ctx: ScoringContext, meal_time: str) -> float:
        score = 50.0

        if "vegetarian" in ctx.dietary_tags and not bowen_food.is_vegetarian:
            score -= 50
        if "no_pork" in ctx.dietary_tags and bowen_food.contains_pork:
            score -= 50
        if "no_fish" in ctx.dietary_tags and bowen_food.contains_fish:
            score -= 50
        if "gluten_free" in ctx.dietary_tags and bowen_food.contains_gluten:
            score -= 50
        if "lactose_free" in ctx.dietary_tags and bowen_food.contains_lactose:
            score -= 50
        if "nut_allergy" in ctx.dietary_tags and bowen_food.contains_nuts:
            score -= 50

        nfct = bowen_food.nfct_food
        if not nfct:
            return 0.0

        if ctx.goal_offset_kcal > 0:
            score += min(20, float(nfct.protein_g) * 0.6)
        elif ctx.goal_offset_kcal < 0:
            score += max(-15, (400 - float(nfct.energy_kcal)) * 0.03)

        ideal = ctx.target_kcal * self.MEAL_SHARE.get(meal_time, 0.25)
        if ideal > 0:
            fit = 1 - min(1.0, abs(float(nfct.energy_kcal) - ideal) / ideal)
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
