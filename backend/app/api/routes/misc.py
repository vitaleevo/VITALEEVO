import io
import json
import secrets
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, has_perm, require_staff, user_permissions
from app.core.security import hash_password
from app.core import storage as storage_module
from app.models.catalog import (
    AnalyticsEvent,
    AuditLog,
    ContactMessage,
    NewsletterSubscriber,
    Order,
    Product,
    Quote,
    User,
)

router = APIRouter(tags=["misc"])


@router.get("/dashboard", include_in_schema=True)
async def dashboard(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result: dict = {"recent": {}}
    if has_perm(user, "quotes:read"):
        result["quotes"] = {"total": (await db.execute(select(func.count(Quote.id)))).scalar() or 0}
    if has_perm(user, "contacts:manage"):
        result["contacts"] = {"total": (await db.execute(select(func.count(ContactMessage.id)))).scalar() or 0}
        result["newsletter_subscribers"] = (await db.execute(select(func.count(NewsletterSubscriber.id)).where(NewsletterSubscriber.active.is_(True)))).scalar() or 0
    if has_perm(user, "catalog:read"):
        result["products"] = {
            "total": (await db.execute(select(func.count(Product.id)))).scalar() or 0,
            "active": (await db.execute(select(func.count(Product.id)).where(Product.active.is_(True), Product.status == "published"))).scalar() or 0,
            "low_stock": (await db.execute(select(func.count(Product.id)).where(Product.active.is_(True), Product.stock <= 5))).scalar() or 0,
        }
    if has_perm(user, "orders:read"):
        result["orders"] = {"total": (await db.execute(select(func.count(Order.id)))).scalar() or 0}
        result["revenue"] = (await db.execute(select(func.coalesce(func.sum(Order.total), 0)).where(Order.status != "cancelled"))).scalar() or 0
    if has_perm(user, "users:manage"):
        result["users"] = {"total": (await db.execute(select(func.count(User.id)))).scalar() or 0}
    return result


@router.post("/analytics/track")
@router.post("/analytics/track/")
async def track(data: dict, db: AsyncSession = Depends(get_db)):
    # Suporta dois formatos:
    # 1) pageview clássico: {type, path, session_id, ...}
    # 2) batch de heatmap: {session_id, path, clicks: [{x_percent, y_percent, ...}, ...]}
    # O segundo era enviado sem "type" e causava 400 - agora é tratado como eventos "click".
    clicks = data.get("clicks")
    if isinstance(clicks, list) and clicks:
        if not data.get("session_id"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "session_id é obrigatório.")
        if not data.get("path"):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "path é obrigatório.")
        session_id = str(data["session_id"])[:120]
        path = str(data["path"])[:300]
        for c in clicks[:100]:  # limite de segurança
            if not isinstance(c, dict):
                continue
            event = AnalyticsEvent(
                type="click",
                path=str(c.get("path") or path)[:300],
                session_id=session_id,
                data=json.dumps(c, ensure_ascii=False)[:2000],
            )
            db.add(event)
        await db.commit()
        return {"ok": True}

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
        data=json.dumps(data.get("data") or data.get("clicks") or {}, ensure_ascii=False)[:2000],
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


