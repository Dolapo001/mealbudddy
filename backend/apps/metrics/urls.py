from django.urls import path

from .views import CurrentMetricsView, DerivedMetricsView, MetricsView

metrics_urlpatterns = [
    path("metrics", MetricsView.as_view(), name="metrics"),
    path("metrics/current", CurrentMetricsView.as_view(), name="metrics-current"),
    path("metrics/derived", DerivedMetricsView.as_view(), name="metrics-derived"),
]
