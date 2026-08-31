import hashlib
import secrets
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, has_perm, require_staff, require_user
from app.core.domain import QUOTE_STATUSES, audit, dump_json, load_json, require_choice
from app.models.catalog import Notification, Product, Quote, User

router = APIRouter(prefix="/quotes", tags=["quotes"])


class QuoteIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: str = Field("", max_length=200)
    customer_email: str = Field("", max_length=255)
    customer_phone: str = Field("", max_length=40)
    name: str | None = Field(None, max_length=200)
    email: str | None = Field(None, max_length=255)
    phone: str | None = Field(None, max_length=40)
    company: str = Field("", max_length=200)
    message: str = Field("", max_length=10_000)
    notes: str = Field("", max_length=10_000)
    items: list[dict] = Field(min_length=1, max_length=100)


def _quote_out(quote: Quote, assigned_user: User | None = None, public: bool = False) -> dict:
    result = {"id": quote.id, "public_id": quote.public_id, "status": quote.status,
              "items": load_json(quote.items, []), "item_count": len(load_json(quote.items, [])),
              "created_at": quote.created_at.isoformat() if quote.created_at else None,
              "updated_at": quote.updated_at.isoformat() if quote.updated_at else None}
    if not public:
        result.update({"name": quote.customer_name, "email": quote.customer_email, "phone": quote.customer_phone,
                       "customer_name": quote.customer_name, "customer_email": quote.customer_email,
                       "customer_phone": quote.customer_phone, "company": quote.company or "", "message": quote.message or "",
                       "notes": quote.notes, "assigned_to": quote.assigned_to,
                       "assigned_to_name": ((assigned_user.first_name + " " + assigned_user.last_name).strip() or assigned_user.email) if assigned_user else None,
                       "next_follow_up_at": quote.next_follow_up_at.isoformat() if quote.next_follow_up_at else None,
                       "proposal": load_json(quote.proposal, {})})
    return result


async def _snapshot_items(db: AsyncSession, raw_items: list[dict]) -> list[dict]:
    snapshots = []
    for raw in raw_items:
        slug = str(raw.get("slug") or raw.get("product_slug") or raw.get("productId") or raw.get("product_id") or "").strip()
        quantity = int(raw.get("quantity") or raw.get("qty") or 1)
        if quantity < 1 or quantity > 99: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Quantidade inválida.")
        product = (await db.execute(select(Product).where(Product.slug == slug, Product.active.is_(True), Product.status == "published"))).scalar_one_or_none()
        if product:
            snapshots.append({"product_id": product.id, "slug": product.slug, "name": product.name, "image": product.image, "quantity": quantity})
        else:
            # Cotações históricas e itens livres permanecem possíveis, sem confiar em preço do cliente.
            name = str(raw.get("name") or slug).strip()
            if not name: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Produto inválido.")
            snapshots.append({"slug": slug, "name": name[:200], "image": raw.get("image"), "quantity": quantity})
    return snapshots


async def _assigned_user(db: AsyncSession, assigned_to: str | None) -> User | None:
    if not assigned_to: return None
    try: user_id = int(assigned_to)
    except ValueError: return None
    return (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_quote(data: QuoteIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    items = await _snapshot_items(db, data.items); public_id = "VTLE-" + secrets.token_hex(4).upper(); access_token = "qt_" + secrets.token_urlsafe(24)
    customer_name = (data.customer_name or data.name or (f"{user.first_name} {user.last_name}" if user else "")).strip()
    customer_email = (data.customer_email or data.email or (user.email if user else "")).strip().lower()
    customer_phone = (data.customer_phone or data.phone or (user.phone if user else "")).strip()
    quote = Quote(public_id=public_id, access_token_hash=hashlib.sha256(access_token.encode()).hexdigest(), user_email=user.email if user else None,
                  customer_name=customer_name, customer_email=customer_email, customer_phone=customer_phone,
                  company=data.company.strip(), message=data.message.strip(), notes=data.notes.strip(), items=dump_json(items), status="new")
    db.add(quote); await db.flush()
    if user:
        db.add(Notification(user_email=user.email, title=f"Cotação {public_id} recebida", body="A sua cotação foi registada e será analisada pela nossa equipa.", type="quote", metadata_json=dump_json({"link": "/conta?tab=quotes"})))
    await db.commit(); await db.refresh(quote)
    return {"public_id": quote.public_id, "status": quote.status, "access_token": access_token, "item_count": len(items)}


@router.post("/status")
async def quote_status(data: dict, db: AsyncSession = Depends(get_db)):
    public_id = str(data.get("public_id") or ""); token = str(data.get("access_token") or "")
    quote = (await db.execute(select(Quote).where(Quote.public_id == public_id))).scalar_one_or_none()
    if not quote or not token or not secrets.compare_digest(hashlib.sha256(token.encode()).hexdigest(), quote.access_token_hash):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    return _quote_out(quote, public=True)


@router.get("/mine")
async def my_quotes(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Quote).where(Quote.user_email == user.email).order_by(Quote.created_at.desc()))).scalars().all()
    # Dono vê dados completos (company/message/proposal), não apenas public_id
    return [_quote_out(row, public=False) for row in rows]


