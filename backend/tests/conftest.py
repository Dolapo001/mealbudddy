import pytest
from rest_framework.test import APIClient

from apps.accounts.models import User


@pytest.fixture
def api():
    return APIClient()


@pytest.fixture
def user(db):
    return User.objects.create_user(
        email="david@university.edu.ng",
        password="Sup3rSecret!",
        student_id="BU/22/CSC/0001",
        is_email_verified=True,
    )


@pytest.fixture
def auth_api(api, user):
    from apps.accounts.serializers import tokens_for_user

    tokens = tokens_for_user(user)
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens['access']}")
    return api


@pytest.fixture
def seeded_foods(db):
    from django.core.management import call_command

    call_command("seed_foods")


@pytest.fixture
def current_metrics(db, user):
    from apps.metrics.models import MetricProfile
    from services.metrics_service import MetricsService

    d = MetricsService.derive(
        weight_kg=72, height_cm=178, age=22, sex="male", activity="moderate", goal="gain_muscle"
    )
    return MetricProfile.objects.create(
        user=user, age=22, sex="male", weight_kg=72, height_cm=178,
        activity_multiplier=1.55, goal="gain_muscle", goal_offset_kcal=d.goal_offset_kcal,
        bmi=d.bmi, bmr=d.bmr, tdee=d.tdee, target_kcal=d.target_kcal,
        protein_target_g=d.protein_target_g, carb_target_g=d.carb_target_g,
        fat_target_g=d.fat_target_g, is_current=True,
    )
