import uuid

from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.recommendations.models import Recommendation


class Feedback(models.Model):
    """A user's rating of a recommendation. Feeds the eventual retraining signal."""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="feedback"
    )
    recommendation = models.ForeignKey(
        Recommendation, on_delete=models.CASCADE, related_name="feedback"
    )
    star_rating = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    feedback_tags = models.JSONField(default=list, blank=True)
    comments = models.TextField(blank=True)
    used_for_retraining = models.BooleanField(default=False)
    submitted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "feedback"
        indexes = [
            models.Index(fields=["used_for_retraining", "submitted_at"]),
        ]

    def __str__(self) -> str:
        return f"Feedback<{self.user.email} {self.star_rating}★>"
