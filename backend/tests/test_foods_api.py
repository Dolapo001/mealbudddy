import pytest

pytestmark = pytest.mark.django_db


def test_food_list_requires_auth(api, seeded_foods):
    assert api.get("/api/v1/foods").status_code == 401


def test_food_list_returns_seeded(auth_api, seeded_foods):
    resp = auth_api.get("/api/v1/foods")
    assert resp.status_code == 200
    assert resp.data["count"] == 16


def test_food_search(auth_api, seeded_foods):
    resp = auth_api.get("/api/v1/foods?search=jollof")
    assert resp.data["count"] == 1
    assert resp.data["results"][0]["slug"] == "jollof-rice"


def test_food_tag_filter(auth_api, seeded_foods):
    resp = auth_api.get("/api/v1/foods?tags=high_protein,low_carb")
    slugs = {f["slug"] for f in resp.data["results"]}
    assert "suya" in slugs
    assert "jollof-rice" not in slugs


def test_food_detail(auth_api, seeded_foods):
    resp = auth_api.get("/api/v1/foods/egusi-soup")
    assert resp.status_code == 200
    assert resp.data["macros"]["protein"] == 24
    assert "high_protein" in resp.data["tags"]
