"""Testes de autenticação JWT, rotação e revogação de sessão."""
import pytest

pytestmark = pytest.mark.django_db


@pytest.fixture
def jwt_user(django_user_model):
    return django_user_model.objects.create_user(
        email="jwt@teste.ao",
        password="SenhaForte123!",
    )


def login(client):
    return client.post(
        "/api/v1/auth/login/",
        {"email": "jwt@teste.ao", "password": "SenhaForte123!"},
        format="json",
    )


def test_login_and_profile(client, jwt_user):
    response = login(client)
    assert response.status_code == 200
    assert response.json()["access"]
    assert response.json()["refresh"]

    client.credentials(HTTP_AUTHORIZATION=f"Bearer {response.json()['access']}")
    profile = client.get("/api/v1/auth/me/")
    assert profile.status_code == 200
    assert profile.json()["email"] == jwt_user.email


def test_refresh_rotates_and_blacklists_previous_token(client, jwt_user):
    refresh = login(client).json()["refresh"]
    rotated = client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
    assert rotated.status_code == 200
    assert rotated.json()["access"]
    assert rotated.json()["refresh"] != refresh

    reused = client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
    assert reused.status_code == 401


def test_logout_blacklists_refresh_token(client, jwt_user):
    refresh = login(client).json()["refresh"]
    logout = client.post("/api/v1/auth/logout/", {"refresh": refresh}, format="json")
    assert logout.status_code == 204

    reused = client.post("/api/v1/auth/refresh/", {"refresh": refresh}, format="json")
    assert reused.status_code == 401


def test_inactive_user_cannot_login(client, jwt_user):
    jwt_user.is_active = False
    jwt_user.save(update_fields=["is_active"])
    assert login(client).status_code == 401
