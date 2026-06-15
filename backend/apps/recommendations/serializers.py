from rest_framework import serializers

from apps.foods.serializers import FoodSerializer

from .models import MealPlan, MealPlanItem


class MealPlanItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)

    class Meta:
        model = MealPlanItem
        fields = ["id", "day", "meal_time", "ml_score", "servings", "food"]


class MealPlanItemUpdateSerializer(serializers.ModelSerializer):
    # Swap a meal by pointing the item at a different food (by slug).
    food_slug = serializers.SlugField(write_only=True, required=False)

    class Meta:
        model = MealPlanItem
        fields = ["servings", "food_slug"]

    def update(self, instance, validated_data):
        slug = validated_data.pop("food_slug", None)
        if slug:
            from apps.foods.models import Food

            instance.food = Food.objects.get(slug=slug)
        return super().update(instance, validated_data)


class MealPlanSerializer(serializers.ModelSerializer):
    items = MealPlanItemSerializer(many=True, read_only=True)

    class Meta:
        model = MealPlan
        fields = ["id", "week_start", "status", "target_kcal", "goal", "items", "created_at"]


class GenerateRequestSerializer(serializers.Serializer):
    dietary_tags = serializers.ListField(
        child=serializers.SlugField(), required=False, default=list
    )
    async_mode = serializers.BooleanField(required=False, default=False)
