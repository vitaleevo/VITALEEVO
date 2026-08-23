"""Testes para ingestão e agregação analítica do mapa de calor."""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

from apps.analytics.models import ClickEvent, PageView

User = get_user_model()


@pytest.mark.django_db
class TestAnalyticsTracking:
    def setup_method(self):
        self.client = APIClient()

    def test_track_pageview(self):
        res = self.client.post("/api/v1/analytics/track/", {
            "type": "pageview",
            "path": "/store",
            "session_id": "test-session-123",
            "device_type": "desktop",
            "browser": "Chrome",
            "screen_resolution": "1920x1080",
        }, format="json")
        assert res.status_code == 200
        assert res.data["ok"] is True
        assert PageView.objects.filter(session_id="test-session-123", path="/store").exists()

    def test_track_click(self):
        res = self.client.post("/api/v1/analytics/track/", {
            "type": "click",
            "path": "/store",
            "session_id": "test-session-123",
            "element_tag": "button",
            "element_text": "Comprar Agora",
            "element_id": "buy-btn-1",
            "x_percent": 45.2,
            "y_percent": 60.8,
        }, format="json")
        assert res.status_code == 200
        assert ClickEvent.objects.filter(element_text="Comprar Agora", path="/store").exists()

    def test_track_batch(self):
        res = self.client.post("/api/v1/analytics/track/", {
            "session_id": "batch-session-999",
            "path": "/services",
            "pageview": {
                "device_type": "mobile",
                "browser": "Safari",
            },
            "clicks": [
                {
                    "element_tag": "button",
                    "element_text": "Pedir Cotação",
                    "x_percent": 50.0,
                    "y_percent": 75.0,
                },
                {
                    "element_tag": "a",
                    "element_text": "Ver Mais",
                    "x_percent": 20.0,
                    "y_percent": 30.0,
                },
            ]
        }, format="json")
        assert res.status_code == 200
        assert PageView.objects.filter(session_id="batch-session-999", path="/services").exists()
        assert ClickEvent.objects.filter(session_id="batch-session-999").count() == 2

    def test_rejects_invalid_coordinates(self):
        res = self.client.post("/api/v1/analytics/track/", {
            "type": "click",
            "path": "/store",
            "session_id": "session-invalid",
            "x_percent": 101,
            "y_percent": -1,
        }, format="json")
        assert res.status_code == 400
        assert ClickEvent.objects.count() == 0

    def test_rejects_oversized_batch(self):
        res = self.client.post("/api/v1/analytics/track/", {
            "session_id": "session-too-large",
            "path": "/store",
            "clicks": [{"x_percent": 1, "y_percent": 1} for _ in range(51)],
        }, format="json")
        assert res.status_code == 400


@pytest.mark.django_db
class TestAnalyticsAggregations:
    def setup_method(self):
        self.client = APIClient()
        self.staff_user = User.objects.create_user(
            email="admin@vitaleevo.ao",
            password="Password123!",
            role="admin",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.staff_user)

        # Inserir alguns dados de teste
        PageView.objects.create(path="/", session_id="s1", device_type="desktop")
        PageView.objects.create(path="/", session_id="s2", device_type="mobile")
        PageView.objects.create(path="/store", session_id="s1", device_type="desktop")

        ClickEvent.objects.create(path="/", session_id="s1", element_text="Explorar", element_tag="button", x_percent=40.0, y_percent=50.0)
        ClickEvent.objects.create(path="/", session_id="s2", element_text="Explorar", element_tag="button", x_percent=40.0, y_percent=50.0)
        ClickEvent.objects.create(path="/store", session_id="s1", element_text="Carrinho", element_tag="button", x_percent=85.0, y_percent=10.0)

    def test_overview_metrics(self):
        res = self.client.get("/api/v1/analytics/overview/")
        assert res.status_code == 200
        data = res.data
        assert data["total_pageviews"] >= 3
        assert data["unique_visitors"] >= 2
        assert data["total_clicks"] >= 3
        assert len(data["top_pages"]) >= 2
        assert len(data["top_buttons"]) >= 1

    def test_heatmap_clusters(self):
        res = self.client.get("/api/v1/analytics/heatmap/?path=/")
        assert res.status_code == 200
        data = res.data
        assert data["path"] == "/"
        assert data["total_clicks"] >= 2
        assert len(data["points"]) >= 1
        assert len(data["elements"]) >= 1
        assert data["elements"][0]["label"] == "Explorar"
        assert data["elements"][0]["clicks"] >= 2

    def test_pages_list(self):
        res = self.client.get("/api/v1/analytics/pages/")
        assert res.status_code == 200
        paths = [p["path"] for p in res.data]
        assert "/" in paths
        assert "/store" in paths

    def test_invalid_period_returns_400(self):
        assert self.client.get("/api/v1/analytics/overview/?period=year").status_code == 400
