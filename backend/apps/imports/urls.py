"""Rotas de importação (v1)."""
from django.urls import path

from .views import ProductImportTemplateView, ProductImportView

urlpatterns = [
    path("imports/products/", ProductImportView.as_view(), name="import-products"),
    path("imports/products/template/", ProductImportTemplateView.as_view(), name="import-products-template"),
]