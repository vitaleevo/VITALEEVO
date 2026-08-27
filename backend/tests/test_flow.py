import os

import pytest
from fastapi.testclient import TestClient

os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test.db"
os.environ["FIRST_ADMIN_PASSWORD"] = "AdminTeste123!"
os.environ["SECRET_KEY"] = "test-secret-key-change-me-1234567890"

from app.main import app  # noqa: E402


@pytest.fixture(scope="module")
def client():
    with TestClient(app) as c:
        yield c


def test_health(client):
    r = client.get("/api/v1/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_health_ready(client):
    r = client.get("/api/v1/health/ready")
    assert r.status_code == 200


def test_admin_seeded(client):
    r = client.post("/api/v1/auth/login", json={"email": "admin@vitaleevo.ao", "password": "AdminTeste123!"})
    assert r.status_code == 200
    assert "access" in r.json()


def test_login_trailing_slash(client):
    r = client.post("/api/v1/auth/login/", json={"email": "admin@vitaleevo.ao", "password": "AdminTeste123!"})
    assert r.status_code == 200
    assert "access" in r.json()


def test_register_rejected_short_password(client):
    r = client.post("/api/v1/auth/register", json={"email": "novo@vitaleevo.ao", "password": "short"})
    assert r.status_code == 422


def test_catalog_products(client):
    r = client.get("/api/v1/catalog/products")
    assert r.status_code == 200
    data = r.json()
    assert data["count"] > 0
    assert "results" in data


def test_products_trailing_slash(client):
    r = client.get("/api/v1/catalog/products/")
    assert r.status_code == 200


def test_site_config(client):
    r = client.get("/api/v1/cms/settings/site_config/")
    assert r.status_code == 200
    body = r.json()
    assert body["key"] == "site_config"
    assert "siteName" in body["value"]


def test_categories(client):
    r = client.get("/api/v1/catalog/categories/?type=store")
    assert r.status_code == 200
    assert len(r.json()) > 0


def test_brands(client):
    r = client.get("/api/v1/catalog/brands/?page_size=100")
    assert r.status_code == 200
    assert r.json()["count"] > 0


def test_quote_creation_requires_items(client):
    r = client.post("/api/v1/quotes/", json={})
    assert r.status_code == 400
    r2 = client.post("/api/v1/quotes/", json={"items": [{"slug": "x", "qty": 1}]})
    assert r2.status_code == 201
    body = r2.json()
    assert body["public_id"]
    assert body["access_token"]
    assert body["item_count"] == 1


def test_quote_status(client):
    r = client.post("/api/v1/quotes/", json={"items": [{"slug": "x", "qty": 1}]})
    body = r.json()
    r2 = client.post("/api/v1/quotes/status/", json={"public_id": body["public_id"], "access_token": body["access_token"]})
    assert r2.status_code == 200
    assert r2.json()["status"] == "aberto"


def test_analytics_track_no_store(client):
    r = client.post("/api/v1/analytics/track/", json={"type": "page_view", "path": "/", "session_id": "s1"})
    assert r.status_code == 200
    assert r.json()["ok"] is True


def test_analytics_track_validation(client):
    r = client.post("/api/v1/analytics/track/", json={"type": "page_view"})
    assert r.status_code == 400


def test_contact_submit(client):
    r = client.post("/api/v1/cms/contacts/", json={"name": "João", "email": "joao@vitaleevo.ao", "message": "Olá"})
    assert r.status_code == 201
