"""Rotas de importação (v1)."""
from django.urls import path

from .views import ProductImportView

urlpatterns = [
    path("imports/products/", ProductImportView.as_view(), name="import-products"),
]