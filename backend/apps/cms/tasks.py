"""Tarefas RQ do CMS com contagem real de entregas e retentativas limitadas."""

from django.conf import settings
from django.core.mail import EmailMessage, send_mail
from django.utils import timezone

from apps.audit.helpers import log_audit

from .models import (
    ContactMessage,
    Newsletter,
    NewsletterBroadcast,
    NewsletterBroadcastStatus,
)
from .services import build_unsubscribe_url


def send_contact_notification(contact_id: str) -> None:
    contact = ContactMessage.objects.get(pk=contact_id)
    message = EmailMessage(
        subject=f"Novo contacto — {contact.subject}",
        body=(
            f"Nome: {contact.name}\n"
            f"E-mail: {contact.email}\n"
            f"Telefone: {contact.phone or '-'}\n"
            f"Empresa: {contact.company or '-'}\n\n"
            f"{contact.message}"
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=[settings.DEFAULT_FROM_EMAIL],
        reply_to=[contact.email],
    )
    message.send(fail_silently=False)


def send_newsletter_welcome(email: str) -> None:
    unsubscribe_url = build_unsubscribe_url(email)
    send_mail(
        "Bem-vindo à VitalEvo",
        (
            "Obrigado por se inscrever na newsletter da VitalEvo.\n\n"
            f"Fale com a nossa equipa: {settings.SITE_URL.rstrip('/')}/contact\n"
            f"Cancelar subscrição: {unsubscribe_url}"
        ),
        settings.DEFAULT_FROM_EMAIL,
        [email],
        fail_silently=False,
    )


def send_newsletter_broadcast(broadcast_id: str) -> None:
    broadcast = NewsletterBroadcast.objects.get(pk=broadcast_id)
    broadcast.status = NewsletterBroadcastStatus.RUNNING
    broadcast.save(update_fields=["status", "updated_at"])

    sent = 0
    failed = 0
    subscribers = Newsletter.objects.filter(is_active=True).order_by("pk")
    total = subscribers.count()
    broadcast.total_recipients = total
    broadcast.save(update_fields=["total_recipients", "updated_at"])

    for email in subscribers.values_list("email", flat=True).iterator(chunk_size=200):
        body = f"{broadcast.body}\n\nCancelar subscrição: {build_unsubscribe_url(email)}"
        try:
            delivered = send_mail(
                broadcast.subject,
                body,
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            sent += int(delivered == 1)
            failed += int(delivered != 1)
        except Exception:  # noqa: BLE001 — contabiliza e continua os restantes destinatários
            failed += 1

    broadcast.sent_count = sent
    broadcast.failed_count = failed
    broadcast.status = (
        NewsletterBroadcastStatus.COMPLETED
        if sent + failed == total
        else NewsletterBroadcastStatus.FAILED
    )
    broadcast.finished_at = timezone.now()
    broadcast.save(
        update_fields=["sent_count", "failed_count", "status", "finished_at", "updated_at"]
    )
    log_audit(
        user=broadcast.requested_by,
        action="newsletter.broadcast.completed",
        resource_type="newsletter_broadcast",
        resource_id=str(broadcast.id),
        details={"total": total, "sent": sent, "failed": failed},
    )
