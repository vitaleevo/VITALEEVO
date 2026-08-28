"""Regras de negócio das cotações — criação, acesso público e notificações."""
import hashlib
import hmac
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


def generate_public_access_token() -> str:
    """Token de capacidade devolvido uma única vez ao autor da cotação."""
    return secrets.token_urlsafe(32)


def hash_public_access_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def public_access_token_matches(quote: QuoteRequest, token: str) -> bool:
    if not quote.public_access_token_hash or not token:
        return False
    return hmac.compare_digest(
        quote.public_access_token_hash,
        hash_public_access_token(token),
    )


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
    access_token = generate_public_access_token()
    item_data = items or []
    quote = QuoteRequest.objects.create(
        public_id=generate_public_id(),
        public_access_token_hash=hash_public_access_token(access_token),
        name=name,
        email=email,
        phone=phone,
        company=company,
        message=message,
        source=source,
    )
    for item in item_data:
        QuoteItem.objects.create(quote=quote, **item)

    log_audit(
        user=actor,
        action="quote.create",
        resource_type="quote",
        resource_id=str(quote.id),
        details={"public_id": quote.public_id, "items": len(item_data)},
        ip_address=ip_address,
    )

    quote_id = str(quote.id)
    transaction.on_commit(lambda: send_quote_notification.delay(quote_id))
    quote.public_access_token = access_token
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
