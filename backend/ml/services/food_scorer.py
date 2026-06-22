"""ML-backed food scorer — production inference service.

Loaded as a singleton at first call; the server continues to function via
BaselineScorer if model artifacts are absent (e.g. before first training run).

Architecture
------------
The ML model predicts a base nutritional suitability score (0–100) from:
  [kcal, carbs_g, protein_g, fat_g, bmi_encoded, goal_encoded]

On top of this score, rule-based adjustments handle:
  - Dietary tag compliance (hard constraints that the training data cannot
    capture, as tags vary per-food and are not part of the nutritional profile)
  - Per-meal-slot calorie fit (depends on the user's daily target, not food alone)

This hybrid approach keeps the ML layer focused on what it learned well (nutrient
suitability per profile) and delegates hard constraints to transparent rules.
"""
from __future__ import annotations

import logging
import threading
from pathlib import Path

import joblib
import numpy as np

from ml.utils.features import (
    ALL_FEATURE_COLS,
    BMI_SERVICE_TO_LABEL,
    GOAL_SERVICE_TO_LABEL,
    MODEL_VERSION,
    MODELS_DIR,
    NUMERIC_FEATURES,
)

logger = logging.getLogger(__name__)

_MEAL_SHARE = {"breakfast": 0.25, "lunch": 0.35, "dinner": 0.30, "snack": 0.10}


class ModelNotReadyError(RuntimeError):
    """Raised when artifacts are missing and no fallback is available."""


class MLFoodScorer:
    """Thread-safe singleton that wraps the trained Random Forest scorer."""

    _instance: MLFoodScorer | None = None
    _lock = threading.Lock()

    def __init__(self, model, scaler, le_bmi, le_goal, version: str) -> None:
        self._model = model
        self._scaler = scaler
        self._le_bmi = le_bmi
        self._le_goal = le_goal
        self._version = version

    @classmethod
    def load(cls, models_dir: Path | None = None) -> "MLFoodScorer":
        """Return the singleton, loading artifacts on first call.

        Raises ModelNotReadyError if artifacts are not found.
        """
        if cls._instance is not None:
            return cls._instance

        with cls._lock:
            if cls._instance is not None:
                return cls._instance

            directory = models_dir or MODELS_DIR
            required = ["food_scorer.pkl", "scaler.pkl", "le_bmi.pkl", "le_goal.pkl"]
            missing = [f for f in required if not (directory / f).exists()]
            if missing:
                raise ModelNotReadyError(
                    f"ML model artifacts not found in {directory}: {missing}. "
                    "Run `python -m ml.training.train_food_scorer` to train."
                )

            version = (directory / "model_version.txt").read_text().strip()
            instance = cls(
                model=joblib.load(directory / "food_scorer.pkl"),
                scaler=joblib.load(directory / "scaler.pkl"),
                le_bmi=joblib.load(directory / "le_bmi.pkl"),
                le_goal=joblib.load(directory / "le_goal.pkl"),
                version=version,
            )
            cls._instance = instance
            logger.info("MLFoodScorer loaded from %s (version %s)", directory, version)
            return instance

    @classmethod
    def reset(cls) -> None:
        """Clear cached singleton — used in tests."""
        with cls._lock:
            cls._instance = None

    @property
    def version(self) -> str:
        return self._version

    # ── Inference ─────────────────────────────────────────────────────────────

    def score(self, food, ctx, meal_time: str) -> float:
        """Return a 0–100 suitability score for *food* given the user *ctx*.

        Parameters
        ----------
        food:      Django Food model instance (kcal, protein_g, carbs_g, fat_g, tags)
        ctx:       ScoringContext (target_kcal, protein_target_g, goal_offset_kcal,
                   dietary_tags, bmi_category, goal)
        meal_time: "breakfast" | "lunch" | "dinner" | "snack"
        """
        bmi_label = BMI_SERVICE_TO_LABEL.get(getattr(ctx, "bmi_category", ""), "")
        goal_label = GOAL_SERVICE_TO_LABEL.get(getattr(ctx, "goal", ""), "")

        if not bmi_label or not goal_label:
            # Context fields not populated — fall back to a neutral midpoint so
            # the scorer never crashes; the BaselineScorer will handle this case
            # when get_scorer() is called with an un-extended ScoringContext.
            logger.debug(
                "MLFoodScorer: missing bmi_category=%r or goal=%r; scoring at neutral 50.",
                getattr(ctx, "bmi_category", "MISSING"),
                getattr(ctx, "goal", "MISSING"),
            )
            ml_score = 50.0
        else:
            try:
                bmi_enc = int(self._le_bmi.transform([bmi_label])[0])
                goal_enc = int(self._le_goal.transform([goal_label])[0])
            except ValueError:
                logger.warning(
                    "MLFoodScorer: unknown label bmi=%r goal=%r; using neutral 50.",
                    bmi_label, goal_label,
                )
                ml_score = 50.0
            else:
                numeric = np.array(
                    [[food.kcal, food.carbs_g, food.protein_g, food.fat_g]],
                    dtype=float,
                )
                numeric_scaled = self._scaler.transform(numeric)
                features = np.concatenate(
                    [numeric_scaled, [[bmi_enc, goal_enc]]], axis=1
                )
                ml_score = float(np.clip(self._model.predict(features)[0], 0, 100))

        # ── Rule-based overlay (dietary tags + meal-slot calorie fit) ─────────
        food_tags = {t.label for t in food.tags.all()} if hasattr(food, "tags") else set()
        tag_delta = 0.0
        if ctx.dietary_tags:
            matched = ctx.dietary_tags & food_tags
            tag_delta += 6.0 * len(matched)
            for exclusive in ("vegan", "vegetarian", "halal"):
                if exclusive in ctx.dietary_tags and exclusive not in food_tags:
                    tag_delta -= 25.0

        ideal_kcal = ctx.target_kcal * _MEAL_SHARE.get(meal_time, 0.25)
        kcal_fit = 0.0
        if ideal_kcal > 0:
            kcal_fit = 15.0 * (1.0 - min(1.0, abs(food.kcal - ideal_kcal) / ideal_kcal))

        return round(float(np.clip(ml_score + tag_delta + kcal_fit, 0.0, 100.0)), 2)
