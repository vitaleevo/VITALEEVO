"""Tarefas de fundo das cotações (django-rq — KISS em vez de Celery)."""
from django.conf import settings
from django.core.mail import send_mail
from django_rq import job

from .models import QuoteRequest


@job
def send_quote_notification(quote_id: str) -> None:
    """Notifica a equipa comercial de uma nova cotação (processo em background)."""
    quote = QuoteRequest.objects.get(id=quote_id)
    items_summary = ", ".join(f"{item.quantity}x {item.name}" for item in quote.items.all()) or "sem itens"
    send_mail(
        subject=f"Nova cotação {quote.public_id} — {quote.name}",
        message=(
            f"Nova pedido de cotação:\n\n"
            f"Nome: {quote.name}\n"
            f"E-mail: {quote.email}\n"
            f"Telefone: {quote.phone}\n"
            f"Empresa: {quote.company or '-'}\n"
            f"Mensagem: {quote.message or '-'}\n"
            f"Itens: {items_summary}\n\n"
            f"Ver no backoffice: {settings.SITE_URL}/admin/quotes"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[settings.DEFAULT_FROM_EMAIL],
    )