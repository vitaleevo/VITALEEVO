"""Regras de negócio do CMS — publicações e conteúdo do site."""
from django.db import transaction

from apps.audit.helpers import log_audit

from .models import SitePage


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