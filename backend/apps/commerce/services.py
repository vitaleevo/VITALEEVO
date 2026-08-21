"""Serviços do comércio — lógica de negócio fora das views."""
from decimal import Decimal

from django.db import transaction
from django.db.models import F
from rest_framework.exceptions import ValidationError

from apps.audit.helpers import log_audit
from apps.catalog.models import Product

from .models import Notification, NotificationType, Order, OrderItem, OrderStatus


def create_order(*, user, items, shipping_address, guest_email="", guest_name="", payment_method="", payment_reference="", notes=""):
    """Cria a encomenda com preços do servidor, stock reservado (atómico) e notificação."""
    from apps.cms.models import Setting

    config = {}
    setting = Setting.objects.filter(key="site_config").first()
    if setting and isinstance(setting.value, dict):
        config = setting.value.get("businessConfig", {}) or {}

    shipping_fee = Decimal(str(config.get("shippingFee", 1000)))
    free_threshold = Decimal(str(config.get("freeShippingThreshold", 200000)))
    subtotal = sum(item["product"].price * item["quantity"] for item in items)
    shipping = Decimal("0") if subtotal >= free_threshold else shipping_fee
    total = subtotal + shipping

    with transaction.atomic():
        # Validação e decremento atómicos com F() + stock__gte evita oversell concorrente
        # (compatível com SQLite dev e PostgreSQL prod — sem select_for_update)
        order = Order.objects.create(
            user=user if (user and user.is_authenticated) else None,
            guest_email=guest_email.strip() or (user.email if user and user.is_authenticated else ""),
            guest_name=guest_name.strip() or (user.full_name if user and user.is_authenticated else ""),
            subtotal=subtotal,
            shipping=shipping,
            total=total,
            shipping_address=shipping_address,
            payment_method=payment_method,
            payment_reference=payment_reference,
            notes=notes,
        )
        for item in items:
            prod = item["product"]
            # Tentativa atómica: só atualiza se stock suficiente
            updated = Product.objects.filter(id=prod.id, stock__gte=item["quantity"]).update(stock=F("stock") - item["quantity"])
            if not updated:
                # recarregar para mensagem precisa
                prod.refresh_from_db()
                raise ValidationError({"items": [f"Stock insuficiente para {prod.name} (disponível {prod.stock})"]})
            # recarregar preço/nome atuais (já em prod) para OrderItem
            OrderItem.objects.create(
                order=order, product=prod, name=prod.name, price=prod.price, quantity=item["quantity"], image=prod.image
            )

        if order.user:
            notify_order(order.user, order, "Encomenda criada", f"A sua encomenda {order.order_number} foi recebida e está pendente.")
        return order


def update_order_status(order: Order, new_status: str, actor=None) -> Order:
    """Muda o estado da encomenda e notifica o cliente."""
    order.status = new_status
    order.save(update_fields=["status", "updated_at"])
    log_audit(
        user=actor,
        action=f"order.status.{new_status}",
        resource_type="order",
        resource_id=str(order.id),
        details={"order_number": order.order_number},
    )
    if order.user:
        labels = dict(OrderStatus.choices)
        notify_order(order.user, order, f"Encomenda {labels[new_status].lower()}", f"A encomenda {order.order_number} mudou para {labels[new_status].lower()}.")
    return order


def notify_order(user, order: Order, title: str, message: str) -> Notification:
    return Notification.objects.create(user=user, title=title, message=message, type=NotificationType.ORDER, metadata={"orderId": str(order.id), "orderNumber": order.order_number})