from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.recommendations.models import MealPlan
from core.models import TimeStampedModel


class Feedback(TimeStampedModel):
    """A user's rating of a meal plan. Feeds the eventual retraining signal."""

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback"
    )
    plan = models.ForeignKey(
        MealPlan, on_delete=models.CASCADE, related_name="feedback", null=True, blank=True
    )
    stars = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    reason_chips = models.JSONField(default=list, blank=True)
    comment = models.TextField(blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"Feedback<{self.user.email} {self.stars}★>"
