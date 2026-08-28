"""Blog: artigos com categorias, estado editorial e SEO.

Espelha convex/schema.ts (articles).
"""
from django.db import models

from apps.catalog.models import Category
from apps.core.models import BaseModel
from apps.core.validators import validate_slug


class ArticleStatus(models.TextChoices):
    DRAFT = "draft", "Rascunho"
    SCHEDULED = "scheduled", "Agendado"
    PUBLISHED = "published", "Publicado"
    ARCHIVED = "archived", "Arquivado"


class Article(BaseModel):
    title = models.CharField(max_length=200)
    slug = models.CharField(max_length=220, unique=True, validators=[validate_slug])
    category = models.ForeignKey(
        Category,
        on_delete=models.PROTECT,
        related_name="articles",
        limit_choices_to={"type": "blog"},
        null=True,
        blank=True,
    )
    excerpt = models.TextField(blank=True)
    content = models.TextField()
    image = models.URLField(blank=True)
    author = models.CharField(max_length=120, blank=True)
    author_role = models.CharField(max_length=120, blank=True)
    author_image = models.URLField(blank=True)
    read_time = models.CharField(max_length=20, blank=True)
    is_published = models.BooleanField(default=False, db_index=True)
    status = models.CharField(
        max_length=20,
        choices=ArticleStatus.choices,
        default=ArticleStatus.DRAFT,
        db_index=True,
    )
    is_featured = models.BooleanField(default=False, db_index=True)
    published_at = models.DateTimeField(null=True, blank=True)
    scheduled_at = models.DateTimeField(null=True, blank=True)
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)

    class Meta(BaseModel.Meta):
        ordering = ["-published_at", "-created_at"]
        verbose_name = "artigo"
        verbose_name_plural = "artigos"
        indexes = [models.Index(fields=["is_published", "status"])]

    def __str__(self):
        return self.title