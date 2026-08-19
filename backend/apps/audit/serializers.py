"""Serializers da auditoria — leitura apenas (registo imutável)."""
from rest_framework import serializers

from .models import AuditLog


class AuditLogSerializer(serializers.ModelSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True, default=None)
    user_name = serializers.CharField(source="user.name", read_only=True, default="")

    class Meta:
        model = AuditLog
        fields = [
            "id",
            "action",
            "resource_type",
            "resource_id",
            "details",
            "user_email",
            "user_name",
            "ip_address",
            "created_at",
        ]
        read_only_fields = fields