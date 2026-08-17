"""Rotas do catálogo (v1) — /catalog/products/, /catalog/categories/, /catalog/brands/."""
from rest_framework.routers import DefaultRouter

from .views import BrandViewSet, CategoryViewSet, ProductViewSet

router = DefaultRouter()
router.register("catalog/products", ProductViewSet, basename="product")
router.register("catalog/categories", CategoryViewSet, basename="category")
router.register("catalog/brands", BrandViewSet, basename="brand")

urlpatterns = router.urls