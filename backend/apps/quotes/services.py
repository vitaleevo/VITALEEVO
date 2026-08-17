"""Regras de negócio das cotações — SOLID: criação com transação, auditoria e notificação."""
import secrets

from django.db import transaction
from django.utils import timezone

from apps.audit.helpers import log_audit

from .models import QuoteItem, QuoteRequest, QuoteStatus
from .tasks import send_quote_notification


def generate_public_id() -> str:
    """Identificador público curto e legível (ex.: VL-4F7K2A)."""
    while True:
        public_id = f"VL-{secrets.token_hex(3).upper()}"
        if not QuoteRequest.objects.filter(public_id=public_id).exists():
            return public_id


@transaction.atomic
def create_quote_request(
    *,
    name: str,
    email: str,
    phone: str,
    company: str = "",
    message: str = "",
    items: list[dict] | None = None,
    source: str = "site",
    actor=None,
    ip_address: str | None = None,
) -> QuoteRequest:
    """Cria pedido de cotação com itens, auditoria e notificação por e-mail (fila)."""
    quote = QuoteRequest.objects.create(
        public_id=generate_public_id(),
        name=name,
        email=email,
        phone=phone,
        company=company,
        message=message,
        source=source,
    )
    for item in items or []:
        QuoteItem.objects.create(quote=quote, **item)

    log_audit(
        user=actor,
        action="quote.create",
        resource_type="quote",
        resource_id=str(quote.id),
        details={"public_id": quote.public_id, "items": len(items)},
        ip_address=ip_address,
    )

    send_quote_notification.delay(str(quote.id))
    return quote


@transaction.atomic
def update_quote_status(quote: QuoteRequest, status: str, actor, note: str = "") -> QuoteRequest:
    """Muda o estado da cotação (regras de timestamps para aceite/concluída)."""
    if status == QuoteStatus.ACCEPTED and quote.status != QuoteStatus.ACCEPTED:
        quote.accepted_at = quote.accepted_at or timezone.now()
    if status == QuoteStatus.FULFILLED and quote.status != QuoteStatus.FULFILLED:
        quote.fulfilled_at = quote.fulfilled_at or timezone.now()
    quote.status = status
    if note:
        quote.proposal_note = note
    quote.save()

    log_audit(
        user=actor,
        action=f"quote.status.{status}",
        resource_type="quote",
        resource_id=str(quote.id),
        details={"note": note},
    )
    return quote