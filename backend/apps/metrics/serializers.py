from rest_framework import serializers

from services.metrics_service import ACTIVITY_MULTIPLIERS, MetricsService

from .models import MetricProfile


class MetricProfileSerializer(serializers.ModelSerializer):
    bmi_category = serializers.SerializerMethodField()

    class Meta:
        model = MetricProfile
        fields = [
            "id",
            "age",
            "sex",
            "weight_kg",
            "height_cm",
            "activity_multiplier",
            "goal",
            "goal_offset_kcal",
            "bmi",
            "bmi_category",
            "bmr",
            "tdee",
            "target_kcal",
            "protein_target_g",
            "carb_target_g",
            "fat_target_g",
            "is_current",
            "created_at",
        ]
        read_only_fields = fields

    def get_bmi_category(self, obj) -> str:
        return MetricsService.bmi_category(obj.bmi)


class MetricProfileInputSerializer(serializers.Serializer):
    age = serializers.IntegerField(min_value=13, max_value=100)
    sex = serializers.ChoiceField(choices=MetricProfile.Sex.choices)
    weight_kg = serializers.FloatField(min_value=20, max_value=500)
    height_cm = serializers.FloatField(min_value=80, max_value=300)
    activity = serializers.ChoiceField(choices=list(ACTIVITY_MULTIPLIERS.keys()))
    goal = serializers.ChoiceField(choices=MetricProfile.Goal.choices)
