"""CMS institucional: serviços, documentos legais, páginas do site, contactos e newsletters.

Espelha convex/schema.ts (services, legalDocuments, sitePages, siteBlocks, contacts, newsletters, settings).
"""
from django.conf import settings
from django.db import models

from apps.core.models import BaseModel
from apps.core.validators import validate_slug


class ContentStatus(models.TextChoices):
    DRAFT = "draft", "Rascunho"
    PUBLISHED = "published", "Publicado"
    ARCHIVED = "archived", "Arquivado"


class Service(BaseModel):
    title = models.CharField(max_length=160)
    slug = models.CharField(max_length=180, unique=True, validators=[validate_slug])
    subtitle = models.CharField(max_length=255, blank=True)
    description = models.TextField()
    icon = models.CharField(max_length=60, blank=True)
    image = models.URLField(blank=True)
    features = models.JSONField(default=list, blank=True)
    benefits = models.JSONField(default=list, blank=True)
    process = models.JSONField(default=list, blank=True)
    cta_text = models.CharField(max_length=80, default="Solicitar Proposta")
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.PUBLISHED, db_index=True)
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    order = models.PositiveIntegerField(default=0)

    class Meta(BaseModel.Meta):
        ordering = ["order", "created_at"]
        verbose_name = "serviço"
        verbose_name_plural = "serviços"

    def __str__(self):
        return self.title


class LegalDocument(BaseModel):
    slug = models.CharField(max_length=180, unique=True, validators=[validate_slug])
    title = models.CharField(max_length=160)
    content = models.TextField()
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.PUBLISHED)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_legal_documents",
    )

    class Meta(BaseModel.Meta):
        verbose_name = "documento legal"
        verbose_name_plural = "documentos legais"

    def __str__(self):
        return self.title


class SitePage(BaseModel):
    slug = models.CharField(max_length=180, unique=True, validators=[validate_slug])
    title = models.CharField(max_length=160)
    seo_title = models.CharField(max_length=160, blank=True)
    seo_description = models.CharField(max_length=300, blank=True)
    og_image = models.URLField(blank=True)
    status = models.CharField(max_length=20, choices=ContentStatus.choices, default=ContentStatus.DRAFT)
    updated_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="updated_site_pages",
    )

    class Meta(BaseModel.Meta):
        verbose_name = "página do site"
        verbose_name_plural = "páginas do site"

    def __str__(self):
        return self.title


class SiteBlockType(models.TextChoices):
    HERO = "hero", "Hero"
    STATS = "stats", "Estatísticas"
    LOGOS = "logos", "Logos"
    SERVICES = "services", "Serviços"
    PROJECTS = "projects", "Projetos"
    BENEFITS = "benefits", "Benefícios"
    CTA = "cta", "Call to action"
    RICH_TEXT = "richText", "Texto rico"


class SiteBlock(BaseModel):
    page = models.ForeignKey(SitePage, on_delete=models.CASCADE, related_name="blocks")
    type = models.CharField(max_length=20, choices=SiteBlockType.choices)
    content = models.TextField()
    order = models.PositiveIntegerField(default=0)
    is_verified = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        ordering = ["order"]
        verbose_name = "bloco do site"
        verbose_name_plural = "blocos do site"
        constraints = [
            models.UniqueConstraint(fields=["page", "order"], name="unique_page_order"),
        ]

    def __str__(self):
        return f"{self.page.title} — {self.get_type_display()}#{self.order}"


class ContactMessage(BaseModel):
    name = models.CharField(max_length=120)
    email = models.EmailField()
    phone = models.CharField(max_length=20, blank=True)
    company = models.CharField(max_length=120, blank=True)
    subject = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        verbose_name = "mensagem de contacto"
        verbose_name_plural = "mensagens de contacto"

    def __str__(self):
        return f"{self.name} — {self.subject}"


class Newsletter(BaseModel):
    email = models.EmailField(unique=True)
    is_active = models.BooleanField(default=True)
    subscribed_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "subscritor"
        verbose_name_plural = "subscritores"
        ordering = ["-subscribed_at"]

    def __str__(self):
        return self.email


class Setting(BaseModel):
    """Configuração chave/valor — fonte única para o conteúdo do site (ex.: site_config)."""

    key = models.CharField(max_length=80, unique=True)
    value = models.JSONField(default=dict)

    class Meta:
        verbose_name = "configuração"
        verbose_name_plural = "configurações"

    def __str__(self):
        return self.key