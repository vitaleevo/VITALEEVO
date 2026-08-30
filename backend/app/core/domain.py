import json
import re
import unicodedata
from collections.abc import Iterable
from datetime import datetime, timezone

import nh3
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.catalog import AuditLog, User


CONTENT_STATUSES = {"draft", "published", "archived"}
ORDER_STATUSES = {"pending", "paid", "processing", "shipped", "delivered", "cancelled"}
QUOTE_STATUSES = {"new", "in_review", "proposal_sent", "accepted", "fulfilled", "rejected"}

# Defense-in-depth: allowlist for rich-text HTML (TipTap output)
_ALLOWED_TAGS = {
    "a",
    "abbr",
    "b",
    "blockquote",
    "br",
    "code",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "i",
    "li",
    "ol",
    "p",
    "pre",
    "strong",
    "ul",
    "span",
    "div",
    "img",
    "figure",
    "figcaption",
    "table",
    "thead",
    "tbody",
    "tr",
    "th",
    "td",
    "u",
    "s",
    "sup",
    "sub",
}

_ALLOWED_ATTRIBUTES = {
    "a": {"href", "title", "target"},
    "img": {"src", "alt", "title", "width", "height"},
    "*": {"class", "id"},
}

_ALLOWED_URL_SCHEMES = {"http", "https", "mailto"}
_CLEAN_CONTENT_TAGS = {"script", "style"}


def sanitize_html(value: str | None) -> str:
    """Sanitiza HTML rico usando nh3 (Ammonia) — defense-in-depth contra XSS.

    - Remove tags perigosas e seu conteúdo (script/style)
    - Mantém apenas allowlist de tags/atributos seguros
    - Bloqueia esquemas javascript:/data:
    - Normaliza rel em links
    Retorna string vazia para None/empty.
    """
    if not value:
        return ""
    if not isinstance(value, str):
        value = str(value)
    return nh3.clean(
        value,
        tags=_ALLOWED_TAGS,
        attributes=_ALLOWED_ATTRIBUTES,
        url_schemes=_ALLOWED_URL_SCHEMES,
        clean_content_tags=_CLEAN_CONTENT_TAGS,
        link_rel="noopener noreferrer",
        strip_comments=True,
    )


def slugify(value: str, fallback: str = "item") -> str:
    normalized = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    clean = re.sub(r"[^\w\s-]", "", normalized).strip()
    return re.sub(r"[-\s]+", "-", clean) or fallback


def require_choice(value: str, allowed: set[str], label: str = "Estado") -> str:
    if value not in allowed:
        raise HTTPException(
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            f"{label} inválido. Valores permitidos: {', '.join(sorted(allowed))}.",
        )
    return value


def json_list(value: object, *, max_items: int = 30) -> list:
    if value is None or value == "":
        return []
    if isinstance(value, str):
        try:
            parsed = json.loads(value)
        except ValueError:
            parsed = [part.strip() for part in re.split(r"[,\r\n]+", value) if part.strip()]
    else:
        parsed = value
    if not isinstance(parsed, list):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Era esperada uma lista.")
    return parsed[:max_items]


def dump_json(value: object, *, max_items: int = 30) -> str:
    if isinstance(value, list):
        value = value[:max_items]
    return json.dumps(value, ensure_ascii=False)


def load_json(value: str | None, fallback: object) -> object:
    try:
        return json.loads(value or "")
    except (TypeError, ValueError):
        return fallback


async def audit(
    db: AsyncSession,
    user: User,
    action: str,
    resource: str,
    details: dict | None = None,
) -> None:
    db.add(
        AuditLog(
            actor=user.email,
            action=action[:120],
            resource=resource[:200],
            details=json.dumps(details or {}, ensure_ascii=False)[:4000],
            created_at=datetime.now(timezone.utc),
        )
    )
