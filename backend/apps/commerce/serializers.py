"""Serializers do comércio — conta do cliente, checkout e gestão de encomendas."""
from decimal import Decimal

from rest_framework import serializers

from apps.catalog.models import Product

from .models import Address, CartItem, Notification, Order, OrderItem, OrderStatus, WishlistItem


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "name", "phone", "city", "address", "reference", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]


class WishlistItemSerializer(serializers.ModelSerializer):
    product = serializers.SlugRelatedField(slug_field="slug", queryset=Product.objects.all())

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]
        read_only_fields = ["id", "created_at"]


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ["id", "title", "message", "type", "is_read", "metadata", "created_at"]
        read_only_fields = ["id", "created_at"]


class CartItemSerializer(serializers.ModelSerializer):
    product_slug = serializers.SlugRelatedField(slug_field="slug", queryset=Product.objects.all(), source="product")
    name = serializers.CharField(source="product.name", read_only=True)
    price = serializers.DecimalField(source="product.price", max_digits=12, decimal_places=2, read_only=True)
    image = serializers.URLField(source="product.image", read_only=True)
    stock = serializers.IntegerField(source="product.stock", read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product_slug", "name", "price", "image", "stock", "quantity"]
        read_only_fields = ["id"]


class OrderItemReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["name", "price", "quantity", "image"]
        read_only_fields = fields


class OrderReadSerializer(serializers.ModelSerializer):
    """Encomenda visível ao cliente / público com token."""

    items = OrderItemReadSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "subtotal",
            "shipping",
            "total",
            "shipping_address",
            "payment_method",
            "payment_reference",
            "notes",
            "guest_email",
            "guest_name",
            "created_at",
            "updated_at",
            "items",
        ]
        read_only_fields = fields


class OrderAdminSerializer(OrderReadSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta(OrderReadSerializer.Meta):
        fields = OrderReadSerializer.Meta.fields + ["user_email", "is_active"]
        read_only_fields = fields


class OrderItemWriteSerializer(serializers.Serializer):
    """Linha do checkout — produto por slug + quantidade."""

    slug = serializers.SlugField()
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class OrderCreateSerializer(serializers.Serializer):
    """Checkout — calcula totais a partir dos produtos (fonte de verdade no servidor)."""

    items = OrderItemWriteSerializer(many=True, min_length=1)
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_name = serializers.CharField(required=False, allow_blank=True, max_length=160)
    shipping_address = serializers.JSONField()
    payment_method = serializers.CharField(max_length=40, required=False, allow_blank=True)
    payment_reference = serializers.CharField(max_length=120, required=False, allow_blank=True)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate_items(self, items):
        slugs = [i["slug"] for i in items]
        products = {p.slug: p for p in Product.objects.filter(slug__in=slugs, is_active=True, status="published")}
        missing = [s for s in slugs if s not in products]
        if missing:
            raise serializers.ValidationError(f"Produtos indisponíveis: {', '.join(missing)}")
        resolved = []
        for item in items:
            product = products[item["slug"]]
            if product.stock < item["quantity"]:
                raise serializers.ValidationError(f"Stock insuficiente para {product.name}")
            resolved.append({"product": product, "quantity": item["quantity"]})
        return resolved

    def create(self, validated_data):
        from .services import create_order

        return create_order(user=self.context["request"].user, **validated_data)


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices)