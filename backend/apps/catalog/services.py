"""Regras de negócio do catálogo — SOLID: views chamam serviços, nunca ORM cru."""
from django.db import transaction
from django.utils import timezone
from rest_framework.exceptions import ValidationError

from apps.audit.helpers import log_audit

from .models import InventoryMovement, InventoryMovementType, Product


@transaction.atomic
def adjust_stock(*, product: Product, quantity: int, actor, movement_type: str, note: str = ""):
    """Ajusta o stock com movimento registado e auditoria (transação única).

    Quantidade relativa (+5/-3): o movimento guarda o delta e o stock é atualizado.
    """
    if quantity == 0:
        raise ValueError("Quantidade não pode ser zero")

    locked_product = Product.objects.select_for_update().get(pk=product.pk)
    new_stock = locked_product.stock + quantity
    if new_stock < 0:
        raise ValidationError(
            {"quantity": f"Stock insuficiente (disponível {locked_product.stock})."}
        )

    locked_product.stock = new_stock
    locked_product.save(update_fields=["stock", "updated_at"])

    InventoryMovement.objects.create(
        product=locked_product,
        actor=actor,
        type=movement_type,
        quantity=quantity,
        note=note,
    )

    log_audit(
        user=actor,
        action=f"stock.{movement_type}",
        resource_type="product",
        resource_id=str(locked_product.id),
        details={"quantity": quantity, "note": note, "new_stock": new_stock},
    )

    product.stock = new_stock
    return new_stock


def publish_product(product: Product, actor) -> None:
    """Publica um produto e regista o momento de publicação."""
    product.status = "published"
    if not product.published_at:
        product.published_at = timezone.now()
    product.save(update_fields=["status", "published_at", "updated_at"])
    log_audit(user=actor, action="product.publish", resource_type="product", resource_id=str(product.id))
