"""Serializers das cotações — público (formulário do site) e gestão (backoffice)."""
from django.db import transaction
from rest_framework import serializers

from apps.catalog.models import Product
from apps.core.validators import normalize_email, validate_phone, validate_positive_quantity

from .models import QuoteItem, QuoteRequest, QuoteStatus, QuoteTask


class QuoteItemSerializer(serializers.ModelSerializer):
    """Item de cotação — produto opcional (permite itens personalizados)."""

    product = serializers.SlugRelatedField(
        slug_field="slug", queryset=Product.objects.filter(is_active=True), required=False, write_only=True
    )

    class Meta:
        model = QuoteItem
        fields = ["product", "name", "sku", "image", "quantity", "quoted_unit_price"]
        extra_kwargs = {
            "name": {"required": False, "allow_blank": True},
            "image": {"required": False, "allow_blank": True},
            "sku": {"required": False, "allow_blank": True},
            "quoted_unit_price": {"required": False},
        }

    def validate(self, attrs):
        product = attrs.get("product")
        if product is not None:
            attrs.setdefault("name", product.name)
            attrs.setdefault("sku", product.sku)
            attrs.setdefault("image", product.image)
        if not attrs.get("name"):
            raise serializers.ValidationError("Cada item precisa de um nome ou produto.")
        attrs["quantity"] = validate_positive_quantity(attrs.get("quantity", 1))
        return attrs

    def create(self, validated_data):
        validated_data.pop("product", None)
        return super().create(validated_data)


class QuoteCreateSerializer(serializers.Serializer):
    """Formulário público do site (POST /quotes/)."""

    name = serializers.CharField(max_length=120)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20)
    company = serializers.CharField(max_length=120, required=False, allow_blank=True)
    message = serializers.CharField(required=False, allow_blank=True)
    source = serializers.CharField(max_length=40, required=False, default="site")
    items = QuoteItemSerializer(many=True, required=False, allow_empty=True)

    def validate_email(self, value: str) -> str:
        return normalize_email(value)

    def validate_phone(self, value: str) -> str:
        return validate_phone(value)

    def validate(self, attrs):
        if not attrs.get("items") and not attrs.get("message", "").strip():
            raise serializers.ValidationError("Adicione itens ou uma mensagem.")
        return attrs


class QuoteItemReadSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(slug_field="slug", read_only=True)

    class Meta:
        model = QuoteItem
        fields = ["id", "product", "name", "sku", "image", "quantity", "quoted_unit_price"]


class QuoteReadSerializer(serializers.ModelSerializer):
    """Leitura para o backoffice (quotes:read)."""

    items = QuoteItemReadSerializer(many=True, read_only=True)
    assigned_to = serializers.StringRelatedField()
    assigned_to_email = serializers.CharField(source="assigned_to.email", read_only=True)

    class Meta:
        model = QuoteRequest
        fields = [
            "id",
            "public_id",
            "status",
            "name",
            "email",
            "phone",
            "company",
            "message",
            "source",
            "assigned_to",
            "assigned_to_email",
            "next_follow_up_at",
            "proposal_note",
            "quoted_total",
            "accepted_at",
            "fulfilled_at",
            "items",
            "created_at",
            "updated_at",
        ]
        read_only_fields = fields


class QuotePublicAccessSerializer(serializers.Serializer):
    """Credenciais mínimas para consultar o estado de uma cotação."""

    public_id = serializers.CharField(max_length=24)
    access_token = serializers.CharField(min_length=32, max_length=128, trim_whitespace=False)


class QuotePublicStatusSerializer(serializers.ModelSerializer):
    """Resposta pública sem dados pessoais, comerciais ou internos."""

    item_count = serializers.SerializerMethodField()

    class Meta:
        model = QuoteRequest
        fields = ["public_id", "status", "item_count", "created_at", "updated_at"]
        read_only_fields = fields

    def get_item_count(self, obj) -> int:
        return obj.items.count()


class QuoteStatusSerializer(serializers.Serializer):
    """Atualização de estado (quotes:manage)."""

    status = serializers.ChoiceField(choices=QuoteStatus.choices)
    note = serializers.CharField(max_length=255, required=False, allow_blank=True)


class QuoteProposalSerializer(serializers.Serializer):
    """Registo da proposta comercial (quotes:manage)."""

    quoted_total = serializers.DecimalField(max_digits=12, decimal_places=2, required=False)
    proposal_note = serializers.CharField(max_length=2000, required=False, allow_blank=True)


class QuoteTaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteTask
        fields = ["id", "quote", "title", "assigned_to", "due_at", "status", "completed_at"]
        read_only_fields = ["id", "quote", "completed_at"]
