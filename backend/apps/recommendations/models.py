import uuid

from django.conf import settings
from django.db import models

from apps.foods.models import Food
from core.models import SoftDeleteModel


class MealPlan(SoftDeleteModel):
    class Status(models.TextChoices):
        ACTIVE = "active", "Active"
        ARCHIVED = "archived", "Archived"
        PENDING = "pending", "Pending"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_plans"
    )
    week_start = models.DateField()
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.ACTIVE)
    # Snapshot of the targets the plan was generated against (auditability).
    target_kcal = models.IntegerField(default=0)
    goal = models.CharField(max_length=20, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "status"])]

    def __str__(self) -> str:
        return f"MealPlan<{self.user.email} {self.week_start}>"


class MealPlanItem(models.Model):
    class Day(models.TextChoices):
        MON = "mon", "Monday"
        TUE = "tue", "Tuesday"
        WED = "wed", "Wednesday"
        THU = "thu", "Thursday"
        FRI = "fri", "Friday"
        SAT = "sat", "Saturday"
        SUN = "sun", "Sunday"

    class MealTime(models.TextChoices):
        BREAKFAST = "breakfast", "Breakfast"
        LUNCH = "lunch", "Lunch"
        DINNER = "dinner", "Dinner"
        SNACK = "snack", "Snack"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name="items")
    food = models.ForeignKey(Food, on_delete=models.PROTECT, related_name="plan_items")
    day = models.CharField(max_length=3, choices=Day.choices)
    meal_time = models.CharField(max_length=12, choices=MealTime.choices)
    ml_score = models.FloatField(default=0)
    servings = models.FloatField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["day", "meal_time"]

    def __str__(self) -> str:
        return f"{self.day}/{self.meal_time}: {self.food.name}"
