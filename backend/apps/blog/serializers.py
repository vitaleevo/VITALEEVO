"""Serializers do blog — públicos (site) e de gestão (content:manage)."""
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.catalog.models import Category
from apps.core.validators import validate_slug

from .models import Article


class ArticleSerializer(serializers.ModelSerializer):
    """Artigo público — o essencial para cards e página do artigo."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True, allow_null=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = Article
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_name",
            "excerpt",
            "content",
            "image",
            "author",
            "author_role",
            "author_image",
            "read_time",
            "is_featured",
            "published_at",
            "seo_title",
            "seo_description",
        ]
        read_only_fields = ["id", "published_at"]


class ArticleAdminSerializer(ArticleSerializer):
    """Artigo em gestão — inclui estado editorial."""

    slug = serializers.CharField(max_length=220, validators=[validate_slug, UniqueValidator(queryset=Article.objects.all())])
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.filter(type="blog"),
        allow_null=True,
        required=False,
    )

    class Meta(ArticleSerializer.Meta):
        fields = ArticleSerializer.Meta.fields + [
            "status",
            "is_published",
            "scheduled_at",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]