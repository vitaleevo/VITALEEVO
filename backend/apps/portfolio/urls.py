"""Rotas do portfólio (v1) — projetos."""
from rest_framework.routers import DefaultRouter

from .views import ProjectViewSet

router = DefaultRouter()
router.register("portfolio/projects", ProjectViewSet, basename="project")

urlpatterns = router.urls