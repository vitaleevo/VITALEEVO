"""Comércio: carrinho, encomendas, moradas, wishlist e notificações.

Espelha convex/schema.ts (cartItems, orders, addresses, wishlist, notifications).
"""
import secrets
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
    subtotal = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    total = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    shipping_address = models.JSONField(default=dict, blank=True)
    payment_method = models.CharField(max_length=40, blank=True)
    payment_reference = models.CharField(max_length=120, blank=True)
    access_token = models.CharField(max_length=64, unique=True, default=generate_access_token)
    notes = models.TextField(blank=True)

    class Meta(BaseModel.Meta):
        verbose_name = "encomenda"
        verbose_name_plural = "encomendas"
        indexes = [models.Index(fields=["status"]), models.Index(fields=["guest_email"])]

    def __str__(self):
        return f"{self.order_number} ({self.status})"

    @property
    def display_email(self) -> str:
        return self.guest_email or (self.user.email if self.user else "")


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