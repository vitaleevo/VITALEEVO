"""Modelos de rastreamento de visitas (pageviews) e cliques para mapa de calor."""
import uuid
from django.conf import settings
from django.db import models


class PageView(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    path = models.CharField(max_length=255, db_index=True)
    session_id = models.CharField(max_length=80, db_index=True)
    referrer = models.CharField(max_length=500, blank=True)
    device_type = models.CharField(max_length=20, default="desktop", db_index=True)  # desktop, mobile, tablet
    browser = models.CharField(max_length=80, blank=True)
    screen_resolution = models.CharField(max_length=30, blank=True)
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="pageviews",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "visualização de página"
        verbose_name_plural = "visualizações de página"
        indexes = [
            models.Index(fields=["path", "created_at"]),
            models.Index(fields=["session_id", "created_at"]),
        ]

    def __str__(self):
        return f"{self.path} ({self.device_type}) - {self.created_at:%Y-%m-%d %H:%M}"


class ClickEvent(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    path = models.CharField(max_length=255, db_index=True)
    session_id = models.CharField(max_length=80, db_index=True)
    element_tag = models.CharField(max_length=40, default="button")
    element_id = models.CharField(max_length=120, blank=True)
    element_text = models.CharField(max_length=255, blank=True)
    element_selector = models.CharField(max_length=255, blank=True)
    x_percent = models.FloatField(default=0.0)  # 0.0 - 100.0% da largura da viewport/página
    y_percent = models.FloatField(default=0.0)  # 0.0 - 100.0% da altura da viewport/página
    viewport_width = models.IntegerField(default=1920)
    viewport_height = models.IntegerField(default=1080)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "evento de clique"
        verbose_name_plural = "eventos de clique"
        indexes = [
            models.Index(fields=["path", "created_at"]),
            models.Index(fields=["element_text", "path"]),
        ]

    def __str__(self):
        label = self.element_text or self.element_id or self.element_tag
        return f"{self.path} -> {label} ({self.x_percent:.1f}%, {self.y_percent:.1f}%)"
