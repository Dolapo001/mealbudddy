from django.conf import settings
from django.db import models


class BodyMetric(models.Model):
    class Sex(models.TextChoices):
        MALE = "male", "Male"
        FEMALE = "female", "Female"

    class ActivityLevel(models.TextChoices):
        SEDENTARY = "sedentary", "Sedentary"
        LIGHTLY_ACTIVE = "lightly_active", "Lightly Active"
        MODERATELY_ACTIVE = "moderately_active", "Moderately Active"
        VERY_ACTIVE = "very_active", "Very Active"
        EXTREMELY_ACTIVE = "extremely_active", "Extremely Active"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="body_metrics"
    )
    age = models.PositiveSmallIntegerField()
    sex = models.CharField(max_length=10, choices=Sex.choices)
    weight_kg = models.DecimalField(max_digits=5, decimal_places=2)
    height_cm = models.DecimalField(max_digits=5, decimal_places=2)
    bmi = models.DecimalField(max_digits=5, decimal_places=2)
    bmr = models.DecimalField(max_digits=8, decimal_places=2)
    activity_level = models.CharField(max_length=30, choices=ActivityLevel.choices)
    activity_multiplier = models.DecimalField(max_digits=4, decimal_places=3)
    tdee = models.DecimalField(max_digits=8, decimal_places=2)
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "body_metrics"
        ordering = ["-recorded_at"]
        indexes = [
            models.Index(fields=["user", "-recorded_at"]),
        ]

    def __str__(self) -> str:
        return f"BodyMetric<{self.user.email} {self.recorded_at:%Y-%m-%d}>"


class HealthGoal(models.Model):
    class GoalType(models.TextChoices):
        LOSE_WEIGHT = "lose_weight", "Lose Weight"
        MAINTAIN_WEIGHT = "maintain_weight", "Maintain Weight"
        GAIN_MUSCLE = "gain_muscle", "Gain Muscle"

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="health_goals"
    )
    goal_type = models.CharField(max_length=20, choices=GoalType.choices)
    calorie_offset = models.SmallIntegerField(default=0)
    target_calories = models.PositiveSmallIntegerField()
    target_protein_g = models.PositiveSmallIntegerField()
    target_carbs_g = models.PositiveSmallIntegerField()
    target_fat_g = models.PositiveSmallIntegerField()
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    ended_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "health_goals"
        indexes = [
            models.Index(fields=["user", "is_active"]),
        ]

    def __str__(self) -> str:
        return f"HealthGoal<{self.user.email} {self.goal_type}>"
