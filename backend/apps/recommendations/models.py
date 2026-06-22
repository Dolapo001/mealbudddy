import uuid

from django.conf import settings
from django.db import models


class MLModel(models.Model):
    class Algorithm(models.TextChoices):
        KNN = "KNN", "KNN"
        RANDOM_FOREST = "RandomForest", "RandomForest"
        ENSEMBLE = "Ensemble", "Ensemble"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    model_name = models.CharField(max_length=50)
    model_version = models.CharField(max_length=20)
    algorithm = models.CharField(max_length=20, choices=Algorithm.choices)
    description = models.TextField(null=True, blank=True)
    feature_list = models.JSONField(null=True, blank=True)
    hyperparameters = models.JSONField(null=True, blank=True)
    accuracy_score = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    f1_score = models.DecimalField(max_digits=5, decimal_places=4, null=True, blank=True)
    trained_at = models.DateTimeField(auto_now_add=True)
    model_file_path = models.CharField(max_length=255, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "ml_models"
        indexes = [
            models.Index(fields=["model_name", "is_active"]),
        ]

    def __str__(self):
        return f"{self.model_name} ({self.algorithm})"


class Recommendation(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="recommendations")
    body_metric = models.ForeignKey("metrics.BodyMetric", on_delete=models.CASCADE)
    health_goal = models.ForeignKey("metrics.HealthGoal", on_delete=models.CASCADE)
    knn_model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True, related_name="+")
    rf_model = models.ForeignKey(MLModel, on_delete=models.SET_NULL, null=True, related_name="+")
    knn_neighbours_used = models.PositiveSmallIntegerField(default=5)
    total_foods_scored = models.PositiveSmallIntegerField()
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "recommendations"
        indexes = [
            models.Index(fields=["user", "-generated_at"]),
        ]


class RecommendationItem(models.Model):
    class MealTime(models.TextChoices):
        BREAKFAST = "breakfast", "Breakfast"
        LUNCH = "lunch", "Lunch"
        DINNER = "dinner", "Dinner"
        SNACK = "snack", "Snack"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recommendation = models.ForeignKey(Recommendation, on_delete=models.CASCADE, related_name="items")
    bowen_food = models.ForeignKey("foods.BowenFood", on_delete=models.CASCADE)
    meal_time = models.CharField(max_length=20, choices=MealTime.choices)
    rank_position = models.PositiveSmallIntegerField()
    rf_score = models.DecimalField(max_digits=5, decimal_places=2)
    knn_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    ensemble_score = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    serving_g = models.PositiveSmallIntegerField()
    estimated_kcal = models.DecimalField(max_digits=7, decimal_places=2)
    estimated_protein_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    estimated_carbs_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    estimated_fat_g = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)

    class Meta:
        db_table = "recommendation_items"
        indexes = [
            models.Index(fields=["recommendation", "meal_time", "rank_position"]),
            models.Index(fields=["bowen_food"]),
        ]


class MealPlan(models.Model):
    class DayOfWeek(models.TextChoices):
        MONDAY = "monday", "Monday"
        TUESDAY = "tuesday", "Tuesday"
        WEDNESDAY = "wednesday", "Wednesday"
        THURSDAY = "thursday", "Thursday"
        FRIDAY = "friday", "Friday"
        SATURDAY = "saturday", "Saturday"
        SUNDAY = "sunday", "Sunday"

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="meal_plans")
    plan_name = models.CharField(max_length=100, default="My meal plan")
    day_of_week = models.CharField(max_length=10, choices=DayOfWeek.choices)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meal_plans"
        indexes = [
            models.Index(fields=["user", "day_of_week"]),
        ]


class MealPlanItem(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    plan = models.ForeignKey(MealPlan, on_delete=models.CASCADE, related_name="items")
    recommendation_item = models.ForeignKey(RecommendationItem, on_delete=models.CASCADE)
    bowen_food = models.ForeignKey("foods.BowenFood", on_delete=models.CASCADE)
    meal_time = models.CharField(max_length=20, choices=RecommendationItem.MealTime.choices)
    serving_g = models.PositiveSmallIntegerField()
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "meal_plan_items"
        indexes = [
            models.Index(fields=["plan", "meal_time"]),
        ]
