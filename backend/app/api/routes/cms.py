import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, EmailStr, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, has_perm, require_staff
from app.core.domain import CONTENT_STATUSES, audit, dump_json, json_list, load_json, require_choice, slugify
from app.db.seed import _ensure_site_settings
from app.models.catalog import (
    ContactMessage, LegalDocument, NewsletterSubscriber, Service, SitePage, SiteSetting, User,
)

router = APIRouter(prefix="/cms", tags=["cms"])


DEFAULT_SERVICES = [
    {"title": "Desenvolvimento Web", "slug": "desenvolvimento-web", "subtitle": "A sua vitrine digital a converter visitantes em clientes.", "icon": "globe", "features": ["Websites", "E-commerce", "Sistemas Web"], "description": "Websites e lojas que convertem.", "display_order": 1},
    {"title": "Marketing Digital", "slug": "marketing-digital", "subtitle": "Tráfego qualificado e campanhas que geram vendas.", "icon": "megaphone", "features": ["Gestão de Redes Sociais", "Meta Ads", "Google Ads", "SEO"], "description": "Campanhas que geram vendas.", "display_order": 2},
    {"title": "Sistemas & Automação", "slug": "sistemas-automacao", "subtitle": "Processos otimizados com ERP, IA e integrações.", "icon": "bot", "features": ["ERP", "IA", "Integrações"], "description": "Automação com ERP e IA.", "display_order": 3},
    {"title": "Infraestrutura TI", "slug": "infraestrutura-ti", "subtitle": "Redes, segurança e equipamentos para a sua operação.", "icon": "network", "features": ["Redes", "CCTV", "Biometria"], "description": "Infraestrutura para a sua operação.", "display_order": 4},
]


class SettingIn(BaseModel):
    value: dict


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field("", max_length=40)
    subject: str = Field("", max_length=200)
    message: str = Field(min_length=2, max_length=10_000)


class NewsletterIn(BaseModel):
    email: EmailStr


class ServiceIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=2, max_length=220)
    slug: str | None = Field(None, max_length=220)
    subtitle: str = Field("", max_length=2000)
    description: str = Field("", max_length=50_000)
    icon: str = Field("globe", max_length=80)
    image: str | None = Field(None, max_length=500)
    features: list[str] | str = Field(default_factory=list)
    benefits: list[dict] | str = Field(default_factory=list)
    process: list[dict] | str = Field(default_factory=list)
    cta_text: str = Field("Solicitar proposta", max_length=160)
    order: int = Field(0, ge=-10_000, le=10_000)
    status: str = "draft"


class ServicePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(None, min_length=2, max_length=220)
    slug: str | None = Field(None, max_length=220)
    subtitle: str | None = Field(None, max_length=2000)
    description: str | None = Field(None, max_length=50_000)
    icon: str | None = Field(None, max_length=80)
    image: str | None = Field(None, max_length=500)
    features: list[str] | str | None = None
    benefits: list[dict] | str | None = None
    process: list[dict] | str | None = None
    cta_text: str | None = Field(None, max_length=160)
    order: int | None = Field(None, ge=-10_000, le=10_000)
    status: str | None = None


class LegalIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=2, max_length=255)
    slug: str | None = Field(None, max_length=220)
    content: str = Field("", max_length=200_000)
    status: str = "draft"


class LegalPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(None, min_length=2, max_length=255)
    slug: str | None = Field(None, max_length=220)
    content: str | None = Field(None, max_length=200_000)
    status: str | None = None


class PageIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=2, max_length=255)
    slug: str | None = Field(None, max_length=220)
    content: str = Field("", max_length=200_000)
    hero_title: str = Field("", max_length=500)
    hero_subtitle: str = Field("", max_length=3000)
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)
    status: str = "draft"


class PagePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(None, min_length=2, max_length=255)
    slug: str | None = Field(None, max_length=220)
    content: str | None = Field(None, max_length=200_000)
    hero_title: str | None = Field(None, max_length=500)
    hero_subtitle: str | None = Field(None, max_length=3000)
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)
    status: str | None = None


def _can_manage_content(user: User | None) -> bool:
    return bool(user and has_perm(user, "content:manage"))


