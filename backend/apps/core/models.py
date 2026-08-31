"""Modelos-base partilhados (DRY: toda a tabela de domínio herda daqui)."""
import uuid

from django.db import models


class BaseModel(models.Model):
    """Modelo-base: UUID como PK, timestamps automáticos e soft delete.

    Todos os modelos de domínio herdam esta classe — uma única fonte de
    verdade para os campos comuns.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True, verbose_name="ativo")

    class Meta:
        abstract = True
        ordering = ["-created_at"]



class SlugRedirect(BaseModel):
    old_slug = models.CharField(max_length=220, db_index=True)
    new_slug = models.CharField(max_length=220, db_index=True)
    resource_type = models.CharField(max_length=20, choices=[("article","article"),("project","project"),("product","product")])

    class Meta:
        verbose_name = "redirect de slug"
        verbose_name_plural = "redirects de slug"
        constraints = [
            models.UniqueConstraint(fields=["old_slug","resource_type"], name="uq_slug_redirect_old_type")
        ]
        indexes = [
            models.Index(fields=["old_slug","resource_type"]),
        ]

    def __str__(self):
        return f"{self.old_slug} → {self.new_slug} ({self.resource_type})"
