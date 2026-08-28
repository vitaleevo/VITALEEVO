"""Endpoints de auditoria — leitura para staff com audit:read."""
from rest_framework import viewsets

from apps.core.permissions import HasCapability

from .models import AuditLog
from .serializers import AuditLogSerializer


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """Listagem/filtro dos registos imutáveis (quem fez o quê e quando)."""

    serializer_class = AuditLogSerializer
    queryset = AuditLog.objects.select_related("user").all()
    filterset_fields = ["action", "resource_type", "user"]
    search_fields = ["action", "resource_type", "resource_id"]
    ordering_fields = ["created_at"]

    def get_permissions(self):
        return [HasCapability("audit:read")]