"""Serviços do comércio: pricing, reservas de stock e ciclo de encomendas."""
from datetime import timedelta
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.audit.helpers import log_audit
from apps.catalog.models import InventoryMovement, InventoryMovementType, Product

from .models import CartItem, Notification, NotificationType, Order, OrderItem, OrderStatus

MONEY = Decimal("0.01")
HUNDRED = Decimal("100")


def money(value) -> Decimal:
    return Decimal(str(value)).quantize(MONEY, rounding=ROUND_HALF_UP)


def get_commerce_config() -> dict:
    """Configuração comercial centralizada; CMS pode sobrepor os defaults."""
    from apps.cms.models import Setting

    defaults = {
        "currency": "AOA",
        "shippingFee": "1000.00",
        "freeShippingThreshold": "200000.00",
        "taxRate": "14.00",
        "pricesIncludeTax": True,
        "reservationMinutes": 30,
    }
    setting = Setting.objects.filter(key="site_config").first()
    if not setting or not isinstance(setting.value, dict):
        return defaults

    value = setting.value
    business = value.get("businessConfig", {}) or {}
    merged = {**defaults, **business}
    merged["currency"] = str(value.get("currency") or business.get("currency") or defaults["currency"]).upper()
    return merged


def _normalize_items(items: list[dict]) -> list[dict]:
    aggregated: dict[str, int] = {}
    order: list[str] = []
    for item in items:
        slug = str(item["slug"]).strip()
        quantity = int(item["quantity"])
        if slug not in aggregated:
            order.append(slug)
            aggregated[slug] = 0
        aggregated[slug] += quantity
        if aggregated[slug] > 999:
            raise ValidationError({"items": [f"Quantidade máxima excedida para {slug}."]})
    return [{"slug": slug, "quantity": aggregated[slug]} for slug in order]


def resolve_checkout_items(items: list[dict], *, lock: bool = False) -> list[dict]:
    normalized = _normalize_items(items)
    slugs = [item["slug"] for item in normalized]
    queryset = Product.objects.filter(slug__in=slugs, is_active=True, status="published").order_by("id")
    if lock:
        queryset = queryset.select_for_update()
    products = {product.slug: product for product in queryset}

    missing = [slug for slug in slugs if slug not in products]
    if missing:
        raise ValidationError({"items": [f"Produtos indisponíveis: {', '.join(missing)}"]})

    resolved = []
    for item in normalized:
        product = products[item["slug"]]
        available = product.available_stock
        if item["quantity"] > available:
            raise ValidationError(
                {
                    "items": [
                        f"Stock insuficiente para {product.name}: solicitado {item['quantity']}, disponível {available}."
                    ]
                }
            )
        resolved.append({"product": product, "quantity": item["quantity"], "available_stock": available})
    return resolved


def calculate_pricing(resolved_items: list[dict]) -> dict:
    config = get_commerce_config()
    tax_rate = Decimal(str(config.get("taxRate", "14.00")))
    if tax_rate < 0 or tax_rate > 100:
        raise ValidationError({"tax": "Taxa de IVA configurada é inválida."})
    prices_include_tax = bool(config.get("pricesIncludeTax", True))
    shipping_fee = money(config.get("shippingFee", "1000.00"))
    free_threshold = money(config.get("freeShippingThreshold", "200000.00"))

    subtotal = money(sum((item["product"].price * item["quantity"] for item in resolved_items), Decimal("0")))
    shipping = Decimal("0.00") if subtotal >= free_threshold else shipping_fee
    taxable_amount = subtotal + shipping
    rate = tax_rate / HUNDRED

    if prices_include_tax:
        total = money(taxable_amount)
        tax_amount = money(total - (total / (Decimal("1") + rate))) if tax_rate else Decimal("0.00")
    else:
        tax_amount = money(taxable_amount * rate)
        total = money(taxable_amount + tax_amount)

    lines = [
        {
            "slug": item["product"].slug,
            "name": item["product"].name,
            "sku": item["product"].sku,
            "image": item["product"].image,
            "unit_price": money(item["product"].price),
            "quantity": item["quantity"],
            "line_total": money(item["product"].price * item["quantity"]),
            "available_stock": item["available_stock"],
            "max_quantity": item["available_stock"],
        }
        for item in resolved_items
    ]
    return {
        "currency": str(config.get("currency", "AOA")),
        "subtotal": subtotal,
        "shipping": shipping,
        "tax_rate": money(tax_rate),
        "tax_amount": tax_amount,
        "prices_include_tax": prices_include_tax,
        "total": total,
        "items": lines,
    }


def preview_order(items: list[dict]) -> dict:
    return calculate_pricing(resolve_checkout_items(items, lock=False))


