"""Serializers do catálogo — públicos (loja) e de gestão (staff)."""
from rest_framework import serializers
from rest_framework.validators import UniqueValidator

from apps.core.validators import validate_positive_quantity, validate_slug

from .models import Brand, Category, InventoryMovement, Product


class CategorySerializer(serializers.ModelSerializer):
    parent = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.all(),
        allow_null=True,
        required=False,
        default=None,
    )

    class Meta:
        model = Category
        fields = ["id", "name", "slug", "type", "parent", "description", "order"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        instance = self.instance
        parent = attrs.get("parent", getattr(instance, "parent", None))
        category_type = attrs.get("type", getattr(instance, "type", "store"))
        if parent:
            if instance and parent.pk == instance.pk:
                raise serializers.ValidationError({"parent": "Uma categoria não pode ser pai de si própria."})
            if parent.type != category_type:
                raise serializers.ValidationError({"parent": "A categoria pai deve ter o mesmo tipo."})
            ancestor = parent
            while ancestor is not None:
                if instance and ancestor.pk == instance.pk:
                    raise serializers.ValidationError({"parent": "A hierarquia de categorias não pode conter ciclos."})
                ancestor = ancestor.parent
        return attrs


class BrandSerializer(serializers.ModelSerializer):
    class Meta:
        model = Brand
        fields = ["id", "name", "slug", "logo", "description", "order"]
        read_only_fields = ["id"]


class ProductListSerializer(serializers.ModelSerializer):
    """Lista pública — dados essenciais para cards da loja."""

    category = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    subcategory = serializers.SlugRelatedField(slug_field="slug", read_only=True, allow_null=True)
    brand = serializers.SlugRelatedField(slug_field="slug", read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True, allow_null=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)

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
            "category_name",
            "subcategory",
            "subcategory_name",
            "brand",
            "brand_name",
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
    image = serializers.CharField(max_length=500, allow_blank=True)
    category = serializers.SlugRelatedField(slug_field="slug", queryset=Category.objects.all())
    subcategory = serializers.SlugRelatedField(
        slug_field="slug",
        queryset=Category.objects.filter(parent__isnull=False),
        allow_null=True,
        required=False,
    )
    brand = serializers.SlugRelatedField(slug_field="slug", queryset=Brand.objects.all(), allow_null=True, required=False)
    category_name = serializers.CharField(source="category.name", read_only=True)
    subcategory_name = serializers.CharField(source="subcategory.name", read_only=True, allow_null=True)
    brand_name = serializers.CharField(source="brand.name", read_only=True, allow_null=True)

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
            "category_name",
            "subcategory",
            "subcategory_name",
            "brand",
            "brand_name",
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

    def validate_sku(self, value: str) -> str:
        sku = value.strip().upper()
        if not sku:
            return ""
        queryset = Product.objects.filter(sku__iexact=sku)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Já existe um produto com este SKU.")
        return sku

    def validate(self, attrs):
        category = attrs.get("category", getattr(self.instance, "category", None))
        subcategory = attrs.get("subcategory", getattr(self.instance, "subcategory", None))
        if subcategory and (not category or subcategory.parent_id != category.id):
            raise serializers.ValidationError(
                {"subcategory": "A subcategoria deve pertencer à categoria selecionada."}
            )
        return attrs


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
