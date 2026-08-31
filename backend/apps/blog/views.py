"""Endpoints do blog — leitura pública no site; gestão com content:manage."""
from rest_framework import status, viewsets
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.models import SlugRedirect
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

    def retrieve(self, request, *args, **kwargs):
        try:
            return super().retrieve(request, *args, **kwargs)
        except Exception:
            slug = kwargs.get("slug")
            redirect = SlugRedirect.objects.filter(old_slug=slug, resource_type="article").first()
            if redirect:
                # follow chain up to 5 hops
                target = redirect.new_slug
                for _ in range(5):
                    nxt = SlugRedirect.objects.filter(old_slug=target, resource_type="article").first()
                    if not nxt:
                        break
                    target = nxt.new_slug
                return Response(status=status.HTTP_308_PERMANENT_REDIRECT, headers={"Location": f"/api/v1/blog/articles/{target}/"})
            raise

    def perform_update(self, serializer):
        old_slug = serializer.instance.slug if serializer.instance else None
        instance = serializer.save()
        if old_slug and old_slug != instance.slug:
            SlugRedirect.objects.update_or_create(old_slug=old_slug, resource_type="article", defaults={"new_slug": instance.slug})
            # cleanup loop
            SlugRedirect.objects.filter(old_slug=instance.slug, new_slug=old_slug, resource_type="article").delete()
        return instance
