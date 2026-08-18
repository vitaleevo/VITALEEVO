"""Contrato da API v1 — router de cada domínio registado aqui."""
from django.urls import include, path

from apps.core.views import health, upload_image

urlpatterns = [
    path("health/", health, name="health"),
    path("media/upload/", upload_image, name="media-upload"),
    path("", include("apps.users.urls")),
    path("", include("apps.catalog.urls")),
    path("", include("apps.quotes.urls")),
    path("", include("apps.cms.urls")),
    path("", include("apps.blog.urls")),
    path("", include("apps.portfolio.urls")),
    path("", include("apps.commerce.urls")),
]