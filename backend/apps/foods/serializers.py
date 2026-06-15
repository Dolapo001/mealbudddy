from rest_framework import serializers

from .models import DietaryTag, Food


class DietaryTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = DietaryTag
        fields = ["id", "key", "label"]


class FoodSerializer(serializers.ModelSerializer):
    tags = serializers.SerializerMethodField()
    macros = serializers.SerializerMethodField()

    class Meta:
        model = Food
        fields = [
            "id",
            "slug",
            "name",
            "nfct_code",
            "origin",
            "emoji",
            "description",
            "serving_size",
            "kcal",
            "macros",
            "tags",
        ]

    def get_tags(self, obj) -> list[str]:
        return [t.key for t in obj.tags.all()]

    def get_macros(self, obj) -> dict:
        return {"protein": obj.protein_g, "carbs": obj.carbs_g, "fat": obj.fat_g}
