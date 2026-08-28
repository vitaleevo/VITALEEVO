"""Endpoints do portfólio — leitura pública no site; gestão com content:manage."""
from rest_framework import viewsets
from rest_framework.permissions import AllowAny

from apps.core.permissions import HasCapability, user_has_capability

from .models import Project
from .serializers import ProjectAdminSerializer, ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    """Projetos — públicos quando publicados; gestão completa com content:manage."""

    lookup_field = "slug"
    search_fields = ["title", "client", "challenge", "solution"]
    filterset_fields = ["category__slug", "is_featured"]
    ordering_fields = ["order", "created_at", "title"]

    def get_queryset(self):
        qs = Project.objects.select_related("category")
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            qs = qs.filter(is_active=True, status="published")
        return qs

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return ProjectSerializer
        return ProjectAdminSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("content:manage")]
