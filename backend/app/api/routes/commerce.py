import json
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, require_user
from app.models.catalog import (
    Address,
    CartItem,
    Notification,
    Order,
    Product,
    User,
    WishlistItem,
)

router = APIRouter(prefix="/commerce", tags=["commerce"])


def _slugify(value: str) -> str:
    import re
    import unicodedata

    value = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value).strip()
    return re.sub(r"[-\s]+", "-", value) or "item"


@router.get("/cart")
async def cart(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(CartItem).where(CartItem.user_email == user.email))).scalars().all()
    out = []
    for row in rows:
        result = await db.execute(select(Product).where(Product.slug == row.product_slug))
        product = result.scalar_one_or_none()
        out.append(
            {
                "id": row.id,
                "product_slug": row.product_slug,
                "quantity": row.quantity,
                "product": {"id": product.id, "slug": product.slug, "name": product.name, "image": product.image, "price": str(product.price)} if product else None,
            }
        )
    return out


@router.post("/cart")
async def add_to_cart(data: dict, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    slug = data.get("product_slug")
    quantity = int(data.get("quantity") or 1)
    result = await db.execute(select(CartItem).where(CartItem.user_email == user.email, CartItem.product_slug == slug))
    item = result.scalar_one_or_none()
    if item:
        item.quantity += quantity
    else:
        item = CartItem(user_email=user.email, product_slug=slug, quantity=quantity)
        db.add(item)
    await db.commit()
    return {"id": item.id, "quantity": item.quantity}


@router.patch("/cart/{item_id}/update_quantity")
async def update_quantity(item_id: int, data: dict, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.user_email == user.email))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Item não encontrado.")
    item.quantity = int(data.get("quantity") or 1)
    await db.commit()
    return {"id": item.id, "quantity": item.quantity}


@router.post("/cart/clear")
async def clear_cart(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.user_email == user.email))
    await db.commit()
    return {"detail": "Carrinho limpo."}


@router.delete("/cart/{item_id}")
async def remove_cart(item_id: int, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.id == item_id, CartItem.user_email == user.email))
    await db.commit()
    return {"detail": "Removido."}


@router.post("/wishlist/toggle")
async def wishlist_toggle(data: dict, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    slug = data.get("product")
    result = await db.execute(select(WishlistItem).where(WishlistItem.user_email == user.email, WishlistItem.product_slug == slug))
    item = result.scalar_one_or_none()
    if item:
        await db.delete(item)
        await db.commit()
        return {"favorited": False}
    db.add(WishlistItem(user_email=user.email, product_slug=slug))
    await db.commit()
    return {"favorited": True}


@router.get("/wishlist")
async def wishlist(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(WishlistItem).where(WishlistItem.user_email == user.email))).scalars().all()
    out = []
    for row in rows:
        result = await db.execute(select(Product).where(Product.slug == row.product_slug))
        product = result.scalar_one_or_none()
        out.append(
            {
                "id": row.id,
                "product": {"id": product.id, "slug": product.slug, "name": product.name, "image": product.image, "price": str(product.price)} if product else None,
            }
        )
    return out


@router.get("/wishlist/is_favorited")
async def wishlist_status(data: dict | None = None, product: str | None = None, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_user)):
    slug = product or (data or {}).get("product")
    result = await db.execute(select(WishlistItem.id).where(WishlistItem.user_email == user.email, WishlistItem.product_slug == slug))
    return {"favorited": result.scalar_one_or_none() is not None}


@router.get("/addresses")
async def addresses(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Address).where(Address.user_email == user.email))).scalars().all()
    return [{"id": a.id, "label": a.label, "full_address": a.full_address, "is_default": a.is_default} for a in rows]


@router.post("/addresses")
async def create_address(data: dict, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    addr = Address(user_email=user.email, label=data.get("label", "Morada"), full_address=data.get("full_address", ""))
    db.add(addr)
    await db.commit()
    return {"id": addr.id, "label": addr.label, "full_address": addr.full_address, "is_default": addr.is_default}


@router.patch("/addresses/{addr_id}/set_default")
async def set_default(addr_id: int, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Address).where(Address.user_email == user.email))).scalars().all()
    for a in rows:
        a.is_default = a.id == addr_id
    await db.commit()
    return {"detail": "Morada padrão."}


@router.get("/notifications")
async def notifications(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Notification).where(Notification.user_email == user.email).order_by(Notification.created_at.desc()))).scalars().all()
    return [{"id": n.id, "title": n.title, "body": n.body, "is_read": n.is_read, "created_at": n.created_at.isoformat() if n.created_at else None} for n in rows]


@router.get("/notifications/unread_count")
async def unread_count(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Notification).where(Notification.user_email == user.email, Notification.is_read.is_(False)))).scalars().all()
    return {"count": len(rows)}


@router.post("/orders")
async def create_order(data: dict, db: AsyncSession = Depends(get_db)):
    items = data.get("items") or []
    if not items:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Itens obrigatórios.")
    subtotal = sum(int(i.get("price") or 0) * int(i.get("quantity") or 1) for i in items)
    shipping = int(data.get("shipping") or 0)
    order = Order(
        order_number="ORD-" + secrets.token_hex(4).upper(),
        user_email=(data.get("user_email") or "").lower() or None,
        customer_name=str(data.get("customer_name") or ""),
        customer_email=str(data.get("customer_email") or ""),
        customer_phone=str(data.get("customer_phone") or ""),
        items=json.dumps(items, ensure_ascii=False),
        subtotal=subtotal,
        shipping=shipping,
        total=subtotal + shipping,
        payment_method=str(data.get("payment_method") or "no_pagamento"),
    )
    db.add(order)
    await db.commit()
    await db.refresh(order)
    return {"order_number": order.order_number, "status": order.status, "total": order.total}


@router.get("/orders/mine")
async def my_orders(user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Order).where(Order.user_email == user.email).order_by(Order.created_at.desc()))).scalars().all()
    return [_order_out(o) for o in rows]


@router.get("/orders/manage")
async def manage_orders(db: AsyncSession = Depends(get_db), user: User | None = Depends(require_user)):
    if not user.is_staff and not user.is_admin:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    rows = (await db.execute(select(Order).order_by(Order.created_at.desc()))).scalars().all()
    return {"count": len(rows), "results": [_order_out(o) for o in rows]}


@router.get("/orders/{order_id}")
async def order_detail(order_id: int, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_user)):
    result = await db.execute(select(Order).where(Order.id == order_id))
    order = result.scalar_one_or_none()
    if not order:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Encomenda não encontrada.")
    return _order_out(order)


def _order_out(o: Order) -> dict:
    try:
        items = json.loads(o.items)
    except ValueError:
        items = []
    return {
        "id": o.id,
        "order_number": o.order_number,
        "customer_name": o.customer_name,
        "customer_email": o.customer_email,
        "customer_phone": o.customer_phone,
        "items": items,
        "subtotal": o.subtotal,
        "shipping": o.shipping,
        "total": o.total,
        "status": o.status,
        "payment_method": o.payment_method,
        "created_at": o.created_at.isoformat() if o.created_at else None,
    }
