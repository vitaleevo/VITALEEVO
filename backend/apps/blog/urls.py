"""Rotas do blog (v1) — artigos."""
from rest_framework.routers import DefaultRouter

from .views import ArticleViewSet

router = DefaultRouter()
router.register("blog/articles", ArticleViewSet, basename="article")

urlpatterns = router.urls