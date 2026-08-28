"""Tarefas de retenção de analytics."""

from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from .models import ClickEvent, PageView


def purge_old_analytics(retention_days: int | None = None) -> dict[str, int]:
    days = retention_days or getattr(settings, "ANALYTICS_RETENTION_DAYS", 180)
    cutoff = timezone.now() - timedelta(days=days)
    pageviews, _ = PageView.objects.filter(created_at__lt=cutoff).delete()
    clicks, _ = ClickEvent.objects.filter(created_at__lt=cutoff).delete()
    return {"pageviews": pageviews, "clicks": clicks}
