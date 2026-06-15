from rest_framework import serializers

from apps.recommendations.models import MealPlan

from .models import Feedback


class FeedbackSerializer(serializers.ModelSerializer):
    plan_id = serializers.UUIDField(source="plan.id", read_only=True)

    class Meta:
        model = Feedback
        fields = ["id", "plan_id", "stars", "reason_chips", "comment", "created_at"]
        read_only_fields = ["id", "plan_id", "created_at"]


class FeedbackCreateSerializer(serializers.Serializer):
    plan_id = serializers.UUIDField(required=False, allow_null=True)
    stars = serializers.IntegerField(min_value=1, max_value=5)
    reason_chips = serializers.ListField(child=serializers.CharField(), required=False, default=list)
    comment = serializers.CharField(required=False, allow_blank=True, default="")

    def validate_plan_id(self, value):
        if value is None:
            return value
        user = self.context["request"].user
        if not MealPlan.objects.filter(id=value, user=user).exists():
            raise serializers.ValidationError("Plan not found.")
        return value
