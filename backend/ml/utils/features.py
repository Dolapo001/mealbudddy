"""Shared constants, label maps, and scoring heuristic for the food scorer model.

This module has zero Django dependencies so it can be imported by both the
standalone training script and the Django inference service without a running
application context.
"""
from __future__ import annotations

import os
from pathlib import Path

import numpy as np

# ── Canonical label sets (must be identical in training and inference) ────────

BMI_LABELS = ["Normal_weight", "Obese", "Overweight", "Underweight"]
GOAL_LABELS = ["Gain_Muscle", "Gain_weight", "Lose_weight", "Maintain"]

# MetricsService.bmi_category() returns these strings; map them to training labels.
BMI_SERVICE_TO_LABEL: dict[str, str] = {
    "Underweight": "Underweight",
    "Normal weight": "Normal_weight",
    "Overweight": "Overweight",
    "Obese": "Obese",
}

# MetricProfile.goal values → training labels
GOAL_SERVICE_TO_LABEL: dict[str, str] = {
    "lose": "Lose_weight",
    "maintain": "Maintain",
    "gain_muscle": "Gain_Muscle",
    "gain_weight": "Gain_weight",
}

NUMERIC_FEATURES: list[str] = ["kcal", "carbs_g", "protein_g", "fat_g"]
ALL_FEATURE_COLS: list[str] = NUMERIC_FEATURES + ["bmi_encoded", "goal_encoded"]

_DEFAULT_MODELS_DIR = Path(__file__).resolve().parents[2] / "ml" / "models"
MODELS_DIR: Path = Path(os.environ.get("ML_MODELS_DIR", str(_DEFAULT_MODELS_DIR)))

MODEL_VERSION = "1"


# ── Scoring heuristic ─────────────────────────────────────────────────────────

def calculate_nutrition_score(
    kcal: float,
    carbs_g: float,
    protein_g: float,
    fat_g: float,
    bmi_label: str,
    goal_label: str,
) -> float:
    """Heuristic suitability score (0–100) adapted from the notebook analysis.

    The original notebook uses Fibre (g) as a feature; that field is absent from
    the food catalogue so fat_g is used in low-fat bonus rules instead. Feature
    importance for fiber was 2.2 % in the notebook — the impact is negligible.
    """
    score = 50.0

    # BMI-based adjustments
    if bmi_label == "Underweight":
        score += (kcal / 50) * 2
        score += protein_g * 1.5
        if kcal > 300:
            score += 10

    elif bmi_label == "Overweight":
        score += protein_g * 2.5
        score -= kcal / 30
        if kcal < 150:
            score += 10

    elif bmi_label == "Obese":
        score += protein_g * 3
        score -= kcal / 20
        if kcal < 120:
            score += 15
        if fat_g < 5:
            score += 5

    elif bmi_label == "Normal_weight":
        score += protein_g * 1.5
        score += kcal / 100

    # Goal-based adjustments
    if goal_label == "Lose_weight":
        score -= kcal / 25
        score += protein_g * 3
        if carbs_g > 30 and kcal > 200:
            score -= 10

    elif goal_label == "Gain_Muscle":
        score += protein_g * 4
        score += kcal / 150
        if protein_g > 20:
            score += 10
        if carbs_g > 40:
            score -= 5

    elif goal_label == "Gain_weight":
        score += kcal / 40
        score += protein_g * 1.5
        score += carbs_g * 0.5
        if kcal > 300:
            score += 15

    elif goal_label == "Maintain":
        score += protein_g * 1.2
        score += kcal / 200
        if 150 <= kcal <= 250:
            score += 5

    return float(np.clip(score, 0, 100))