async def _seed_content_defaults(db: AsyncSession) -> None:
    if not (await db.execute(select(Service.id).limit(1))).scalar_one_or_none():
        for item in DEFAULT_SERVICES:
            db.add(Service(**{**item, "features": dump_json(item["features"]), "status": "published"}))
    if not (await db.execute(select(LegalDocument.id).limit(1))).scalar_one_or_none():
        db.add(LegalDocument(title="Política de Privacidade", slug="privacy", content="<p>Política de privacidade da Vitaleevo.</p>", status="published"))
        db.add(LegalDocument(title="Termos e Condições", slug="terms", content="<p>Termos e condições da Vitaleevo.</p>", status="published"))
    await db.commit()


@router.get("/settings/site_config")
async def get_site_config(db: AsyncSession = Depends(get_db)):
    await _ensure_site_settings(db)
    setting = (await db.execute(select(SiteSetting).where(SiteSetting.key == "site_config"))).scalar_one()
    return {"id": setting.id, "key": setting.key, "value": load_json(setting.value, {}), "updated_at": setting.updated_at.isoformat() if setting.updated_at else None}


@router.patch("/settings/site_config")
async def update_site_config(data: SettingIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "settings:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    setting = (await db.execute(select(SiteSetting).where(SiteSetting.key == "site_config"))).scalar_one_or_none()
    if not setting: setting = SiteSetting(key="site_config"); db.add(setting)
    setting.value = dump_json(data.value); await audit(db, user, "settings.update", "site_config")
    await db.commit(); await db.refresh(setting)
    return {"id": setting.id, "key": setting.key, "value": data.value}


@router.get("/contacts")
async def list_contacts(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    q = select(ContactMessage).order_by(ContactMessage.created_at.desc()); total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return {"count": total, "next": None, "previous": None, "results": [{"id": row.id, "name": row.name, "email": row.email, "phone": row.phone, "subject": row.subject, "message": row.message, "is_read": row.is_read, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]}


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
async def submit_contact(data: ContactIn, db: AsyncSession = Depends(get_db)):
    message = ContactMessage(**data.model_dump()); db.add(message); await db.commit(); await db.refresh(message)
    return {"id": message.id, "detail": "Mensagem enviada."}


@router.patch("/contacts/{contact_id}")
async def update_contact(contact_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    message = (await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))).scalar_one_or_none()
    if not message: raise HTTPException(status.HTTP_404_NOT_FOUND, "Mensagem não encontrada.")
    if "is_read" in data: message.is_read = bool(data["is_read"])
    await audit(db, user, "contact.update", str(contact_id), {"is_read": message.is_read}); await db.commit()
    return {"id": message.id, "is_read": message.is_read}


@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    message = (await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))).scalar_one_or_none()
    if not message: raise HTTPException(status.HTTP_404_NOT_FOUND, "Mensagem não encontrada.")
    await db.delete(message); await audit(db, user, "contact.delete", str(contact_id)); await db.commit(); return {"detail": "Mensagem removida."}


@router.get("/newsletters")
async def list_newsletters(page_size: int = Query(100, ge=1, le=500), db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    rows = (await db.execute(select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()).limit(page_size))).scalars().all()
    return {"count": len(rows), "next": None, "previous": None, "results": [{"id": row.id, "email": row.email, "active": row.active, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]}


@router.post("/newsletters", status_code=status.HTTP_201_CREATED)
async def subscribe(data: NewsletterIn, db: AsyncSession = Depends(get_db)):
    email = str(data.email).lower(); subscriber = (await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))).scalar_one_or_none()
    if subscriber: subscriber.active = True
    else: subscriber = NewsletterSubscriber(email=email); db.add(subscriber)
    await db.commit(); await db.refresh(subscriber); return {"id": subscriber.id, "detail": "Subscrição confirmada."}


@router.post("/newsletters/unsubscribe")
async def unsubscribe(data: dict, db: AsyncSession = Depends(get_db)):
    email = str(data.get("token") or data.get("email") or "").strip().lower()
    if not email: raise HTTPException(status.HTTP_400_BAD_REQUEST, "Token obrigatório.")
    subscriber = (await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))).scalar_one_or_none()
    if subscriber: subscriber.active = False; await db.commit()
    return {"detail": "Removido com sucesso."}


