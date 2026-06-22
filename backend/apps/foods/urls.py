from django.urls import path
from .views import BowenFoodListView, FoodItemListView
foods_urlpatterns = [
    path('foods/bowen/', BowenFoodListView.as_view()),
    path('foods/items/', FoodItemListView.as_view()),
]
