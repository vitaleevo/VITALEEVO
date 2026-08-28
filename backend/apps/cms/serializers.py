"""Serializers do CMS — públicos (site) e de gestão (content:manage)."""
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.core.validators import validate_slug

from .models import (
    ContactMessage,
    ContentStatus,
    LegalDocument,
    Newsletter,
    NewsletterBroadcast,
    Service,
    Setting,
    SiteBlock,
    SitePage,
)


class ServiceSerializer(serializers.ModelSerializer):
    """Serviço público — só o essencial para o site."""

    class Meta:
        model = Service
        fields = [
            "id", "title", "slug", "subtitle", "description", "icon", "image",
            "features", "benefits", "process", "cta_text", "order",
        ]


class ServiceAdminSerializer(ServiceSerializer):
    """Serviço em gestão — inclui estado e SEO."""

    slug = serializers.CharField(max_length=180, validators=[validate_slug, UniqueValidator(queryset=Service.objects.all())])

    class Meta(ServiceSerializer.Meta):
        fields = ServiceSerializer.Meta.fields + [
            "status", "seo_title", "seo_description", "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class LegalDocumentSerializer(serializers.ModelSerializer):
    """Documento legal — público (publicado) e gestão."""

    slug = serializers.CharField(max_length=180, validators=[validate_slug, UniqueValidator(queryset=LegalDocument.objects.all())])

    class Meta:
        model = LegalDocument
        fields = ["id", "slug", "title", "content", "status", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class SiteBlockSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteBlock
        fields = ["id", "type", "content", "order", "is_verified"]
        read_only_fields = ["id"]


class SitePageSerializer(serializers.ModelSerializer):
    """Página do site com blocos — leitura pública e gestão."""

    slug = serializers.CharField(max_length=180, validators=[validate_slug, UniqueValidator(queryset=SitePage.objects.all())])
    blocks = SiteBlockSerializer(many=True, read_only=True)

    class Meta:
        model = SitePage
        fields = ["id", "slug", "title", "seo_title", "seo_description", "og_image", "status", "blocks", "updated_at"]
        read_only_fields = ["id", "updated_at"]


class SiteBlockInputSerializer(serializers.ModelSerializer):
    class Meta:
        model = SiteBlock
        fields = ["type", "content", "is_verified"]


class SitePageUpsertSerializer(serializers.Serializer):
    slug = serializers.CharField(max_length=180, validators=[validate_slug])
    title = serializers.CharField(max_length=160)
    seo_title = serializers.CharField(max_length=160, required=False, allow_blank=True, default="")
    seo_description = serializers.CharField(max_length=300, required=False, allow_blank=True, default="")
    og_image = serializers.URLField(required=False, allow_blank=True, default="")
    status = serializers.ChoiceField(choices=ContentStatus.choices, required=False, default=ContentStatus.DRAFT)
    blocks = SiteBlockInputSerializer(many=True, required=False, default=list, max_length=100)


class ContactMessageSerializer(serializers.ModelSerializer):
    """Mensagem do formulário de contacto — criação pública."""

    class Meta:
        model = ContactMessage
        fields = ["id", "name", "email", "phone", "company", "subject", "message", "is_read", "created_at"]
        read_only_fields = ["id", "created_at"]


class NewsletterSerializer(serializers.ModelSerializer):
    """Subscrição da newsletter — criação pública (email único)."""

    class Meta:
        model = Newsletter
        fields = ["id", "email", "is_active", "subscribed_at"]
        read_only_fields = ["id", "is_active", "subscribed_at"]

    def create(self, validated_data):
        email = validated_data["email"].strip().lower()
        subscriber, _created = Newsletter.objects.update_or_create(email=email, defaults={"is_active": True})
        return subscriber


class NewsletterUnsubscribeSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=512)


class NewsletterBroadcastRequestSerializer(serializers.Serializer):
    subject = serializers.CharField(max_length=200)
    body = serializers.CharField(max_length=50_000)


class NewsletterBroadcastSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterBroadcast
        fields = [
            "id",
            "subject",
            "status",
            "total_recipients",
            "sent_count",
            "failed_count",
            "created_at",
            "finished_at",
        ]
        read_only_fields = fields


class SettingSerializer(serializers.ModelSerializer):
    """Configuração chave/valor — gestão com settings:manage."""

    key = serializers.CharField(max_length=80)

    class Meta:
        model = Setting
        fields = ["id", "key", "value", "updated_at"]
        read_only_fields = ["id", "updated_at"]
