from django.urls import path

from .views import (
    CurrentPlanView,
    GenerateView,
    PlanDetailView,
    PlanItemView,
    PlanRefreshView,
)

recommendations_urlpatterns = [
    path("recommendations/generate", GenerateView.as_view(), name="recs-generate"),
    path("recommendations/current", CurrentPlanView.as_view(), name="recs-current"),
    path("recommendations/items/<uuid:item_id>", PlanItemView.as_view(), name="recs-item"),
    path("recommendations/<uuid:plan_id>", PlanDetailView.as_view(), name="recs-detail"),
    path("recommendations/<uuid:plan_id>/refresh", PlanRefreshView.as_view(), name="recs-refresh"),
]