@router.get("/analytics/heatmap")
async def analytics_heatmap(path: str = "/", period: str = "30d", db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    events = (await db.execute(select(AnalyticsEvent).where(AnalyticsEvent.path == path).limit(1000))).scalars().all()
    return {
        "path": path,
        "period": period,
        "total_pageviews": len(events),
        "unique_visitors": len({e.session_id for e in events}),
        "total_clicks": 0,
        "points": [],
        "elements": [],
    }


@router.get("/analytics/pages")
async def analytics_pages(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    events = (await db.execute(select(AnalyticsEvent).limit(5000))).scalars().all()
    # Agrupa por path para compatibilidade com frontend AdminHeatmapView
    from collections import Counter

    counter = Counter(e.path for e in events)
    return [
        {"path": p, "views": c, "uniqueSessions": len({e.session_id for e in events if e.path == p}), "clicks": 0}
        for p, c in counter.most_common(20)
    ]


@router.post("/media/upload")
@router.post("/media/upload/")
async def upload(file: UploadFile = File(...), user: User | None = Depends(require_staff)):
    if not has_perm(user, "media:upload"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    if file.filename and file.filename.lower().endswith(".svg"):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "SVG não permitido.")
    # Validação de tamanho (evita ERR_HTTP2_PROTOCOL_ERROR por ficheiro gigante)
    if file.size and file.size > 15 * 1024 * 1024:
        raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Ficheiro excede 15 MB.")
    # Validação simples de tipo (aceita apenas imagens)
    allowed_ext = {"jpg", "jpeg", "png", "webp", "gif", "avif"}
    ext = file.filename.rsplit(".", 1)[-1].lower() if file.filename and "." in file.filename else "bin"
    if ext not in allowed_ext:
        # tenta inferir pelo content_type se extensão for bin
        if file.content_type:
            ct_map = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif"}
            ext = ct_map.get(file.content_type.lower(), ext)
        if ext not in allowed_ext:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Formato inválido. Use JPG, PNG, WebP, GIF ou AVIF.")
    name = f"{uuid.uuid4().hex}.{ext}"
    signatures = {
        "jpg": (b"\xff\xd8\xff",), "jpeg": (b"\xff\xd8\xff",),
        "png": (b"\x89PNG\r\n\x1a\n",), "gif": (b"GIF87a", b"GIF89a"),
        "webp": (b"RIFF",), "avif": (b"\x00\x00\x00",),
    }
    # Acumula em memória com limite 15 MB; ao final persiste via storage.save (S3 ou local)
    try:
        first = await file.read(32)
        valid = any(first.startswith(signature) for signature in signatures[ext])
        if ext == "webp": valid = valid and first[8:12] == b"WEBP"
        if ext == "avif": valid = b"ftypavif" in first or b"ftypavis" in first
        if not valid:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "O conteúdo do ficheiro não corresponde ao formato indicado.")
        buf = io.BytesIO()
        buf.write(first)
        total = len(first)
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            total += len(chunk)
            if total > 15 * 1024 * 1024:
                raise HTTPException(status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, "Ficheiro excede 15 MB.")
            buf.write(chunk)
        data = buf.getvalue()
        content_type = file.content_type or {
            "jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png",
            "webp": "image/webp", "gif": "image/gif", "avif": "image/avif",
        }.get(ext, "application/octet-stream")
        try:
            url = storage_module.save(key=name, data=data, content_type=content_type)
        except HTTPException:
            raise
        except Exception as exc:  # noqa: BLE001
            # storage.save já faz fallback local; erro aqui é inesperado
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Falha ao guardar ficheiro.") from exc
    except HTTPException:
        raise
    except Exception as exc:  # noqa: BLE001
        if isinstance(exc, HTTPException):
            raise
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "Falha ao guardar ficheiro.") from exc
    return {"url": url}


@router.get("/audit/logs")
async def audit_logs(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "audit:read"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
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
    if not has_perm(user, "users:manage") and not has_perm(user, "quotes:read"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    query = select(User).order_by(User.created_at.desc())
    if not has_perm(user, "users:manage"):
        query = query.where(User.is_staff.is_(True), User.active.is_(True))
    rows = (await db.execute(query)).scalars().all()
    return {
        "count": len(rows),
        "results": [
            {"id": u.id, "email": u.email, "first_name": u.first_name, "last_name": u.last_name, "role": u.role, "is_staff": u.is_staff, "is_admin": u.is_admin, "active": u.active, "permissions": user_permissions(u)}
            for u in rows
        ],
    }


@router.post("/auth/users", status_code=status.HTTP_201_CREATED)
async def create_user(data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "users:manage"):
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
        permissions=json.dumps([p for p in (data.get("permissions") or []) if p != "*"] if not user.is_admin else (data.get("permissions") or [])),
        is_staff=bool(data.get("is_staff")),
        is_admin=bool(data.get("is_admin")),
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return {"id": new_user.id, "email": new_user.email}


@router.patch("/auth/users/{user_id}")
async def update_user(user_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "users:manage"):
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
        requested = data["permissions"] if isinstance(data["permissions"], list) else []
        target.permissions = json.dumps([p for p in requested if p != "*"] if not user.is_admin else requested)
    await db.commit()
    return {"id": target.id, "email": target.email}


@router.post("/auth/users/{user_id}/reset_password")
async def reset_password(user_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "users:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(User).where(User.id == user_id))
    target = result.scalar_one_or_none()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Utilizador não encontrado.")
    password = str(data.get("password") or "")
    if len(password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "A palavra-passe deve ter pelo menos 8 caracteres.")
    target.hashed_password = hash_password(password)
    target.token_version = int(target.token_version or 0) + 1
    await db.commit()
    return {"detail": "Senha reposta."}


@router.delete("/auth/users/{user_id}")
async def deactivate_user(user_id: int, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "users:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    target = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not target:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Utilizador não encontrado.")
    if target.id == user.id:
        raise HTTPException(status.HTTP_409_CONFLICT, "Não pode desativar a própria conta.")
    target.active = False
    target.token_version = int(target.token_version or 0) + 1
    await db.commit()
    return {"detail": "Utilizador desativado."}
