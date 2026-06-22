"""Training pipeline for the food-recommendation ML scorer.

Run from the backend/ directory:

    python -m ml.training.train_food_scorer

Artifacts are written to ml/models/ and loaded at server startup by
ml/services/food_scorer.py.

────────────────────────────────────────────────────────────────────────────────
Engineering note — why BMI classification stays rule-based
────────────────────────────────────────────────────────────────────────────────
BMI weight categories (Underweight / Normal weight / Overweight / Obese) are
WHO-defined threshold rules.  They are definitional, not probabilistic: at
exactly BMI 25.0 a person IS overweight by international medical standard.
A classifier trained to reproduce these rules would:

  • match accuracy of the four-line if/else only asymptotically
  • add scikit-learn model-load latency on every request
  • require retraining whenever WHO changes thresholds (instead of editing one
    constant)
  • be a black box where a transparent formula currently lives

The correct engineering choice is to keep MetricsService.bmi_category() as-is.
The notebook in food_recommender.ipynb uses BMI *category* as an *input feature*
for food scoring — a completely different problem — and that is what this
pipeline trains.
────────────────────────────────────────────────────────────────────────────────
"""
from __future__ import annotations

import logging
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

# Allow `python -m ml.training.train_food_scorer` from backend/
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))

from ml.utils.features import (
    ALL_FEATURE_COLS,
    BMI_LABELS,
    GOAL_LABELS,
    MODEL_VERSION,
    MODELS_DIR,
    NUMERIC_FEATURES,
    calculate_nutrition_score,
)

logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO, format="%(levelname)s  %(message)s")


# ── Data generation ───────────────────────────────────────────────────────────

def _build_training_dataframe() -> pd.DataFrame:
    """Generate labelled training rows from the seed food catalogue.

    The catalogue lives in apps/foods/seed_data.py — plain Python dicts,
    no Django setup required.
    """
    from apps.foods.seed_data import FOODS  # noqa: PLC0415

    rows: list[dict] = []
    for food in FOODS:
        for bmi_label in BMI_LABELS:
            for goal_label in GOAL_LABELS:
                score = calculate_nutrition_score(
                    kcal=food["kcal"],
                    carbs_g=food["carbs_g"],
                    protein_g=food["protein_g"],
                    fat_g=food["fat_g"],
                    bmi_label=bmi_label,
                    goal_label=goal_label,
                )
                rows.append(
                    {
                        "name": food["name"],
                        "kcal": float(food["kcal"]),
                        "carbs_g": float(food["carbs_g"]),
                        "protein_g": float(food["protein_g"]),
                        "fat_g": float(food["fat_g"]),
                        "bmi_label": bmi_label,
                        "goal_label": goal_label,
                        "score": score,
                    }
                )
    return pd.DataFrame(rows)


# ── Training ──────────────────────────────────────────────────────────────────

def train(*, test_size: float = 0.2, random_state: int = 42) -> None:
    logger.info("Building training dataset from seed food catalogue…")
    df = _build_training_dataframe()
    n_foods = df["name"].nunique()
    logger.info(
        "Dataset: %d rows  (%d foods × %d BMI categories × %d goals)",
        len(df), n_foods, len(BMI_LABELS), len(GOAL_LABELS),
    )

    # Encode categoricals with fixed label sets so inference encodes identically.
    le_bmi = LabelEncoder()
    le_goal = LabelEncoder()
    le_bmi.fit(BMI_LABELS)
    le_goal.fit(GOAL_LABELS)

    df["bmi_encoded"] = le_bmi.transform(df["bmi_label"])
    df["goal_encoded"] = le_goal.transform(df["goal_label"])

    X = df[ALL_FEATURE_COLS].values.astype(float)
    y = df["score"].values

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state
    )

    scaler = StandardScaler()
    n_numeric = len(NUMERIC_FEATURES)

    X_train_sc = X_train.copy()
    X_test_sc = X_test.copy()
    X_train_sc[:, :n_numeric] = scaler.fit_transform(X_train[:, :n_numeric])
    X_test_sc[:, :n_numeric] = scaler.transform(X_test[:, :n_numeric])

    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=2,
        random_state=random_state,
    )
    logger.info("Training RandomForestRegressor (n_estimators=100)…")
    model.fit(X_train_sc, y_train)

    y_pred = model.predict(X_test_sc)
    r2 = r2_score(y_test, y_pred)
    rmse = float(np.sqrt(mean_squared_error(y_test, y_pred)))
    logger.info("Evaluation  →  R² = %.4f  |  RMSE = %.2f", r2, rmse)

    importance_df = (
        pd.DataFrame({"feature": ALL_FEATURE_COLS, "importance": model.feature_importances_})
        .sort_values("importance", ascending=False)
    )
    logger.info("Feature importances:\n%s", importance_df.to_string(index=False))

    # Persist artifacts
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    joblib.dump(model, MODELS_DIR / "food_scorer.pkl")
    joblib.dump(scaler, MODELS_DIR / "scaler.pkl")
    joblib.dump(le_bmi, MODELS_DIR / "le_bmi.pkl")
    joblib.dump(le_goal, MODELS_DIR / "le_goal.pkl")
    (MODELS_DIR / "model_version.txt").write_text(MODEL_VERSION)
    logger.info("Artifacts saved to %s  (version %s)", MODELS_DIR, MODEL_VERSION)


if __name__ == "__main__":
    train()
