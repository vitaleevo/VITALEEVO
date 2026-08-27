import hashlib
import json
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_staff
from app.models.catalog import Product, Quote, User

router = APIRouter(prefix="/quotes", tags=["quotes"])


class QuoteItemIn(BaseModel := dict):
    pass


def _quote_out(q: Quote, public: bool = False) -> dict:
    try:
        items = json.loads(q.items)
    except ValueError:
        items = []
    out = {
        "id": q.id,
        "public_id": q.public_id,
        "status": q.status,
        "items": items,
        "item_count": len(items),
        "notes": q.notes,
        "created_at": q.created_at.isoformat() if q.created_at else None,
    }
    if not public:
        out.update(
            {
                "customer_name": q.customer_name,
                "customer_email": q.customer_email,
                "customer_phone": q.customer_phone,
            }
        )
    return out


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_quote(data: dict, db: AsyncSession = Depends(get_db)):
    import re

    if not data.get("items") or not isinstance(data["items"], list) or not data["items"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Itens obrigatórios.")
    public_id = "VTLE-" + secrets.token_hex(4).upper()
    access_token = "qt_" + secrets.token_urlsafe(24)
    quote = Quote(
        public_id=public_id,
        access_token_hash=hashlib.sha256(access_token.encode()).hexdigest(),
        customer_name=str(data.get("customer_name") or ""),
        customer_email=str(data.get("customer_email") or ""),
        customer_phone=str(data.get("customer_phone") or ""),
        items=json.dumps(data["items"], ensure_ascii=False),
        notes=str(data.get("notes") or ""),
    )
    db.add(quote)
    await db.commit()
    await db.refresh(quote)
    return {
        "public_id": quote.public_id,
        "status": quote.status,
        "access_token": access_token,
        "item_count": len(data["items"]),
    }


@router.post("/status")
async def quote_status(data: dict, db: AsyncSession = Depends(get_db)):
    public_id = data.get("public_id")
    token = data.get("access_token")
    result = await db.execute(select(Quote).where(Quote.public_id == public_id))
    quote = result.scalar_one_or_none()
    if not quote or not token:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    if hashlib.sha256(token.encode()).hexdigest() != quote.access_token_hash:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Token inválido.")
    return _quote_out(quote, public=True)


@router.get("/manage")
async def manage_quotes(
    page: int = 1,
    page_size: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(require_staff),
):
    q = select(Quote).order_by(Quote.created_at.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return {
        "count": total,
        "next": f"/api/v1/quotes/manage?page={page + 1}" if page * page_size < total else None,
        "previous": f"/api/v1/quotes/manage?page={page - 1}" if page > 1 else None,
        "results": [_quote_out(x) for x in rows],
    }


@router.get("/manage/stats")
async def quote_stats(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    total = (await db.execute(select(func.count(Quote.id)))).scalar() or 0
    return {"total": total, "pending": total}


@router.get("/manage/{quote_id}")
async def quote_detail(quote_id: int, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result = await db.execute(select(Quote).where(Quote.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    return _quote_out(quote)


@router.post("/manage/{quote_id}/status")
async def set_quote_status(quote_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result = await db.execute(select(Quote).where(Quote.id == quote_id))
    quote = result.scalar_one_or_none()
    if not quote:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Cotação não encontrada.")
    quote.status = str(data.get("status") or quote.status)
    await db.commit()
    return _quote_out(quote)
