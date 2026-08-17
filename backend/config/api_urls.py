"""Contrato da API v1 — router de cada domínio registado aqui."""
from django.urls import include, path

from apps.core.views import health

# As apps quotes/cms são registadas quando tiverem rotas (fases seguintes).
urlpatterns = [
    path("health/", health, name="health"),
    path("", include("apps.users.urls")),
    path("", include("apps.catalog.urls")),
]