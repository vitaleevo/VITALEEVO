"""Testes dos endpoints operacionais do core."""

import pytest
from django.utils import timezone

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


def test_request_id_is_propagated(client):
    response = client.get("/api/v1/health/live/", HTTP_X_REQUEST_ID="smoke-test-123")
    assert response.status_code == 200
    assert response["X-Request-ID"] == "smoke-test-123"


def test_invalid_request_id_is_replaced(client):
    response = client.get("/api/v1/health/live/", HTTP_X_REQUEST_ID="invalid request id")
    assert response.status_code == 200
    assert response["X-Request-ID"] != "invalid request id"
    assert len(response["X-Request-ID"]) == 32


class ActiveWorker:
    last_heartbeat = timezone.now()
    worker_ttl = 420

    def get_state(self):
        return "idle"


def test_worker_health_requires_recent_worker(client, monkeypatch):
    monkeypatch.setattr("apps.core.views.django_rq.get_connection", lambda _name: HealthyRedis())
    monkeypatch.setattr("apps.core.views.Worker.all", lambda connection: [ActiveWorker()])
    response = client.get("/api/v1/health/worker/")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "active_workers": 1}


def test_worker_health_returns_503_without_workers(client, monkeypatch):
    monkeypatch.setattr("apps.core.views.django_rq.get_connection", lambda _name: HealthyRedis())
    monkeypatch.setattr("apps.core.views.Worker.all", lambda connection: [])
    response = client.get("/api/v1/health/worker/")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable", "active_workers": 0}


class StaleWorker(ActiveWorker):
    last_heartbeat = timezone.now() - timezone.timedelta(minutes=10)


def test_worker_health_rejects_expired_registration(client, monkeypatch):
    monkeypatch.setattr("apps.core.views.django_rq.get_connection", lambda _name: HealthyRedis())
    monkeypatch.setattr("apps.core.views.Worker.all", lambda connection: [StaleWorker()])
    response = client.get("/api/v1/health/worker/")
    assert response.status_code == 503
    assert response.json() == {"status": "unavailable", "active_workers": 0}
