"""Regras de negócio do catálogo — SOLID: views chamam serviços, nunca ORM cru."""
from django.db import transaction
from django.utils import timezone

from apps.audit.helpers import log_audit

from .models import InventoryMovement, InventoryMovementType, Product


@transaction.atomic
def adjust_stock(*, product: Product, quantity: int, actor, movement_type: str, note: str = ""):
    """Ajusta o stock com movimento registado e auditoria (transação única).

    Quantidade relativa (+5/-3): o movimento guarda o delta e o stock é atualizado.
    """
    if quantity == 0:
        raise ValueError("Quantidade não pode ser zero")

    product.stock = max(0, product.stock + quantity)
    product.save(update_fields=["stock", "updated_at"])

    InventoryMovement.objects.create(
        product=product,
        actor=actor,
        type=movement_type,
        quantity=quantity,
        note=note,
    )

    log_audit(
        user=actor,
        action=f"stock.{movement_type}",
        resource_type="product",
        resource_id=str(product.id),
        details={"quantity": quantity, "note": note, "new_stock": product.stock},
    )

    return product.stock


def publish_product(product: Product, actor) -> None:
    """Publica um produto e regista o momento de publicação."""
    product.status = "published"
    if not product.published_at:
        product.published_at = timezone.now()
    product.save(update_fields=["status", "published_at", "updated_at"])
    log_audit(user=actor, action="product.publish", resource_type="product", resource_id=str(product.id))