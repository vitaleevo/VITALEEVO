"""Portfólio: projetos com categorias, galeria e resultados.

Espelha convex/schema.ts (projects).
"""
from django.db import models

from apps.catalog.models import Category
from apps.core.models import BaseModel
from apps.core.validators import validate_slug


class ProjectStatus(models.TextChoices):
    DRAFT = "draft", "Rascunho"
    PUBLISHED = "published", "Publicado"
    ARCHIVED = "archived", "Arquivado"


class Project(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.CharField(max_length=220, unique=True, validators=[validate_slug])
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="projects",
        limit_choices_to={"type": "portfolio"},
        null=True,
        blank=True,
    )
    tags = models.JSONField(default=list, blank=True)
    image = models.URLField(blank=True)
    images = models.JSONField(default=list, blank=True)
    client = models.CharField(max_length=160, blank=True)
    year = models.CharField(max_length=20, blank=True)
    full_description = models.TextField(blank=True)
    challenge = models.TextField(blank=True)
    solution = models.TextField(blank=True)
    results = models.JSONField(default=list, blank=True)
    status = models.CharField(
        max_length=20,
        choices=ProjectStatus.choices,
        default=ProjectStatus.PUBLISHED,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    order = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        ordering = ["order", "-created_at"]
        verbose_name = "projeto"
        verbose_name_plural = "projetos"

    def __str__(self):
        return self.title