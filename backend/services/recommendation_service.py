"""RecommendationService — generates a weekly meal plan by scoring NFCT foods
against the user's current metrics, goal and dietary preferences.

The scorer is pluggable (integrations.ml_model): a transparent baseline ships
now; the trained KNN/Random-Forest artifact can replace it without touching
this service or the API.
"""
from __future__ import annotations

from datetime import date, timedelta

from django.db import transaction

from apps.foods.models import BowenFood
from apps.metrics.models import BodyMetric, HealthGoal
from apps.accounts.models import DietaryPreference
from apps.recommendations.models import Recommendation, RecommendationItem, MealPlan, MealPlanItem
from integrations.ml_model import ScoringContext, get_scorer
from services.metrics_service import MetricsService

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
        metrics = BodyMetric.objects.filter(user=user).order_by("-recorded_at").first()
        goal = HealthGoal.objects.filter(user=user, is_active=True).first()
        if not metrics or not goal:
            raise RecommendationError("Add your body metrics and goal before generating a plan.")

        prefs = DietaryPreference.objects.filter(user=user).values_list("preference_tag", flat=True)
        dietary = frozenset(list(prefs) + (dietary_tags or []))
        
        ctx = ScoringContext(
            target_kcal=goal.target_calories,
            protein_target_g=goal.target_protein_g,
            goal_offset_kcal=goal.calorie_offset,
            dietary_tags=dietary,
            bmi_category=MetricsService.bmi_category(metrics.bmi),
            goal=goal.goal_type,
        )
        scorer = get_scorer()
        foods = list(BowenFood.objects.select_related("nfct_food").filter(is_available=True))
        if not foods:
            raise RecommendationError("The food catalogue is empty — seed it first.")

        recommendation = Recommendation.objects.create(
            user=user,
            body_metric=metrics,
            health_goal=goal,
            total_foods_scored=len(foods)
        )

        # Pre-rank foods per meal slot once; rotate through the ranking across
        # days so the week has variety without re-scoring 28 times.
        ranked: dict[str, list[tuple[BowenFood, float]]] = {}
        for meal_time in MEAL_TIMES:
            # Only consider foods appropriate for this meal_time
            valid_foods = [f for f in foods if meal_time in f.meal_time]
            if not valid_foods:
                valid_foods = foods
            
            scored = sorted(
                ((f, scorer.score(f, ctx, meal_time)) for f in valid_foods),
                key=lambda pair: pair[1],
                reverse=True,
            )
            ranked[meal_time] = scored
            
            # Save top 5 for each meal time as recommendation items
            top_items = []
            for rank_pos, (food, score) in enumerate(scored[:5], start=1):
                top_items.append(
                    RecommendationItem(
                        recommendation=recommendation,
                        bowen_food=food,
                        meal_time=meal_time,
                        rank_position=rank_pos,
                        rf_score=score,
                        serving_g=100,  # default
                        estimated_kcal=food.nfct_food.energy_kcal if food.nfct_food else 0,
                        estimated_protein_g=food.nfct_food.protein_g if food.nfct_food else 0,
                        estimated_carbs_g=food.nfct_food.carbohydrate_g if food.nfct_food else 0,
                        estimated_fat_g=food.nfct_food.fat_g if food.nfct_food else 0,
                    )
                )
            RecommendationItem.objects.bulk_create(top_items)

        # Archive any existing active plans for this user.
        MealPlan.objects.filter(user=user, is_active=True).update(is_active=False)

        plan = MealPlan.objects.create(
            user=user,
            day_of_week=cls._week_start().strftime('%A').lower(),
            is_active=True
        )

        items = []
        for di, day in enumerate(DAYS):
            for meal_time in MEAL_TIMES:
                pool = ranked[meal_time]
                if not pool:
                    continue
                food, score = pool[di % len(pool)]
                
                # Fetch corresponding recommendation item
                rec_item = RecommendationItem.objects.filter(
                    recommendation=recommendation, bowen_food=food, meal_time=meal_time
                ).first()
                if not rec_item:
                    # Fallback to the top recommendation for that meal slot
                    rec_item = RecommendationItem.objects.filter(
                        recommendation=recommendation, meal_time=meal_time
                    ).first()

                items.append(
                    MealPlanItem(
                        plan=plan,
                        recommendation_item=rec_item,
                        bowen_food=food,
                        meal_time=meal_time,
                        serving_g=100,
                    )
                )
        MealPlanItem.objects.bulk_create(items)
        return plan

    @classmethod
    def regenerate(cls, user, plan: MealPlan, dietary_tags: list[str] | None = None) -> MealPlan:
        return cls.generate(user, dietary_tags=dietary_tags)
