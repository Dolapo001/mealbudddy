import pytest

pytestmark = pytest.mark.django_db


def test_submit_feedback(auth_api, seeded_foods, current_metrics):
    plan = auth_api.post("/api/v1/recommendations/generate", {}, format="json").data
    resp = auth_api.post(
        "/api/v1/feedback",
        {"plan_id": plan["id"], "stars": 5, "reason_chips": ["tasty", "filling"], "comment": "Great!"},
        format="json",
    )
    assert resp.status_code == 201, resp.data
    assert resp.data["stars"] == 5
    assert resp.data["reason_chips"] == ["tasty", "filling"]


def test_feedback_rejects_invalid_stars(auth_api):
    resp = auth_api.post("/api/v1/feedback", {"stars": 9}, format="json")
    assert resp.status_code == 400


def test_my_feedback_list(auth_api):
    auth_api.post("/api/v1/feedback", {"stars": 4}, format="json")
    resp = auth_api.get("/api/v1/feedback/mine")
    assert resp.status_code == 200
    assert resp.data["count"] == 1
