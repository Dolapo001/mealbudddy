"""MetricsService — server-side BMI / BMR / TDEE / macro derivation.

This mirrors the frontend `lib/calc.ts` exactly (Mifflin–St Jeor) so the
client preview and the authoritative server result always agree. The server
value is the one of record; the client number is never trusted (security I).
"""
from __future__ import annotations

from dataclasses import dataclass

ACTIVITY_MULTIPLIERS = {
    "sedentary": 1.2,
    "light": 1.375,
    "moderate": 1.55,
    "active": 1.725,
    "very_active": 1.9,
}

GOAL_OFFSETS = {
    "lose": -500,
    "maintain": 0,
    "gain_muscle": 300,
    "gain_weight": 500,
}

MIN_TARGET_KCAL = 1200


@dataclass(frozen=True)
class Derived:
    bmi: float
    bmr: int
    tdee: int
    target_kcal: int
    protein_target_g: int
    carb_target_g: int
    fat_target_g: int
    goal_offset_kcal: int


class MetricsService:
    @staticmethod
    def bmi(weight_kg: float, height_cm: float) -> float:
        h_m = height_cm / 100
        return round(weight_kg / (h_m * h_m), 1)

    @staticmethod
    def bmr(weight_kg: float, height_cm: float, age: int, sex: str) -> int:
        base = 10 * weight_kg + 6.25 * height_cm - 5 * age
        return round(base + 5 if sex == "male" else base - 161)

    @staticmethod
    def bmi_category(value: float) -> str:
        """Return the WHO-defined BMI weight category for *value*.

        Rule-based classification is intentionally kept here instead of an ML
        model.  BMI categories are international medical thresholds (WHO, 2000),
        not a distribution to learn: the four boundaries are fixed constants,
        not patterns.  An ML classifier trained to reproduce them would add
        latency and opacity for zero accuracy gain over this O(1) lookup.

        The ML model in ml/services/food_scorer.py uses the *result* of this
        function as an input feature for food-recommendation scoring — a
        separate and genuinely non-linear problem where ML adds real value.
        """
        if value < 18.5:
            return "Underweight"
        if value < 25:
            return "Normal weight"
        if value < 30:
            return "Overweight"
        return "Obese"

    @classmethod
    def derive(
        cls, *, weight_kg: float, height_cm: float, age: int, sex: str, activity: str, goal: str
    ) -> Derived:
        multiplier = ACTIVITY_MULTIPLIERS.get(activity, 1.2)
        offset = GOAL_OFFSETS.get(goal, 0)

        bmr = cls.bmr(weight_kg, height_cm, age, sex)
        tdee = round(bmr * multiplier)
        target = max(MIN_TARGET_KCAL, tdee + offset)

        # Macro split: protein scaled to bodyweight (higher for surplus goals),
        # carbs ~50% of energy, fat the remainder.
        protein_g = round(weight_kg * (2.0 if offset > 0 else 1.6))
        carb_g = round((target * 0.5) / 4)
        fat_kcal = max(0, target - (protein_g * 4 + carb_g * 4))
        fat_g = round(fat_kcal / 9)

        return Derived(
            bmi=cls.bmi(weight_kg, height_cm),
            bmr=bmr,
            tdee=tdee,
            target_kcal=target,
            protein_target_g=protein_g,
            carb_target_g=carb_g,
            fat_target_g=fat_g,
            goal_offset_kcal=offset,
        )

    @staticmethod
    def activity_multiplier(activity: str) -> float:
        return ACTIVITY_MULTIPLIERS.get(activity, 1.2)
