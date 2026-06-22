from rest_framework import serializers
from .models import FoodItem, BowenFood
class FoodItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = FoodItem
        fields = '__all__'
class BowenFoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = BowenFood
        fields = '__all__'
