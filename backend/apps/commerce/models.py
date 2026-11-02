"""Comércio: carrinho, encomendas, pagamentos, reconciliação e conta do cliente."""
import secrets
import uuid
from decimal import Decimal

from django.conf import settings
from django.db import models

from apps.catalog.models import Product
from apps.core.models import BaseModel


class OrderStatus(models.TextChoices):
    PENDING = "pending", "Pendente"
    PAID = "paid", "Pago"
    PROCESSING = "processing", "Em processamento"
    SHIPPED = "shipped", "Enviado"
    DELIVERED = "delivered", "Entregue"
    CANCELLED = "cancelled", "Cancelado"
    EXPIRED = "expired", "Expirado"


class PaymentProvider(models.TextChoices):
    BANK_TRANSFER = "bank_transfer", "Transferência bancária"
    PROXYPAY_RPS = "proxypay_rps", "ProxyPay Referência MULTICAIXA"
    PROXYPAY_OPG = "proxypay_opg", "MULTICAIXA Express"


class PaymentStatus(models.TextChoices):
    PENDING = "pending", "Pendente"
    AWAITING = "awaiting", "A aguardar pagamento"
    PAID = "paid", "Pago"
    FAILED = "failed", "Falhou"
    CANCELLED = "cancelled", "Cancelado"
    EXPIRED = "expired", "Expirado"
    REFUNDED = "refunded", "Reembolsado"


class ReconciliationStatus(models.TextChoices):
    PENDING = "pending", "Pendente"
    MATCHED = "matched", "Conciliado"
    MISMATCH = "mismatch", "Divergência"
    DUPLICATE = "duplicate", "Duplicado"
    IGNORED = "ignored", "Ignorado"


def generate_order_number() -> str:
    return f"VE-{secrets.randbelow(90000) + 10000}"


def generate_access_token() -> str:
    return secrets.token_hex(24)


class Address(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="addresses")
    label = models.CharField(max_length=40, default="Casa")
    name = models.CharField(max_length=160)
    phone = models.CharField(max_length=30)
    city = models.CharField(max_length=120)
    address = models.CharField(max_length=255)
    reference = models.CharField(max_length=120, blank=True)
    is_default = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        verbose_name = "morada"
        verbose_name_plural = "moradas"

    def __str__(self):
        return f"{self.label}: {self.name} — {self.city}"


class WishlistItem(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="wishlist_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="wishlist_items")

    class Meta(BaseModel.Meta):
        verbose_name = "item de wishlist"
        verbose_name_plural = "wishlist"
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_wishlist_user_product")]

    def __str__(self):
        return f"{self.user.email} → {self.product.name}"


class NotificationType(models.TextChoices):
    ORDER = "order", "Encomenda"
    PROMO = "promo", "Promoção"
    SYSTEM = "system", "Sistema"


class Notification(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications")
    title = models.CharField(max_length=160)
    message = models.TextField(blank=True)
    type = models.CharField(max_length=20, choices=NotificationType.choices, default=NotificationType.SYSTEM)
    is_read = models.BooleanField(default=False, db_index=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "notificação"
        verbose_name_plural = "notificações"
        indexes = [models.Index(fields=["user", "is_read"])]

    def __str__(self):
        return f"[{self.user.email}] {self.title}"


class CartItem(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="cart_items")
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name="cart_items")
    quantity = models.PositiveIntegerField(default=1)

    class Meta(BaseModel.Meta):
        verbose_name = "item de carrinho"
        verbose_name_plural = "carrinho"
        constraints = [models.UniqueConstraint(fields=["user", "product"], name="unique_cart_user_product")]

    def __str__(self):
        return f"{self.user.email} → {self.product.name} x{self.quantity}"


class Order(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name="orders")
    guest_email = models.EmailField(blank=True)
    guest_name = models.CharField(max_length=160, blank=True)
    order_number = models.CharField(max_length=20, unique=True, default=generate_order_number)
    status = models.CharField(max_length=20, choices=OrderStatus.choices, default=OrderStatus.PENDING, db_index=True)
    currency = models.CharField(max_length=3, default="AOA")
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=Decimal("14.00"))
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    prices_include_tax = models.BooleanField(default=True)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_address = models.JSONField(default=dict, blank=True)
    payment_method = models.CharField(max_length=40, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    access_token = models.CharField(max_length=64, unique=True, default=generate_access_token)
    notes = models.TextField(blank=True)
    expires_at = models.DateTimeField(null=True, blank=True, db_index=True)
    paid_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "encomenda"
        verbose_name_plural = "encomendas"
        indexes = [models.Index(fields=["status"]), models.Index(fields=["guest_email"])]

    def __str__(self):
        return f"{self.order_number} ({self.status})"

    @property
    def display_email(self) -> str:
        return self.guest_email or (self.user.email if self.user else "")

    @property
    def net_total(self) -> Decimal:
        return self.total - self.tax_amount


class OrderItem(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name="items")
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, blank=True, related_name="order_items")
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=12, decimal_places=2)
    quantity = models.PositiveIntegerField(default=1)
    image = models.URLField(blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "linha de encomenda"
        verbose_name_plural = "linhas de encomenda"

    def __str__(self):
        return f"{self.order.order_number} — {self.name} x{self.quantity}"

    @property
    def line_total(self) -> Decimal:
        return self.price * self.quantity


class Payment(BaseModel):
    order = models.ForeignKey(Order, on_delete=models.PROTECT, related_name="payments")
    provider = models.CharField(max_length=30, choices=PaymentProvider.choices)
    status = models.CharField(max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=3, default="AOA")
    idempotency_key = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)
    provider_payment_id = models.CharField(max_length=80, blank=True, db_index=True)
    entity_id = models.CharField(max_length=10, blank=True)
    reference_number = models.CharField(max_length=30, blank=True)
    qrcode_url = models.URLField(blank=True, max_length=500)
    deeplink = models.TextField(blank=True)
    deeplink_redirect = models.URLField(blank=True, max_length=500)
    mobile = models.CharField(max_length=20, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    paid_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.CharField(max_length=255, blank=True)
    provider_payload = models.JSONField(default=dict, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "pagamento"
        verbose_name_plural = "pagamentos"
        indexes = [
            models.Index(fields=["provider", "status"]),
            models.Index(fields=["order", "status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["provider", "provider_payment_id"],
                condition=~models.Q(provider_payment_id=""),
                name="unique_provider_payment_id",
            )
        ]

    def __str__(self):
        return f"{self.order.order_number} — {self.provider} — {self.status}"


class PaymentEvent(BaseModel):
    payment = models.ForeignKey(Payment, on_delete=models.SET_NULL, null=True, blank=True, related_name="events")
    provider = models.CharField(max_length=30, choices=PaymentProvider.choices)
    event_id = models.CharField(max_length=100)
    event_type = models.CharField(max_length=40, blank=True)
    amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    signature_valid = models.BooleanField(default=False)
    reconciliation_status = models.CharField(
        max_length=20,
        choices=ReconciliationStatus.choices,
        default=ReconciliationStatus.PENDING,
        db_index=True,
    )
    reconciliation_note = models.CharField(max_length=255, blank=True)
    payload = models.JSONField(default=dict)
    processed_at = models.DateTimeField(null=True, blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "evento de pagamento"
        verbose_name_plural = "eventos de pagamento"
        constraints = [
            models.UniqueConstraint(fields=["provider", "event_id"], name="unique_payment_provider_event")
        ]

    def __str__(self):
        return f"{self.provider}:{self.event_id} ({self.reconciliation_status})"