def _require_quotes(user: User, manage: bool = False) -> None:
    permission = "quotes:manage" if manage else "quotes:read"
    if not has_perm(user, permission): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")


@router.get("/manage")
async def manage_quotes(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), status_filter: str | None = Query(None, alias="status"),
                        db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user); q = select(Quote)
    if status_filter: q = q.where(Quote.status == require_choice(status_filter, QUOTE_STATUSES))
    q = q.order_by(Quote.created_at.desc()); total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    results = []
    for row in rows: results.append(_quote_out(row, await _assigned_user(db, row.assigned_to)))
    return {"count": total, "next": None, "previous": None, "results": results}


@router.get("/manage/stats")
async def quote_stats(db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user); rows = (await db.execute(select(Quote.status, func.count(Quote.id)).group_by(Quote.status))).all(); counts = {key: value for key, value in rows}
    return {"total": sum(counts.values()), **counts}


@router.get("/manage/{quote_id}")
async def quote_detail(quote_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user); quote = (await db.execute(select(Quote).where(Quote.id == quote_id))).scalar_one_or_none()
    if not quote: raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    return _quote_out(quote, await _assigned_user(db, quote.assigned_to))


@router.post("/manage/{quote_id}/status")
async def set_quote_status(quote_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user, True); new_status = require_choice(str(data.get("status") or ""), QUOTE_STATUSES)
    quote = (await db.execute(select(Quote).where(Quote.id == quote_id).with_for_update())).scalar_one_or_none()
    if not quote: raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    previous = quote.status; quote.status = new_status
    if quote.user_email:
        db.add(Notification(user_email=quote.user_email, title=f"Cotação {quote.public_id} atualizada", body=f"O estado mudou de {previous} para {new_status}.", type="quote", metadata_json=dump_json({"link": "/conta?tab=quotes"})))
    await audit(db, user, "quote.status", str(quote.id), {"from": previous, "to": new_status}); await db.commit(); await db.refresh(quote)
    return _quote_out(quote, await _assigned_user(db, quote.assigned_to))


@router.post("/manage/{quote_id}/assign")
async def assign_quote(quote_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user, True); quote = (await db.execute(select(Quote).where(Quote.id == quote_id))).scalar_one_or_none()
    if not quote: raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    assigned_to = data.get("assigned_to")
    if assigned_to not in (None, ""):
        assigned = (await db.execute(select(User).where(User.id == int(assigned_to), User.active.is_(True), User.is_staff.is_(True)))).scalar_one_or_none()
        if not assigned: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Colaborador inválido.")
        quote.assigned_to = str(assigned.id)
    else: quote.assigned_to = None
    await audit(db, user, "quote.assign", str(quote.id), {"assigned_to": quote.assigned_to}); await db.commit(); await db.refresh(quote)
    return _quote_out(quote, await _assigned_user(db, quote.assigned_to))


@router.post("/manage/{quote_id}/follow_up")
async def set_follow_up(quote_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user, True); quote = (await db.execute(select(Quote).where(Quote.id == quote_id))).scalar_one_or_none()
    if not quote: raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    raw = data.get("next_follow_up_at")
    try: quote.next_follow_up_at = datetime.fromisoformat(str(raw).replace("Z", "+00:00")) if raw else None
    except ValueError: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Data de follow-up inválida.")
    await audit(db, user, "quote.follow_up", str(quote.id), {"date": raw}); await db.commit(); await db.refresh(quote)
    return _quote_out(quote, await _assigned_user(db, quote.assigned_to))


@router.post("/manage/{quote_id}/proposal")
async def set_proposal(quote_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    _require_quotes(user, True); quote = (await db.execute(select(Quote).where(Quote.id == quote_id))).scalar_one_or_none()
    if not quote: raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    quote.proposal = dump_json(data); await audit(db, user, "quote.proposal", str(quote.id)); await db.commit(); await db.refresh(quote)
    return _quote_out(quote, await _assigned_user(db, quote.assigned_to))
