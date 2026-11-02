"""Gateways de pagamento e reconciliação idempotente.

Integrações suportadas:
- ProxyPay RPS v2: entidade/referência MULTICAIXA.
- ProxyPay OPG v1: charge com QR/deeplink MULTICAIXA Express.
- Transferência bancária: confirmação manual por staff.
"""
import hashlib
import hmac
import json
from datetime import timedelta
from decimal import Decimal
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.db import transaction
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from rest_framework.exceptions import APIException, ValidationError

from .models import (
    Order,
    OrderStatus,
    Payment,
    PaymentEvent,
    PaymentProvider,
    PaymentStatus,
    ReconciliationStatus,
)
from .services import expire_order_if_needed, money, update_order_status


class PaymentGatewayError(APIException):
    status_code = 502
    default_detail = "Gateway de pagamento temporariamente indisponível."
    default_code = "payment_gateway_error"


class PaymentConfigurationError(APIException):
    status_code = 503
    default_detail = "Método de pagamento ainda não está configurado."
    default_code = "payment_not_configured"


def _proxy_base_url() -> str:
    return str(getattr(settings, "PROXYPAY_BASE_URL", "https://api.proxypay.co.ao")).rstrip("/")


def _callback_url(kind: str) -> str:
    base = str(getattr(settings, "PAYMENT_WEBHOOK_BASE_URL", settings.SITE_URL)).rstrip("/")
    return f"{base}/api/v1/commerce/payments/webhook/{kind}/"


def _request_json(method: str, url: str, *, headers: dict | None = None, payload=None, timeout: int = 15):
    request_headers = {"Content-Type": "application/json", **(headers or {})}
    body = json.dumps(payload).encode("utf-8") if payload is not None else None
    request = Request(url, data=body, headers=request_headers, method=method)
    try:
        with urlopen(request, timeout=timeout) as response:
            raw = response.read()
            if not raw:
                return None
            return json.loads(raw.decode("utf-8"))
    except HTTPError as exc:
        try:
            error_body = exc.read().decode("utf-8")
        except Exception:
            error_body = ""
        raise PaymentGatewayError(f"Gateway respondeu HTTP {exc.code}: {error_body[:300]}") from exc
    except (URLError, TimeoutError, OSError) as exc:
        raise PaymentGatewayError("Não foi possível comunicar com o gateway de pagamento.") from exc


def _rps_headers() -> dict:
    api_key = str(getattr(settings, "PROXYPAY_RPS_API_KEY", "")).strip()
    if not api_key:
        raise PaymentConfigurationError("PROXYPAY_RPS_API_KEY não configurada.")
    return {
        "Authorization": f"Token {api_key}",
        "Accept": "application/vnd.proxypay.v2+json",
    }


def _opg_headers(idempotency_key: str | None = None) -> dict:
    token = str(getattr(settings, "PROXYPAY_OPG_TOKEN", "")).strip()
    if not token:
        raise PaymentConfigurationError("PROXYPAY_OPG_TOKEN não configurado.")
    headers = {"Authorization": f"Bearer {token}"}
    if idempotency_key:
        headers["Idempotency-Key"] = idempotency_key
    return headers


def _get_rps_entity_id() -> str:
    entity = str(getattr(settings, "PROXYPAY_ENTITY_ID", "")).strip()
    if not entity:
        raise PaymentConfigurationError("PROXYPAY_ENTITY_ID não configurado.")
    return entity


def _get_opg_pos_id() -> int:
    pos_id = getattr(settings, "PROXYPAY_OPG_POS_ID", 0)
    if not pos_id:
        raise PaymentConfigurationError("PROXYPAY_OPG_POS_ID não configurado.")
    return int(pos_id)


def _format_amount(value: Decimal) -> str:
    return f"{money(value):.2f}"


def _active_payment(order: Order, provider: str) -> Payment | None:
    now = timezone.now()
    candidates = order.payments.filter(
        provider=provider,
        status__in=[PaymentStatus.PENDING, PaymentStatus.AWAITING],
        is_active=True,
    ).order_by("-created_at")
    for payment in candidates:
        if not payment.expires_at or payment.expires_at > now:
            return payment
    return None


def initiate_payment(order: Order, provider: str) -> Payment:
    order = expire_order_if_needed(order)
    if order.status != OrderStatus.PENDING:
        raise ValidationError({"order": "A encomenda já não aceita novos pagamentos."})

    existing = _active_payment(order, provider)
    if existing:
        return existing

    payment = Payment.objects.create(
        order=order,
        provider=provider,
        amount=order.total,
        currency=order.currency,
        expires_at=order.expires_at,
    )

    try:
        if provider == PaymentProvider.BANK_TRANSFER:
            payment.status = PaymentStatus.AWAITING
            payment.save(update_fields=["status", "updated_at"])
        elif provider == PaymentProvider.PROXYPAY_RPS:
            _initiate_rps(payment)
        elif provider == PaymentProvider.PROXYPAY_OPG:
            _initiate_opg_charge(payment)
        else:
            raise ValidationError({"provider": "Método de pagamento inválido."})
    except Exception:
        if payment.pk and payment.status == PaymentStatus.PENDING:
            payment.status = PaymentStatus.FAILED
            payment.save(update_fields=["status", "updated_at"])
        raise

    order.payment_method = provider
    if payment.reference_number:
        order.payment_reference = payment.reference_number
    elif payment.provider_payment_id:
        order.payment_reference = payment.provider_payment_id
    order.save(update_fields=["payment_method", "payment_reference", "updated_at"])
    return payment


