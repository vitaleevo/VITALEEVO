import json
import os
import secrets
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, has_perm, require_staff, user_permissions
from app.core.security import hash_password
from app.models.catalog import (
    AnalyticsEvent,
    AuditLog,
    ContactMessage,
    Order,
    Product,
    Quote,
    User,
)

router = APIRouter(tags=["misc"])


@router.get("/dashboard", include_in_schema=True)
async def dashboard(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    quotes = (await db.execute(select(func.count(Quote.id)))).scalar() or 0
    contacts = (await db.execute(select(func.count(ContactMessage.id)))).scalar() or 0
    products = (await db.execute(select(func.count(Product.id)))).scalar() or 0
    orders = (await db.execute(select(func.count(Order.id)))).scalar() or 0
    return {
        "revenue": 0,
        "quotes": {"total": quotes},
        "contacts": {"total": contacts},
        "products": {"total": products},
        "orders": {"total": orders},
    }


@router.post("/analytics/track")
async def track(data: dict, db: AsyncSession = Depends(get_db)):
    if not data.get("type"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "type é obrigatório.")
    if not data.get("path"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "path é obrigatório.")
    if not data.get("session_id"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "session_id é obrigatório.")
    event = AnalyticsEvent(
        type=str(data["type"])[:40],
        path=str(data["path"])[:300],
        session_id=str(data["session_id"])[:120],
        data=json.dumps(data.get("data") or {}, ensure_ascii=False)[:2000],
    )
    db.add(event)
    await db.commit()
    return {"ok": True}


@router.get("/analytics/overview")
async def analytics_overview(period: str = "30d", db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    events = (await db.execute(select(AnalyticsEvent).order_by(AnalyticsEvent.created_at.desc()).limit(5000))).scalars().all()
    return {
        "period": period,
        "total_pageviews": len(events),
        "unique_visitors": len({e.session_id for e in events}),
        "total_clicks": sum(1 for e in events if e.type in ("click", "button_click")),
        "interaction_rate": 0.0,
        "devices": {"desktop": 0, "mobile": 0, "tablet": 0},
        "top_pages": [],
        "top_buttons": [],
    }


@router.post("/media/upload")
async def upload(file: UploadFile = File(...), user: User | None = Depends(require_staff)):
    if not has_perm(user, "media:upload"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    if file.filename and file.filename.lower().endswith(".svg"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "SVG não permitido.")
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename else "bin"
    name = f"{uuid.uuid4().hex}.{ext}"
    os.makedirs("media", exist_ok=True)
    with open(f"media/{name}", "wb") as f:
        while chunk := await file.read(1024 * 1024):
            f.write(chunk)
    return {"url": f"/media/{name}"}


@router.get("/audit/logs")
async def audit_logs(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    rows = (await db.execute(select(AuditLog).order_by(AuditLog.created_at.desc()).limit(100))).scalars().all()
    return {
        "count": len(rows),
        "results": [
            {"id": a.id, "actor": a.actor, "action": a.action, "resource": a.resource, "details": json.loads(a.details or "{}"), "created_at": a.created_at.isoformat() if a.created_at else None}
            for a in rows
        ],
    }


@router.get("/auth/users")
async def list_users(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    rows = (await db.execute(select(User).order_by(User.created_at.desc()))).scalars().all()
    return {
        "count": len(rows),
        "results": [
            {"id": u.id, "email": u.email, "first_name": u.first_name, "last_name": u.last_name, "role": u.role, "is_staff": u.is_staff, "is_admin": u.is_admin, "active": u.active, "permissions": user_permissions(u)}
            for u in rows
        ],
    }


@router.post("/auth/users", status_code=status.HTTP_201_CREATED)
async def create_user(data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "system:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    email = str(data.get("email") or "").strip().lower()
    if not email or not data.get("password"):
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Email e senha obrigatórios.")
    existing = (await db.execute(select(User).where(User.email == email))).scalar_one_or_none()
    if existing:
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já registado.")
    new_user = User(
        email=email,
        first_name=str(data.get("first_name") or ""),
        last_name=str(data.get("last_name") or ""),
        phone=str(data.get("phone") or ""),
        hashed_password=hash_password(str(data["password"])),
        role=str(data.get("role") or "client"),
        permissions=json.dumps(data.get("permissions") or []),
        is_staff=bool(data.get("is_staff")),
        is_admin=bool(data.get("is_admin")),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}


@router.patch("/auth/users/{user_id}")
async def update_user(user_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "system:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Utilizador não encontrado.")
    for field in ("first_name", "last_name", "phone", "role"):
        if field in data:
            setattr(target, field, str(data[field]))
    if "is_staff" in data:
        target.is_staff = bool(data["is_staff"])
    if "is_admin" in data:
        target.is_admin = bool(data["is_admin"])
    if "active" in data:
        target.active = bool(data["active"])
    if "permissions" in data:
        target.permissions = json.dumps(data["permissions"])
    await db.commit()
    return {"id": target.id, "email": target.email}


@router.post("/auth/users/{user_id}/reset_password")
async def reset_password(user_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "system:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Utilizador não encontrado.")
    target.hashed_password = hash_password(str(data.get("password") or ""))
    await db.commit()
    return {"detail": "Senha reposta."}
