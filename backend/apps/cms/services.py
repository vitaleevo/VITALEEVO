"""Regras de negócio do CMS — publicações, newsletter e conteúdo do site."""
from urllib.parse import urlencode

from django.conf import settings
from django.core import signing
from django.db import transaction

from apps.audit.helpers import log_audit

from .models import Newsletter, NewsletterBroadcast, SitePage

NEWSLETTER_SIGNING_SALT = "vitaleevo.cms.newsletter.unsubscribe"


@transaction.atomic
def publish_page(page: SitePage, actor) -> SitePage:
    """Publica uma página e regista a alteração na auditoria."""
    page.status = "published"
    page.save(update_fields=["status", "updated_at"])
    log_audit(
        user=actor,
        action="page.publish",
        resource_type="site_page",
        resource_id=str(page.id),
    )
    return page


@transaction.atomic
def upsert_page_with_blocks(*, slug: str, actor, data: dict, blocks: list[dict]) -> SitePage:
    """Cria/atualiza uma página e substitui os blocos (uma transação)."""
    page, _created = SitePage.objects.update_or_create(slug=slug, defaults=data)
    page.blocks.all().delete()
    for order, block in enumerate(blocks):
        page.blocks.create(order=order, **block)
    page.updated_by = actor
    page.save(update_fields=["updated_by", "updated_at"])
    log_audit(
        user=actor,
        action="page.upsert",
        resource_type="site_page",
        resource_id=str(page.id),
        details={"blocks": len(blocks)},
    )
    return page


def create_unsubscribe_token(email: str) -> str:
    return signing.dumps(email.strip().lower(), salt=NEWSLETTER_SIGNING_SALT, compress=True)


def build_unsubscribe_url(email: str) -> str:
    query = urlencode({"token": create_unsubscribe_token(email)})
    return f"{settings.SITE_URL.rstrip('/')}/newsletter/cancelar?{query}"


def unsubscribe_with_token(token: str) -> bool:
    try:
        email = signing.loads(token, salt=NEWSLETTER_SIGNING_SALT)
    except signing.BadSignature:
        return False
    if not isinstance(email, str):
        return False
    return bool(Newsletter.objects.filter(email=email.strip().lower(), is_active=True).update(is_active=False))


def enqueue_newsletter_broadcast(broadcast: NewsletterBroadcast) -> None:
    from .tasks import send_newsletter_broadcast

    if settings.RQ_ASYNC:
        import django_rq
        from rq import Retry

        django_rq.get_queue("default").enqueue(
            send_newsletter_broadcast,
            str(broadcast.id),
            retry=Retry(max=3, interval=[30, 120, 300]),
            job_timeout=900,
        )
    else:
        send_newsletter_broadcast(str(broadcast.id))


def enqueue_contact_notification(contact_id: str) -> None:
    from .tasks import send_contact_notification

    if settings.RQ_ASYNC:
        import django_rq
        from rq import Retry

        django_rq.get_queue("default").enqueue(
            send_contact_notification,
            contact_id,
            retry=Retry(max=3, interval=[30, 120, 300]),
            job_timeout=120,
        )
    else:
        send_contact_notification(contact_id)


def enqueue_newsletter_welcome(email: str) -> None:
    from .tasks import send_newsletter_welcome

    if settings.RQ_ASYNC:
        import django_rq
        from rq import Retry

        django_rq.get_queue("default").enqueue(
            send_newsletter_welcome,
            email,
            retry=Retry(max=3, interval=[30, 120, 300]),
            job_timeout=120,
        )
    else:
        send_newsletter_welcome(email)