def _initiate_rps(payment: Payment) -> None:
    headers = _rps_headers()
    entity_id = _get_rps_entity_id()
    reference_id = _request_json("POST", f"{_proxy_base_url()}/reference_ids", headers=headers)
    if not isinstance(reference_id, int):
        raise PaymentGatewayError("ProxyPay não devolveu um identificador de referência válido.")

    expiry = payment.expires_at or (timezone.now() + timedelta(minutes=30))
    payload = {
        "amount": _format_amount(payment.amount),
        "end_datetime": expiry.isoformat(),
        "custom_fields": {
            "order_number": payment.order.order_number,
            "order_id": str(payment.order_id),
            "callback_url": _callback_url("proxypay-rps"),
        },
    }
    _request_json(
        "PUT",
        f"{_proxy_base_url()}/references/{reference_id}",
        headers=headers,
        payload=payload,
    )
    payment.provider_payment_id = str(reference_id)
    payment.entity_id = entity_id
    payment.reference_number = str(reference_id)
    payment.provider_payload = {"reference_id": reference_id, "entity_id": entity_id}
    payment.status = PaymentStatus.AWAITING
    payment.save(
        update_fields=[
            "provider_payment_id",
            "entity_id",
            "reference_number",
            "provider_payload",
            "status",
            "updated_at",
        ]
    )


def _initiate_opg_charge(payment: Payment) -> None:
    headers = _opg_headers(str(payment.idempotency_key))
    payload = {
        "pos_id": _get_opg_pos_id(),
        "amount": _format_amount(payment.amount),
        "callback_url": _callback_url("proxypay-opg"),
    }
    result = _request_json(
        "POST",
        f"{_proxy_base_url()}/opg/v1/charges",
        headers=headers,
        payload=payload,
    )
    if not isinstance(result, dict) or not result.get("id"):
        raise PaymentGatewayError("ProxyPay OPG não devolveu uma charge válida.")

    payment.provider_payment_id = str(result["id"])
    payment.qrcode_url = str(result.get("qrcode_url") or "")
    payment.deeplink = str(result.get("deeplink") or "")
    payment.deeplink_redirect = str(result.get("deeplink_redirect") or "")
    payment.provider_payload = result
    parsed_expiry = parse_datetime(str(result.get("expires_at") or ""))
    if parsed_expiry:
        payment.expires_at = parsed_expiry
    payment.status = PaymentStatus.AWAITING
    payment.save(
        update_fields=[
            "provider_payment_id",
            "qrcode_url",
            "deeplink",
            "deeplink_redirect",
            "provider_payload",
            "expires_at",
            "status",
            "updated_at",
        ]
    )


def _create_event(*, payment, provider, event_id, event_type, amount, signature_valid, payload) -> tuple[PaymentEvent, bool]:
    try:
        event, created = PaymentEvent.objects.get_or_create(
            provider=provider,
            event_id=str(event_id),
            defaults={
                "payment": payment,
                "event_type": event_type,
                "amount": amount,
                "signature_valid": signature_valid,
                "payload": payload,
            },
        )
        return event, created
    except Exception:
        existing = PaymentEvent.objects.filter(provider=provider, event_id=str(event_id)).first()
        if existing:
            return existing, False
        raise


@transaction.atomic
def mark_payment_paid(payment: Payment, *, event: PaymentEvent | None = None, actor=None) -> Payment:
    locked = Payment.objects.select_for_update().select_related("order").get(pk=payment.pk)
    if locked.status == PaymentStatus.PAID:
        if event and event.reconciliation_status == ReconciliationStatus.PENDING:
            event.reconciliation_status = ReconciliationStatus.DUPLICATE
            event.reconciliation_note = "Pagamento já conciliado anteriormente."
            event.processed_at = timezone.now()
            event.save(update_fields=["reconciliation_status", "reconciliation_note", "processed_at", "updated_at"])
        return locked

    if locked.order.status != OrderStatus.PENDING:
        raise ValidationError({"order": "A encomenda não está pendente de pagamento."})

    locked.status = PaymentStatus.PAID
    locked.paid_at = timezone.now()
    locked.save(update_fields=["status", "paid_at", "updated_at"])
    update_order_status(locked.order, OrderStatus.PAID, actor=actor)

    if event:
        event.payment = locked
        event.reconciliation_status = ReconciliationStatus.MATCHED
        event.reconciliation_note = "Valor e referência conciliados automaticamente."
        event.processed_at = timezone.now()
        event.save(
            update_fields=[
                "payment",
                "reconciliation_status",
                "reconciliation_note",
                "processed_at",
                "updated_at",
            ]
        )
    return locked


