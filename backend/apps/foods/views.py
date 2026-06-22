from rest_framework import generics
from .models import FoodItem, BowenFood
from .serializers import FoodItemSerializer, BowenFoodSerializer
class FoodItemListView(generics.ListAPIView):
    queryset = FoodItem.objects.all()
    serializer_class = FoodItemSerializer
class BowenFoodListView(generics.ListAPIView):
    queryset = BowenFood.objects.all()
    serializer_class = BowenFoodSerializer
