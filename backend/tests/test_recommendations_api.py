import pytest

pytestmark = pytest.mark.django_db


def test_generate_requires_metrics(auth_api, seeded_foods):
    resp = auth_api.post("/api/v1/recommendations/generate", {}, format="json")
    assert resp.status_code == 400
    assert "metrics" in resp.data["detail"].lower()


def test_generate_builds_full_week(auth_api, seeded_foods, current_metrics):
    resp = auth_api.post(
        "/api/v1/recommendations/generate", {"dietary_tags": ["high_protein"]}, format="json"
    )
    assert resp.status_code == 201, resp.data
    items = resp.data["items"]
    # 7 days x 4 meal times.
    assert len(items) == 28
    assert resp.data["status"] == "active"
    assert all(0 <= i["ml_score"] <= 100 for i in items)


def test_current_plan_after_generate(auth_api, seeded_foods, current_metrics):
    auth_api.post("/api/v1/recommendations/generate", {}, format="json")
    resp = auth_api.get("/api/v1/recommendations/current")
    assert resp.status_code == 200
    assert len(resp.data["items"]) == 28


def test_generate_archives_previous_active(auth_api, seeded_foods, current_metrics):
    from apps.recommendations.models import MealPlan

    auth_api.post("/api/v1/recommendations/generate", {}, format="json")
    auth_api.post("/api/v1/recommendations/generate", {}, format="json")
    assert MealPlan.objects.filter(status="active").count() == 1
    assert MealPlan.objects.filter(status="archived").count() == 1


def test_swap_meal_item(auth_api, seeded_foods, current_metrics):
    plan = auth_api.post("/api/v1/recommendations/generate", {}, format="json").data
    item_id = plan["items"][0]["id"]
    resp = auth_api.patch(
        f"/api/v1/recommendations/items/{item_id}", {"food_slug": "suya"}, format="json"
    )
    assert resp.status_code == 200
    detail = auth_api.get(f"/api/v1/recommendations/items/{item_id}")
    assert detail.data["food"]["slug"] == "suya"


def test_cannot_read_others_plan(api, seeded_foods, current_metrics):
    from apps.accounts.models import User
    from apps.accounts.serializers import tokens_for_user
    from services.recommendation_service import RecommendationService

    plan = RecommendationService.generate(current_metrics.user)
    intruder = User.objects.create_user(email="x@y.ng", password="Sup3rSecret!")
    api.credentials(HTTP_AUTHORIZATION=f"Bearer {tokens_for_user(intruder)['access']}")
    assert api.get(f"/api/v1/recommendations/{plan.id}").status_code == 403
