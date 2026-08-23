"""Contrato da API v1 — router de cada domínio registado aqui."""
from django.urls import include, path

from apps.core.views import DashboardStatsView, health_live, health_ready, health_worker, upload_image

urlpatterns = [
    path("health/", health_ready, name="health"),
    path("health/live/", health_live, name="health-live"),
    path("health/ready/", health_ready, name="health-ready"),
    path("health/worker/", health_worker, name="health-worker"),
    path("media/upload/", upload_image, name="media-upload"),
    path("", include("apps.users.urls")),
    path("", include("apps.catalog.urls")),
    path("", include("apps.quotes.urls")),
    path("", include("apps.cms.urls")),
    path("", include("apps.blog.urls")),
    path("", include("apps.portfolio.urls")),
    path("", include("apps.commerce.urls")),
    path("", include("apps.audit.urls")),
    path("", include("apps.imports.urls")),
    path("", include("apps.analytics.urls")),
    path("dashboard/", DashboardStatsView.as_view(), name="dashboard-stats"),
]
