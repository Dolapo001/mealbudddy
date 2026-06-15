"""RecommendationService — generates a weekly meal plan by scoring NFCT foods
against the user's current metrics, goal and dietary preferences.

The scorer is pluggable (integrations.ml_model): a transparent baseline ships
now; the trained KNN/Random-Forest artifact can replace it without touching
this service or the API.
"""
from __future__ import annotations

from datetime import date, timedelta

from django.db import transaction

from apps.foods.models import Food
from apps.metrics.models import MetricProfile
from apps.recommendations.models import MealPlan, MealPlanItem
from integrations.ml_model import ScoringContext, get_scorer

DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
MEAL_TIMES = ["breakfast", "lunch", "dinner", "snack"]


class RecommendationError(Exception):
    pass


class RecommendationService:
    @staticmethod
    def _week_start(today: date | None = None) -> date:
        today = today or date.today()
        return today - timedelta(days=today.weekday())

    @classmethod
    @transaction.atomic
    def generate(cls, user, dietary_tags: list[str] | None = None) -> MealPlan:
        metrics = MetricProfile.objects.filter(user=user, is_current=True).first()
        if not metrics:
            raise RecommendationError("Add your body metrics before generating a plan.")

        dietary = frozenset(dietary_tags or [])
        ctx = ScoringContext(
            target_kcal=metrics.target_kcal,
            protein_target_g=metrics.protein_target_g,
            goal_offset_kcal=metrics.goal_offset_kcal,
            dietary_tags=dietary,
        )
        scorer = get_scorer()
        foods = list(Food.objects.prefetch_related("tags").all())
        if not foods:
            raise RecommendationError("The food catalogue is empty — seed it first.")

        # Archive any existing active plans for this user.
        MealPlan.objects.filter(user=user, status=MealPlan.Status.ACTIVE).update(
            status=MealPlan.Status.ARCHIVED
        )

        plan = MealPlan.objects.create(
            user=user,
            week_start=cls._week_start(),
            status=MealPlan.Status.ACTIVE,
            target_kcal=metrics.target_kcal,
            goal=metrics.goal,
        )

        # Pre-rank foods per meal slot once; rotate through the ranking across
        # days so the week has variety without re-scoring 28 times.
        ranked: dict[str, list[tuple[Food, float]]] = {}
        for meal_time in MEAL_TIMES:
            scored = sorted(
                ((f, scorer.score(f, ctx, meal_time)) for f in foods),
                key=lambda pair: pair[1],
                reverse=True,
            )
            ranked[meal_time] = scored

        items = []
        for di, day in enumerate(DAYS):
            for meal_time in MEAL_TIMES:
                pool = ranked[meal_time]
                # Take from the top of the ranking, rotating by day for variety.
                food, score = pool[di % len(pool)]
                items.append(
                    MealPlanItem(
                        plan=plan,
                        food=food,
                        day=day,
                        meal_time=meal_time,
                        ml_score=score,
                        servings=1,
                    )
                )
        MealPlanItem.objects.bulk_create(items)
        return plan

    @classmethod
    def regenerate(cls, user, plan: MealPlan, dietary_tags: list[str] | None = None) -> MealPlan:
        return cls.generate(user, dietary_tags=dietary_tags)
