import json

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, has_perm, require_staff
from app.db.seed import _ensure_site_settings
from app.models.catalog import ContactMessage, NewsletterSubscriber, SiteSetting, User

router = APIRouter(prefix="/cms", tags=["cms"])


class SettingIn(BaseModel):
    value: dict
    key: str | None = None


class ContactIn(BaseModel):
    name: str
    email: str
    phone: str = ""
    subject: str = ""
    message: str


class NewsletterIn(BaseModel):
    email: str


@router.get("/settings/site_config")
async def get_site_config(db: AsyncSession = Depends(get_db)):
    await _ensure_site_settings(db)
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == "site_config"))
    setting = result.scalar_one()
    try:
        value = json.loads(setting.value)
    except ValueError:
        value = {}
    return {"id": setting.id, "key": setting.key, "value": value, "updated_at": setting.updated_at.isoformat() if setting.updated_at else None}


@router.patch("/settings/site_config")
async def update_site_config(data: SettingIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "settings:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(SiteSetting).where(SiteSetting.key == "site_config"))
    setting = result.scalar_one_or_none()
    if not setting:
        setting = SiteSetting(key="site_config")
        db.add(setting)
    setting.value = json.dumps(data.value, ensure_ascii=False)
    await db.commit()
    await db.refresh(setting)
    return {"id": setting.id, "key": setting.key, "value": data.value}


@router.get("/contacts")
async def list_contacts(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    rows = (await db.execute(select(ContactMessage).order_by(ContactMessage.created_at.desc()))).scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "email": c.email,
            "phone": c.phone,
            "subject": c.subject,
            "message": c.message,
            "is_read": c.is_read,
            "created_at": c.created_at.isoformat() if c.created_at else None,
        }
        for c in rows
    ]


@router.post("/contacts", status_code=status.HTTP_201_CREATED)
async def submit_contact(data: ContactIn, db: AsyncSession = Depends(get_db)):
    msg = ContactMessage(**data.model_dump())
    db.add(msg)
    await db.commit()
    return {"id": msg.id, "detail": "Mensagem enviada."}


@router.patch("/contacts/{contact_id}")
async def mark_contact_read(contact_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mensagem não encontrada.")
    if "is_read" in data:
        msg.is_read = bool(data["is_read"])
    await db.commit()
    return {"id": msg.id, "is_read": msg.is_read}


@router.delete("/contacts/{contact_id}")
async def delete_contact(contact_id: int, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result = await db.execute(select(ContactMessage).where(ContactMessage.id == contact_id))
    msg = result.scalar_one_or_none()
    if not msg:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Mensagem não encontrada.")
    await db.delete(msg)
    await db.commit()
    return {"detail": "Mensagem removida."}


@router.get("/newsletters")
async def list_newsletters(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    rows = (await db.execute(select(NewsletterSubscriber).order_by(NewsletterSubscriber.created_at.desc()))).scalars().all()
    return {"count": len(rows), "results": [{"id": n.id, "email": n.email, "active": n.active} for n in rows]}


@router.post("/newsletters", status_code=status.HTTP_201_CREATED)
async def subscribe(data: NewsletterIn, db: AsyncSession = Depends(get_db)):
    email = data.email.strip().lower()
    result = await db.execute(select(NewsletterSubscriber).where(NewsletterSubscriber.email == email))
    existing = result.scalar_one_or_none()
    if existing:
        existing.active = True
        await db.commit()
        return {"id": existing.id, "detail": "E-mail já subscrito."}
    sub = NewsletterSubscriber(email=email)
    db.add(sub)
    await db.commit()
    return {"id": sub.id, "detail": "Subscrição confirmada."}
