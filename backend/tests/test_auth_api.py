import pytest

pytestmark = pytest.mark.django_db


def test_register_creates_user_and_returns_tokens(api):
    resp = api.post(
        "/api/v1/auth/register",
        {
            "first_name": "Ada",
            "last_name": "Obi",
            "student_id": "BU/22/CSC/0002",
            "email": "ada@university.edu.ng",
            "department": "Computer Science",
            "password": "Sup3rSecret!",
        },
        format="json",
    )
    assert resp.status_code == 201, resp.data
    assert resp.data["tokens"]["access"]
    assert resp.data["user"]["email"] == "ada@university.edu.ng"
    assert resp.data["user"]["first_name"] == "Ada"
    assert resp.data["user"]["is_email_verified"] is False


def test_register_rejects_duplicate_email(api, user):
    resp = api.post(
        "/api/v1/auth/register",
        {
            "first_name": "X", "last_name": "Y", "student_id": "BU/22/CSC/9999",
            "email": user.email, "password": "Sup3rSecret!",
        },
        format="json",
    )
    assert resp.status_code == 400


def test_login_with_student_id(api, user):
    resp = api.post(
        "/api/v1/auth/login",
        {"identifier": user.student_id, "password": "Sup3rSecret!"},
        format="json",
    )
    assert resp.status_code == 200, resp.data
    assert resp.data["tokens"]["refresh"]


def test_login_rejects_bad_password(api, user):
    resp = api.post(
        "/api/v1/auth/login",
        {"identifier": user.email, "password": "wrong"},
        format="json",
    )
    assert resp.status_code == 400


def test_me_requires_auth(api):
    assert api.get("/api/v1/accounts/me").status_code == 401


def test_me_returns_profile(auth_api):
    resp = auth_api.get("/api/v1/accounts/me")
    assert resp.status_code == 200
    assert resp.data["email"] == "david@university.edu.ng"


def test_email_verification_flow(api, user):
    from apps.accounts.tokens import make_verification_token

    user.is_email_verified = False
    user.save()
    token = make_verification_token(user)
    resp = api.post("/api/v1/auth/verify-email", {"token": token}, format="json")
    assert resp.status_code == 200
    user.refresh_from_db()
    assert user.is_email_verified is True