@router.post("/newsletters/broadcast")
async def broadcast(data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    subject = str(data.get("subject") or "").strip(); body = str(data.get("body") or "").strip()
    if not subject or not body: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Assunto e corpo são obrigatórios.")
    total = (await db.execute(select(func.count(NewsletterSubscriber.id)).where(NewsletterSubscriber.active.is_(True)))).scalar() or 0
    await audit(db, user, "newsletter.broadcast.request", "newsletter", {"subject": subject, "recipients": total}); await db.commit()
    return {"id": "broadcast-pending", "status": "pending", "total_recipients": total}


@router.delete("/newsletters/{subscriber_id}")
async def delete_newsletter(subscriber_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "contacts:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    subscriber = (await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.id == subscriber_id))).scalar_one_or_none()
    if not subscriber: raise HTTPException(status.HTTP_404_NOT_FOUND, "Subscrição não encontrada.")
    subscriber.active = False; await audit(db, user, "newsletter.unsubscribe", str(subscriber_id)); await db.commit(); return {"detail": "Subscrição desativada."}


def _service_out(item: Service) -> dict:
    return {"id": item.id, "title": item.title, "slug": item.slug, "subtitle": item.subtitle, "description": item.description,
            "icon": item.icon, "image": item.image, "features": load_json(item.features, []),
            "benefits": load_json(item.benefits, []), "process": load_json(item.process, []), "cta_text": item.cta_text or "Solicitar proposta", "order": item.display_order,
            "status": item.status, "is_active": item.status == "published", "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None}


@router.get("/services")
async def list_services(page_size: int = Query(100, ge=1, le=200), db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    await _seed_content_defaults(db); q = select(Service)
    if not _can_manage_content(user): q = q.where(Service.status == "published")
    rows = (await db.execute(q.order_by(Service.display_order, Service.title).limit(page_size))).scalars().all()
    return {"count": len(rows), "next": None, "previous": None, "results": [_service_out(row) for row in rows]}


@router.get("/services/{slug}")
async def get_service(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    item = (await db.execute(select(Service).where(Service.slug == slug))).scalar_one_or_none()
    if not item or (item.status != "published" and not _can_manage_content(user)): raise HTTPException(status.HTTP_404_NOT_FOUND, "Serviço não encontrado.")
    return _service_out(item)


def _service_values(data: ServiceIn | ServicePatch, patch: bool = False) -> dict:
    values = data.model_dump(exclude_unset=patch)
    if "order" in values: values["display_order"] = values.pop("order")
    if "features" in values and values["features"] is not None: values["features"] = dump_json(json_list(values["features"]))
    for key in ("benefits", "process"):
        if key in values and values[key] is not None:
            raw = values[key]
            if isinstance(raw, str):
                try: raw = json.loads(raw or "[]")
                except ValueError: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"{key} deve ser JSON válido.")
            if not isinstance(raw, list): raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, f"{key} deve ser uma lista.")
            values[key] = dump_json(raw)
    if values.get("status"): values["status"] = require_choice(values["status"], CONTENT_STATUSES)
    return values


@router.post("/services", status_code=status.HTTP_201_CREATED)
async def create_service(data: ServiceIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = _service_values(data); item_slug = slugify(values.pop("slug", None) or values["title"])
    if (await db.execute(select(Service.id).where(Service.slug == item_slug))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item = Service(slug=item_slug, **values); db.add(item); await audit(db, user, "service.create", item_slug); await db.commit(); await db.refresh(item); return _service_out(item)


@router.patch("/services/{slug}")
async def update_service(slug: str, data: ServicePatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(Service).where(Service.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Serviço não encontrado.")
    values = _service_values(data, True); new_slug = slugify(values.pop("slug", None) or item.slug)
    if (await db.execute(select(Service.id).where(Service.slug == new_slug, Service.id != item.id))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item.slug = new_slug
    for key, value in values.items(): setattr(item, key, value)
    await audit(db, user, "service.update", new_slug, {"fields": sorted(values)}); await db.commit(); await db.refresh(item); return _service_out(item)


@router.delete("/services/{slug}")
async def archive_service(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(Service).where(Service.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Serviço não encontrado.")
    item.status = "archived"; await audit(db, user, "service.archive", slug); await db.commit(); return {"detail": "Serviço arquivado."}


def _legal_out(item: LegalDocument) -> dict:
    return {"id": item.id, "title": item.title, "slug": item.slug, "content": item.content, "status": item.status,
            "is_published": item.status == "published", "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None}


@router.get("/legal")
async def list_legal(db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    await _seed_content_defaults(db); q = select(LegalDocument)
    if not _can_manage_content(user): q = q.where(LegalDocument.status == "published")
    rows = (await db.execute(q.order_by(LegalDocument.title))).scalars().all()
    return {"count": len(rows), "next": None, "previous": None, "results": [_legal_out(row) for row in rows]}


@router.get("/legal/{slug}")
async def get_legal(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    item = (await db.execute(select(LegalDocument).where(LegalDocument.slug == slug))).scalar_one_or_none()
    if not item or (item.status != "published" and not _can_manage_content(user)): raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento não encontrado.")
    return _legal_out(item)


@router.post("/legal", status_code=status.HTTP_201_CREATED)
async def create_legal(data: LegalIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = data.model_dump(); values["status"] = require_choice(values["status"], CONTENT_STATUSES); item_slug = slugify(values.pop("slug", None) or values["title"])
    if (await db.execute(select(LegalDocument.id).where(LegalDocument.slug == item_slug))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item = LegalDocument(slug=item_slug, **values); db.add(item); await audit(db, user, "legal.create", item_slug); await db.commit(); await db.refresh(item); return _legal_out(item)


@router.patch("/legal/{slug}")
async def update_legal(slug: str, data: LegalPatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(LegalDocument).where(LegalDocument.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento não encontrado.")
    values = data.model_dump(exclude_unset=True)
    if values.get("status"): values["status"] = require_choice(values["status"], CONTENT_STATUSES)
    new_slug = slugify(values.pop("slug", None) or item.slug)
    if (await db.execute(select(LegalDocument.id).where(LegalDocument.slug == new_slug, LegalDocument.id != item.id))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item.slug = new_slug
    for key, value in values.items(): setattr(item, key, value)
    await audit(db, user, "legal.update", new_slug, {"fields": sorted(values)}); await db.commit(); await db.refresh(item); return _legal_out(item)


@router.delete("/legal/{slug}")
async def archive_legal(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(LegalDocument).where(LegalDocument.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Documento não encontrado.")
    item.status = "archived"; await audit(db, user, "legal.archive", slug); await db.commit(); return {"detail": "Documento arquivado."}


def _page_out(item: SitePage) -> dict:
    return {"id": item.id, "title": item.title, "slug": item.slug, "content": item.content, "hero_title": item.hero_title,
            "hero_subtitle": item.hero_subtitle, "seo_title": item.seo_title, "seo_description": item.seo_description,
            "status": item.status, "created_at": item.created_at.isoformat() if item.created_at else None,
            "updated_at": item.updated_at.isoformat() if item.updated_at else None}


@router.get("/pages")
async def list_pages(db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    q = select(SitePage)
    if not _can_manage_content(user): q = q.where(SitePage.status == "published")
    rows = (await db.execute(q.order_by(SitePage.title))).scalars().all()
    return {"count": len(rows), "next": None, "previous": None, "results": [_page_out(row) for row in rows]}


@router.get("/pages/{slug}")
async def get_page(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    item = (await db.execute(select(SitePage).where(SitePage.slug == slug))).scalar_one_or_none()
    if not item or (item.status != "published" and not _can_manage_content(user)): raise HTTPException(status.HTTP_404_NOT_FOUND, "Página não encontrada.")
    return _page_out(item)


@router.post("/pages", status_code=status.HTTP_201_CREATED)
async def create_page(data: PageIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = data.model_dump(); values["status"] = require_choice(values["status"], CONTENT_STATUSES); item_slug = slugify(values.pop("slug", None) or values["title"])
    if (await db.execute(select(SitePage.id).where(SitePage.slug == item_slug))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item = SitePage(slug=item_slug, **values); db.add(item); await audit(db, user, "page.create", item_slug); await db.commit(); await db.refresh(item); return _page_out(item)


@router.patch("/pages/{slug}")
async def update_page(slug: str, data: PagePatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(SitePage).where(SitePage.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Página não encontrada.")
    values = data.model_dump(exclude_unset=True)
    if values.get("status"): values["status"] = require_choice(values["status"], CONTENT_STATUSES)
    new_slug = slugify(values.pop("slug", None) or item.slug)
    if (await db.execute(select(SitePage.id).where(SitePage.slug == new_slug, SitePage.id != item.id))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    item.slug = new_slug
    for key, value in values.items(): setattr(item, key, value)
    await audit(db, user, "page.update", new_slug, {"fields": sorted(values)}); await db.commit(); await db.refresh(item); return _page_out(item)


@router.post("/pages/{slug}/publish")
async def publish_page(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    return await update_page(slug, PagePatch(status="published"), db, user)


@router.delete("/pages/{slug}")
async def archive_page(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    item = (await db.execute(select(SitePage).where(SitePage.slug == slug))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Página não encontrada.")
    item.status = "archived"; await audit(db, user, "page.archive", slug); await db.commit(); return {"detail": "Página arquivada."}
