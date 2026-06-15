"""Versioned API surface: everything below is mounted under /api/v1/."""
from django.urls import path
from drf_spectacular.views import (
    SpectacularAPIView,
    SpectacularRedocView,
    SpectacularSwaggerView,
)

from apps.accounts.urls import accounts_urlpatterns, auth_urlpatterns
from apps.feedback.urls import feedback_urlpatterns
from apps.foods.urls import foods_urlpatterns
from apps.metrics.urls import metrics_urlpatterns
from apps.recommendations.urls import recommendations_urlpatterns

schema_urlpatterns = [
    path("schema", SpectacularAPIView.as_view(), name="schema"),
    path("docs", SpectacularSwaggerView.as_view(url_name="schema"), name="swagger-ui"),
    path("redoc", SpectacularRedocView.as_view(url_name="schema"), name="redoc"),
]

urlpatterns = (
    auth_urlpatterns
    + accounts_urlpatterns
    + metrics_urlpatterns
    + foods_urlpatterns
    + recommendations_urlpatterns
    + feedback_urlpatterns
    + schema_urlpatterns
)
