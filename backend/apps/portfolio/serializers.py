"""Serializers do portfólio — públicos (site) e de gestão (content:manage)."""
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.catalog.models import Category
from apps.core.validators import sanitize_html, validate_slug

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    """Projeto público — o essencial para cards e página do projeto."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True, allow_null=True)
    category_name = serializers.CharField(source="category.name", read_only=True, allow_null=True)

    class Meta:
        model = Project
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "category_name",
            "tags",
            "image",
            "images",
            "client",
            "year",
            "full_description",
            "challenge",
            "solution",
            "results",
            "is_featured",
            "order",
        ]
        read_only_fields = ["id"]


class ProjectAdminSerializer(ProjectSerializer):
    """Projeto em gestão — inclui estado."""

    slug = serializers.CharField(max_length=220, validators=[validate_slug, UniqueValidator(queryset=Project.objects.all())])
    category = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.filter(type="portfolio"),
        allow_null=True,
        required=False,
    )

    class Meta(ProjectSerializer.Meta):
        fields = ProjectSerializer.Meta.fields + [
            "status",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_full_description(self, value):
        return sanitize_html(value) if value else value

    def validate_challenge(self, value):
        return sanitize_html(value) if value else value

    def validate_solution(self, value):
        return sanitize_html(value) if value else value