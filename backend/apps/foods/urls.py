from django.urls import path

from .views import FoodDetailView, FoodListView, FoodTagsView

foods_urlpatterns = [
    path("foods", FoodListView.as_view(), name="foods"),
    path("foods/tags", FoodTagsView.as_view(), name="foods-tags"),
    path("foods/<slug:slug>", FoodDetailView.as_view(), name="foods-detail"),
]
