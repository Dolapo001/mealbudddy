import pytest

pytestmark = pytest.mark.django_db

PAYLOAD = {
    "age": 22, "sex": "male", "weight_kg": 72, "height_cm": 178,
    "activity": "moderate", "goal": "gain_muscle",
}


def test_post_metrics_computes_server_side(auth_api):
    resp = auth_api.post("/api/v1/metrics", PAYLOAD, format="json")
    assert resp.status_code == 201, resp.data
    assert resp.data["bmi"] == 22.7
    assert resp.data["goal_offset_kcal"] == 300
    assert resp.data["is_current"] is True


def test_posting_again_supersedes_current(auth_api):
    auth_api.post("/api/v1/metrics", PAYLOAD, format="json")
    auth_api.post("/api/v1/metrics", {**PAYLOAD, "goal": "lose"}, format="json")
    current = auth_api.get("/api/v1/metrics/current")
    assert current.status_code == 200
    assert current.data["goal"] == "lose"
    # History keeps both snapshots.
    assert len(auth_api.get("/api/v1/metrics").data) == 2


def test_derived_endpoint(auth_api):
    auth_api.post("/api/v1/metrics", PAYLOAD, format="json")
    resp = auth_api.get("/api/v1/metrics/derived")
    assert resp.status_code == 200
    assert {"bmi", "tdee", "target_kcal", "protein_target_g"} <= set(resp.data)


def test_metrics_rejects_out_of_range(auth_api):
    resp = auth_api.post("/api/v1/metrics", {**PAYLOAD, "age": 5}, format="json")
    assert resp.status_code == 400
