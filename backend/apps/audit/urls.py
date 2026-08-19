"""Rotas da auditoria (v1) — /audit/logs/."""
from rest_framework.routers import DefaultRouter

from .views import AuditLogViewSet

router = DefaultRouter()
router.register("audit/logs", AuditLogViewSet, basename="audit-log")

urlpatterns = router.urls