def verify_rps_signature(raw_body: bytes, signature: str) -> bool:
    api_key = str(getattr(settings, "PROXYPAY_RPS_API_KEY", "")).strip()
    if not api_key or not signature:
        return False
    expected = hmac.new(api_key.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected.lower(), signature.strip().lower())


def process_rps_webhook(raw_body: bytes, signature: str) -> PaymentEvent:
    if not verify_rps_signature(raw_body, signature):
        raise ValidationError({"signature": "Assinatura ProxyPay inválida."})
    try:
        payload = json.loads(raw_body.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exc:
        raise ValidationError({"payload": "JSON inválido."}) from exc

    reference_id = str(payload.get("reference_id") or "")
    event_id = str(payload.get("id") or "")
    if not reference_id or not event_id:
        raise ValidationError({"payload": "Evento sem reference_id/id."})

    payment = Payment.objects.filter(
        provider=PaymentProvider.PROXYPAY_RPS,
        provider_payment_id=reference_id,
    ).select_related("order").first()
    amount = money(payload.get("amount", "0"))
    event, created = _create_event(
        payment=payment,
        provider=PaymentProvider.PROXYPAY_RPS,
        event_id=event_id,
        event_type="payment",
        amount=amount,
        signature_valid=True,
        payload=payload,
    )
    if not created:
        return event
    if not payment:
        event.reconciliation_status = ReconciliationStatus.MISMATCH
        event.reconciliation_note = "Referência sem pagamento interno correspondente."
        event.processed_at = timezone.now()
        event.save(update_fields=["reconciliation_status", "reconciliation_note", "processed_at", "updated_at"])
        return event
    if amount != payment.amount:
        event.reconciliation_status = ReconciliationStatus.MISMATCH
        event.reconciliation_note = f"Valor recebido {amount} difere do esperado {payment.amount}."
        event.processed_at = timezone.now()
        event.save(update_fields=["reconciliation_status", "reconciliation_note", "processed_at", "updated_at"])
        return event

    mark_payment_paid(payment, event=event)
    event.refresh_from_db()
    return event


def _fetch_opg_transaction(transaction_id: str) -> dict:
    result = _request_json(
        "GET",
        f"{_proxy_base_url()}/opg/v1/transactions/{transaction_id}",
        headers=_opg_headers(),
    )
    if not isinstance(result, dict):
        raise PaymentGatewayError("Resposta OPG inválida.")
    return result


def process_opg_webhook(payload: dict) -> PaymentEvent:
    transaction_id = str(payload.get("id") or "")
    charge_id = str(payload.get("charge_id") or "")
    if not transaction_id:
        raise ValidationError({"payload": "Callback sem transaction id."})

    # O callback OPG não documenta assinatura própria; confirmamos sempre a transação
    # diretamente na API autenticada antes de alterar a encomenda.
    verified = _fetch_opg_transaction(transaction_id)
    if not charge_id:
        charge_id = str(verified.get("charge_id") or "")

    payment = Payment.objects.filter(
        provider=PaymentProvider.PROXYPAY_OPG,
        provider_payment_id=charge_id,
    ).select_related("order").first()
    amount = money(verified.get("amount", "0"))
    event, created = _create_event(
        payment=payment,
        provider=PaymentProvider.PROXYPAY_OPG,
        event_id=transaction_id,
        event_type=str(verified.get("type") or "payment"),
        amount=amount,
        signature_valid=True,
        payload=verified,
    )
    if not created:
        return event
    if not payment:
        event.reconciliation_status = ReconciliationStatus.MISMATCH
        event.reconciliation_note = "Charge OPG sem pagamento interno correspondente."
    elif amount != payment.amount:
        event.reconciliation_status = ReconciliationStatus.MISMATCH
        event.reconciliation_note = f"Valor OPG {amount} difere do esperado {payment.amount}."
    elif verified.get("status") == "accepted":
        mark_payment_paid(payment, event=event)
        event.refresh_from_db()
        return event
    elif verified.get("status") == "rejected":
        payment.status = PaymentStatus.FAILED
        payment.failure_reason = str(verified.get("status_reason") or "Pagamento rejeitado")
        payment.provider_payload = verified
        payment.save(update_fields=["status", "failure_reason", "provider_payload", "updated_at"])
        event.reconciliation_status = ReconciliationStatus.MATCHED
        event.reconciliation_note = "Rejeição confirmada diretamente no OPG."
    else:
        event.reconciliation_status = ReconciliationStatus.PENDING
        event.reconciliation_note = "Transação OPG ainda sem estado final."

    event.processed_at = timezone.now()
    event.save(update_fields=["reconciliation_status", "reconciliation_note", "processed_at", "updated_at"])
    return event


def confirm_manual_payment(payment: Payment, *, actor) -> Payment:
    if payment.provider != PaymentProvider.BANK_TRANSFER:
        raise ValidationError({"payment": "A confirmação manual só é permitida para transferência bancária."})
    return mark_payment_paid(payment, actor=actor)