@transaction.atomic
def create_order(
    *,
    user,
    items,
    shipping_address,
    guest_email="",
    guest_name="",
    payment_method="bank_transfer",
    notes="",
):
    """Cria encomenda com snapshot de preço e reserva stock, sem consumir stock físico."""
    resolved = resolve_checkout_items(items, lock=True)
    pricing = calculate_pricing(resolved)
    config = get_commerce_config()
    reservation_minutes = max(5, min(int(config.get("reservationMinutes", 30)), 1440))
    authenticated = bool(user and user.is_authenticated)

    order = Order.objects.create(
        user=user if authenticated else None,
        guest_email=guest_email.strip() or (user.email if authenticated else ""),
        guest_name=guest_name.strip() or (getattr(user, "full_name", "") if authenticated else ""),
        currency=pricing["currency"],
        subtotal=pricing["subtotal"],
        shipping=pricing["shipping"],
        tax_rate=pricing["tax_rate"],
        tax_amount=pricing["tax_amount"],
        prices_include_tax=pricing["prices_include_tax"],
        total=pricing["total"],
        shipping_address=shipping_address,
        payment_method=payment_method,
        notes=notes,
        expires_at=timezone.now() + timedelta(minutes=reservation_minutes),
    )

    for item in resolved:
        product = item["product"]
        quantity = item["quantity"]
        product.reserved_stock += quantity
        product.save(update_fields=["reserved_stock", "updated_at"])
        OrderItem.objects.create(
            order=order,
            product=product,
            name=product.name,
            price=product.price,
            quantity=quantity,
            image=product.image,
        )
        InventoryMovement.objects.create(
            product=product,
            actor=user if authenticated else None,
            type=InventoryMovementType.RESERVED,
            quantity=-quantity,
            note=f"Reserva da encomenda {order.order_number}",
        )

    if authenticated:
        CartItem.objects.filter(user=user).delete()
        notify_order(
            user,
            order,
            "Encomenda criada",
            f"A sua encomenda {order.order_number} foi recebida e aguarda pagamento.",
        )
    return order


def _products_for_order(order: Order) -> dict:
    product_ids = [item.product_id for item in order.items.all() if item.product_id]
    products = Product.objects.select_for_update().filter(pk__in=product_ids).order_by("id")
    return {product.pk: product for product in products}


def _release_reservation(order: Order, actor=None) -> None:
    products = _products_for_order(order)
    for item in order.items.all():
        product = products.get(item.product_id)
        if not product:
            continue
        if product.reserved_stock < item.quantity:
            raise ValidationError({"stock": f"Reserva inconsistente para {product.name}."})
        product.reserved_stock -= item.quantity
        product.save(update_fields=["reserved_stock", "updated_at"])
        InventoryMovement.objects.create(
            product=product,
            actor=actor,
            type=InventoryMovementType.RELEASED,
            quantity=item.quantity,
            note=f"Libertação da reserva {order.order_number}",
        )


def _commit_reservation(order: Order, actor=None) -> None:
    products = _products_for_order(order)
    for item in order.items.all():
        product = products.get(item.product_id)
        if not product:
            continue
        if product.reserved_stock < item.quantity or product.stock < item.quantity:
            raise ValidationError({"stock": f"Stock inconsistente para concluir {product.name}."})
        product.reserved_stock -= item.quantity
        product.stock -= item.quantity
        product.save(update_fields=["stock", "reserved_stock", "updated_at"])
        InventoryMovement.objects.create(
            product=product,
            actor=actor,
            type=InventoryMovementType.FULFILLED,
            quantity=-item.quantity,
            note=f"Venda concluída na encomenda {order.order_number}",
        )


ALLOWED_TRANSITIONS = {
    OrderStatus.PENDING: {OrderStatus.PAID, OrderStatus.CANCELLED, OrderStatus.EXPIRED},
    OrderStatus.PAID: {OrderStatus.PROCESSING},
    OrderStatus.PROCESSING: {OrderStatus.SHIPPED},
    OrderStatus.SHIPPED: {OrderStatus.DELIVERED},
    OrderStatus.DELIVERED: set(),
    OrderStatus.CANCELLED: set(),
    OrderStatus.EXPIRED: set(),
}


@transaction.atomic
def update_order_status(order: Order, new_status: str, actor=None) -> Order:
    """Aplica máquina de estados e mantém reserva/stock consistentes."""
    locked_order = Order.objects.select_for_update().prefetch_related("items").get(pk=order.pk)
    previous_status = locked_order.status
    if new_status == previous_status:
        return locked_order
    if new_status not in ALLOWED_TRANSITIONS.get(previous_status, set()):
        raise ValidationError({"status": f"Transição inválida: {previous_status} → {new_status}."})

    if new_status in {OrderStatus.CANCELLED, OrderStatus.EXPIRED}:
        _release_reservation(locked_order, actor=actor)
    elif new_status == OrderStatus.PAID:
        _commit_reservation(locked_order, actor=actor)
        locked_order.paid_at = timezone.now()

    locked_order.status = new_status
    update_fields = ["status", "updated_at"]
    if new_status == OrderStatus.PAID:
        update_fields.append("paid_at")
    locked_order.save(update_fields=update_fields)

    log_audit(
        user=actor,
        action=f"order.status.{new_status}",
        resource_type="order",
        resource_id=str(locked_order.id),
        details={"order_number": locked_order.order_number, "previous_status": previous_status},
    )
    if locked_order.user:
        labels = dict(OrderStatus.choices)
        notify_order(
            locked_order.user,
            locked_order,
            f"Encomenda {labels[new_status].lower()}",
            f"A encomenda {locked_order.order_number} mudou para {labels[new_status].lower()}.",
        )
    return locked_order


def expire_order_if_needed(order: Order, actor=None) -> Order:
    if order.status == OrderStatus.PENDING and order.expires_at and order.expires_at <= timezone.now():
        return update_order_status(order, OrderStatus.EXPIRED, actor=actor)
    return order


def notify_order(user, order: Order, title: str, message: str) -> Notification:
    return Notification.objects.create(
        user=user,
        title=title,
        message=message,
        type=NotificationType.ORDER,
        metadata={"orderId": str(order.id), "orderNumber": order.order_number},
    )
