"""Serializers do catálogo — públicos (loja) e de gestão (staff)."""
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.core.validators import validate_positive_quantity, validate_slug

from .models import Brand, Category, InventoryMovement, Product


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ["id", "name", "slug", "type", "description", "order"]
        read_only_fields = ["id"]


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo", "description", "order"]
        read_only_fields = ["id"]


class ProductListSerializer(serializers.ModelSerializer):
    """Lista pública — dados essenciais para cards da loja."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    brand = serializers.SlugRelatedField(slug_field="slug", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "image",
            "price",
            "old_price",
            "category",
            "brand",
            "stock",
            "is_new",
            "is_featured",
            "rating",
            "review_count",
        ]


class ProductDetailSerializer(ProductListSerializer):
    """Detalhe público — inclui galeria e especificações."""

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + [
            "description",
            "full_description",
            "images",
            "specs",
        ]


class ProductAdminSerializer(serializers.ModelSerializer):
    """Gestão (staff) — todos os campos, inclui estado e stock."""

    slug = serializers.CharField(max_length=220, validators=[validate_slug, UniqueValidator(queryset=Product.objects.all())])
    category = serializers.SlugRelatedField(slug_field="slug", queryset=Category.objects.all())
    brand = serializers.SlugRelatedField(slug_field="slug", queryset=Brand.objects.all(), allow_null=True, required=False)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "slug",
            "sku",
            "description",
            "full_description",
            "price",
            "old_price",
            "image",
            "images",
            "category",
            "brand",
            "specs",
            "stock",
            "is_new",
            "is_featured",
            "status",
            "rating",
            "review_count",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]


class StockAdjustSerializer(serializers.Serializer):
    """Ajuste de stock: delta relativo com nota obrigatória."""

    quantity = serializers.IntegerField()
    note = serializers.CharField(max_length=255)

    def validate_quantity(self, value: int) -> int:
        return validate_positive_quantity(abs(value)) * (1 if value > 0 else -1)


class InventoryMovementSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryMovement
        fields = ["id", "type", "quantity", "note", "actor", "created_at"]
        read_only_fields = fields