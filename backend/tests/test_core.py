"""Testes dos endpoints operacionais do core."""

import pytest

pytestmark = pytest.mark.django_db


class HealthyRedis:
    def ping(self):
        return True


def test_liveness_does_not_depend_on_external_services(client):
    response = client.get("/api/v1/health/live/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_readiness_requires_database_and_redis(client, monkeypatch):
    monkeypatch.setattr("apps.core.views.django_rq.get_connection", lambda _name: HealthyRedis())
    response = client.get("/api/v1/health/ready/")
    assert response.status_code == 200
    assert response.json()["dependencies"] == {"db": True, "redis": True}


def test_readiness_returns_503_when_redis_is_unavailable(client, monkeypatch):
    def unavailable(_name):
        raise ConnectionError("redis down")

    monkeypatch.setattr("apps.core.views.django_rq.get_connection", unavailable)
    response = client.get("/api/v1/health/")
    assert response.status_code == 503
    assert response.json()["dependencies"] == {"db": True, "redis": False}
