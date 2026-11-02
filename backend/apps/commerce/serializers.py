"""Serializers do comércio: conta, checkout, pagamentos e reconciliação."""
from rest_framework import serializers

from apps.catalog.models import Product

from .models import (
    Address,
    CartItem,
    Notification,
    Order,
    OrderItem,
    OrderStatus,
    Payment,
    PaymentEvent,
    PaymentProvider,
    WishlistItem,
)


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ["id", "label", "name", "phone", "city", "address", "reference", "is_default", "created_at"]
        read_only_fields = ["id", "created_at"]


class ProductMiniSerializer(serializers.ModelSerializer):
    stock = serializers.IntegerField(source="available_stock", read_only=True)

    class Meta:
        model = Product
        fields = ["id", "slug", "name", "image", "price", "stock"]
        read_only_fields = fields


class WishlistItemSerializer(serializers.ModelSerializer):
    product = ProductMiniSerializer(read_only=True)

    class Meta:
        model = WishlistItem
        fields = ["id", "product", "created_at"]
        read_only_fields = ["id", "created_at"]


class WishlistWriteSerializer(serializers.ModelSerializer):
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
    stock = serializers.IntegerField(source="product.available_stock", read_only=True)

    class Meta:
        model = CartItem
        fields = ["id", "product_slug", "name", "price", "image", "stock", "quantity"]
        read_only_fields = ["id"]

    def validate(self, attrs):
        product = attrs.get("product", getattr(self.instance, "product", None))
        quantity = attrs.get("quantity", getattr(self.instance, "quantity", 1))
        if product and quantity > product.available_stock:
            raise serializers.ValidationError(
                {"quantity": f"Stock insuficiente. Disponível: {product.available_stock}."}
            )
        return attrs


class OrderItemReadSerializer(serializers.ModelSerializer):
    product_id = serializers.UUIDField(source="product.id", read_only=True, allow_null=True)
    line_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = OrderItem
        fields = ["product_id", "name", "price", "quantity", "line_total", "image"]
        read_only_fields = fields


class PaymentReadSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = [
            "id",
            "provider",
            "status",
            "amount",
            "currency",
            "entity_id",
            "reference_number",
            "qrcode_url",
            "deeplink",
            "deeplink_redirect",
            "expires_at",
            "paid_at",
            "failure_reason",
            "created_at",
        ]
        read_only_fields = fields


class OrderReadSerializer(serializers.ModelSerializer):
    """Encomenda visível ao cliente; não expõe o token secreto de acesso."""

    items = OrderItemReadSerializer(many=True, read_only=True)
    payments = PaymentReadSerializer(many=True, read_only=True)
    net_total = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "order_number",
            "status",
            "currency",
            "subtotal",
            "shipping",
            "tax_rate",
            "tax_amount",
            "prices_include_tax",
            "net_total",
            "total",
            "shipping_address",
            "payment_method",
            "payment_reference",
            "notes",
            "guest_email",
            "guest_name",
            "expires_at",
            "paid_at",
            "created_at",
            "updated_at",
            "items",
            "payments",
        ]
        read_only_fields = fields


class OrderAdminSerializer(OrderReadSerializer):
    user_email = serializers.EmailField(source="user.email", read_only=True)

    class Meta(OrderReadSerializer.Meta):
        fields = OrderReadSerializer.Meta.fields + ["user_email", "is_active"]
        read_only_fields = fields


class OrderItemWriteSerializer(serializers.Serializer):
    slug = serializers.SlugField()
    quantity = serializers.IntegerField(min_value=1, max_value=999)


class CheckoutPreviewSerializer(serializers.Serializer):
    items = OrderItemWriteSerializer(many=True, min_length=1)

    def validate_items(self, items):
        from .services import _normalize_items

        return _normalize_items(items)


class OrderCreateSerializer(CheckoutPreviewSerializer):
    guest_email = serializers.EmailField(required=False, allow_blank=True)
    guest_name = serializers.CharField(required=False, allow_blank=True, max_length=160)
    shipping_address = serializers.JSONField()
    payment_method = serializers.ChoiceField(choices=PaymentProvider.choices, default=PaymentProvider.BANK_TRANSFER)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=2000)

    def validate_shipping_address(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Morada inválida.")
        required = ["name", "phone", "city", "address"]
        missing = [field for field in required if not str(value.get(field, "")).strip()]
        if missing:
            raise serializers.ValidationError(f"Campos obrigatórios: {', '.join(missing)}.")
        return {key: value[key] for key in value if key in {"name", "phone", "city", "address", "reference"}}

    def validate(self, attrs):
        request = self.context["request"]
        if not request.user.is_authenticated:
            if not attrs.get("guest_email"):
                raise serializers.ValidationError({"guest_email": "Email é obrigatório para compras sem sessão."})
            if not attrs.get("guest_name"):
                raise serializers.ValidationError({"guest_name": "Nome é obrigatório para compras sem sessão."})
        return attrs

    def create(self, validated_data):
        from .services import create_order

        return create_order(user=self.context["request"].user, **validated_data)


class PaymentInitSerializer(serializers.Serializer):
    provider = serializers.ChoiceField(choices=PaymentProvider.choices)
    access_token = serializers.CharField(required=False, allow_blank=True, max_length=64, write_only=True)


class PaymentAdminSerializer(PaymentReadSerializer):
    order_number = serializers.CharField(source="order.order_number", read_only=True)
    provider_payment_id = serializers.CharField(read_only=True)
    event_count = serializers.IntegerField(source="events.count", read_only=True)

    class Meta(PaymentReadSerializer.Meta):
        fields = PaymentReadSerializer.Meta.fields + ["order_number", "provider_payment_id", "event_count"]
        read_only_fields = fields


class OrderStatusSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=OrderStatus.choices)


class PaymentEventSerializer(serializers.ModelSerializer):
    order_number = serializers.CharField(source="payment.order.order_number", read_only=True, allow_null=True)

    class Meta:
        model = PaymentEvent
        fields = [
            "id",
            "provider",
            "event_id",
            "event_type",
            "amount",
            "signature_valid",
            "reconciliation_status",
            "reconciliation_note",
            "order_number",
            "processed_at",
            "created_at",
        ]
        read_only_fields = fields
