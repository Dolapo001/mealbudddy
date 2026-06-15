from django.conf import settings
from django.db import models

from core.models import SoftDeleteModel


class MetricProfile(SoftDeleteModel):
    """A snapshot of a user's body metrics plus the server-computed
    derivations. Keeping history (rather than mutating one row) makes
    recommendations reproducible and auditable (blueprint B.4)."""

    class Sex(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"

    class Goal(models.TextChoices):
        LOSE = "lose", "Lose weight"
        MAINTAIN = "maintain", "Maintain"
        GAIN_MUSCLE = "gain_muscle", "Gain muscle"
        GAIN_WEIGHT = "gain_weight", "Gain weight"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="metric_profiles"
    )
    age = models.PositiveSmallIntegerField()
    sex = models.CharField(max_length=10, choices=Sex.choices)
    weight_kg = models.FloatField()
    height_cm = models.FloatField()
    activity_multiplier = models.FloatField(default=1.2)
    goal = models.CharField(max_length=20, choices=Goal.choices, default=Goal.MAINTAIN)
    goal_offset_kcal = models.IntegerField(default=0)

    # Server-computed derivations (stored for auditability).
    bmi = models.FloatField()
    bmr = models.IntegerField()
    tdee = models.IntegerField()
    target_kcal = models.IntegerField()
    protein_target_g = models.IntegerField()
    carb_target_g = models.IntegerField()
    fat_target_g = models.IntegerField()

    is_current = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [models.Index(fields=["user", "is_current"])]

    def __str__(self) -> str:
        return f"Metrics<{self.user.email} {self.created_at:%Y-%m-%d}>"
