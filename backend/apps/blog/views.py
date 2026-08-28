"""Endpoints do blog — leitura pública no site; gestão com content:manage."""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.core.permissions import HasCapability, user_has_capability

from .models import Article
from .serializers import ArticleAdminSerializer, ArticleSerializer


class ArticleViewSet(viewsets.ModelViewSet):
    """Artigos — públicos quando publicados; gestão completa com content:manage."""

    lookup_field = "slug"
    search_fields = ["title", "excerpt", "content", "author"]
    filterset_fields = ["category__slug", "is_featured"]
    ordering_fields = ["published_at", "created_at", "title"]

    def get_queryset(self):
        qs = Article.objects.select_related("category")
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            qs = qs.filter(is_active=True, is_published=True)
        return qs

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return ArticleSerializer
        return ArticleAdminSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("content:manage")]
