import hashlib
import json
import secrets

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, has_perm, require_staff, require_user
from app.core.domain import ORDER_STATUSES, audit, dump_json, load_json, require_choice
from app.models.catalog import Address, CartItem, Notification, Order, Product, User, WishlistItem

router = APIRouter(prefix="/commerce", tags=["commerce"])


class CartIn(BaseModel):
    product_slug: str = Field(min_length=1, max_length=220)
    quantity: int = Field(1, ge=1, le=99)


class QuantityIn(BaseModel):
    quantity: int = Field(ge=1, le=99)


class AddressIn(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    label: str = Field("Casa", max_length=120)
    name: str = Field("", max_length=200)
    phone: str = Field("", max_length=40)
    city: str = Field("Luanda", max_length=120)
    address: str = Field("", min_length=10, max_length=3000)
    full_address: str | None = Field(None, min_length=10, max_length=3000)
    reference: str = Field("", max_length=1000)
    is_default: bool = Field(False, alias="isDefault")


class AddressPatch(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)
    label: str | None = Field(None, max_length=120)
    name: str | None = Field(None, max_length=200)
    phone: str | None = Field(None, max_length=40)
    city: str | None = Field(None, max_length=120)
    address: str | None = Field(None, max_length=3000)
    full_address: str | None = Field(None, max_length=3000)
    reference: str | None = Field(None, max_length=1000)
    is_default: bool | None = Field(None, alias="isDefault")


class OrderIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    customer_name: str = Field(min_length=2, max_length=255)
    customer_email: str = Field(min_length=3, max_length=255)
    customer_phone: str = Field("", max_length=40)
    items: list[dict] = Field(min_length=1, max_length=100)
    shipping: int = Field(0, ge=0, le=100_000_000)
    payment_method: str = Field("no_pagamento", max_length=30)
    shipping_address: dict = Field(default_factory=dict)


def _product_summary(product: Product) -> dict:
    return {"id": product.id, "slug": product.slug, "name": product.name, "image": product.image,
            "price": str(product.price), "active": product.active, "status": product.status}


def _address_out(address: Address) -> dict:
    return {"id": address.id, "label": address.label, "name": address.name, "phone": address.phone,
            "city": address.city, "address": address.full_address, "full_address": address.full_address,
            "reference": address.reference, "is_default": address.is_default}


def _notification_out(notification: Notification) -> dict:
    return {"id": notification.id, "title": notification.title, "body": notification.body,
            "message": notification.body, "type": notification.type or "system",
            "metadata": load_json(notification.metadata_json, {}), "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None}


def _order_out(order: Order) -> dict:
    return {"id": order.id, "order_number": order.order_number, "user_email": order.user_email,
            "customer_name": order.customer_name, "customer_email": order.customer_email,
            "guest_email": order.customer_email, "customer_phone": order.customer_phone,
            "shipping_address": load_json(order.shipping_address, {}), "items": load_json(order.items, []),
            "subtotal": order.subtotal, "shipping": order.shipping, "total": order.total,
            "status": order.status, "payment_method": order.payment_method,
            "created_at": order.created_at.isoformat() if order.created_at else None,
            "updated_at": order.updated_at.isoformat() if order.updated_at else None}


async def _active_product(db: AsyncSession, slug: str) -> Product:
    product = (await db.execute(select(Product).where(Product.slug == slug, Product.active.is_(True), Product.status == "published"))).scalar_one_or_none()
    if not product: raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto indisponível.")
    return product


@router.get("/cart")
async def cart(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(CartItem).where(CartItem.user_email == user.email).order_by(CartItem.id))).scalars().all()
    out = []
    for row in rows:
        product = (await db.execute(select(Product).where(Product.slug == row.product_slug))).scalar_one_or_none()
        out.append({"id": row.id, "product_slug": row.product_slug, "quantity": row.quantity, "product": _product_summary(product) if product else None})
    return out


@router.post("/cart", status_code=status.HTTP_201_CREATED)
async def add_to_cart(data: CartIn, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    product = await _active_product(db, data.product_slug)
    item = (await db.execute(select(CartItem).where(CartItem.user_email == user.email, CartItem.product_slug == product.slug))).scalar_one_or_none()
    if item: item.quantity = min(99, item.quantity + data.quantity)
    else: item = CartItem(user_email=user.email, product_slug=product.slug, quantity=data.quantity); db.add(item)
    await db.commit(); await db.refresh(item); return {"id": item.id, "quantity": item.quantity}


@router.patch("/cart/{item_id}/update_quantity")
async def update_quantity(item_id: int, data: QuantityIn, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    item = (await db.execute(select(CartItem).where(CartItem.id == item_id, CartItem.user_email == user.email))).scalar_one_or_none()
    if not item: raise HTTPException(status.HTTP_404_NOT_FOUND, "Item não encontrado.")
    await _active_product(db, item.product_slug); item.quantity = data.quantity; await db.commit(); return {"id": item.id, "quantity": item.quantity}


@router.post("/cart/clear")
async def clear_cart(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    await db.execute(delete(CartItem).where(CartItem.user_email == user.email)); await db.commit(); return {"detail": "Carrinho limpo."}


@router.delete("/cart/{item_id}")
async def remove_cart(item_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(CartItem).where(CartItem.id == item_id, CartItem.user_email == user.email))
    if not result.rowcount: raise HTTPException(status.HTTP_404_NOT_FOUND, "Item não encontrado.")
    await db.commit(); return {"detail": "Removido."}


@router.get("/cart/count")
async def cart_count(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    count = (await db.execute(select(func.coalesce(func.sum(CartItem.quantity), 0)).where(CartItem.user_email == user.email))).scalar() or 0
    return {"count": int(count)}


@router.post("/wishlist/toggle")
async def wishlist_toggle(data: dict, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    slug = str(data.get("product") or "").strip(); await _active_product(db, slug)
    item = (await db.execute(select(WishlistItem).where(WishlistItem.user_email == user.email, WishlistItem.product_slug == slug))).scalar_one_or_none()
    if item: await db.delete(item); await db.commit(); return {"favorited": False}
    db.add(WishlistItem(user_email=user.email, product_slug=slug)); await db.commit(); return {"favorited": True}


@router.get("/wishlist")
async def wishlist(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(WishlistItem).where(WishlistItem.user_email == user.email).order_by(WishlistItem.id.desc()))).scalars().all()
    out = []
    for row in rows:
        product = (await db.execute(select(Product).where(Product.slug == row.product_slug))).scalar_one_or_none()
        out.append({"id": row.id, "product": _product_summary(product) if product else None})
    return out


@router.get("/wishlist/is_favorited")
async def wishlist_status(product: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_user)):
    item_id = (await db.execute(select(WishlistItem.id).where(WishlistItem.user_email == user.email, WishlistItem.product_slug == product))).scalar_one_or_none()
    return {"favorited": item_id is not None}


@router.delete("/wishlist/{item_id}")
async def wishlist_delete(item_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(WishlistItem).where(WishlistItem.id == item_id, WishlistItem.user_email == user.email))
    if not result.rowcount: raise HTTPException(status.HTTP_404_NOT_FOUND, "Favorito não encontrado.")
    await db.commit(); return {"detail": "Removido."}


@router.get("/addresses")
async def addresses(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Address).where(Address.user_email == user.email).order_by(Address.is_default.desc(), Address.id.desc()))).scalars().all()
    return [_address_out(row) for row in rows]


async def _set_only_default(db: AsyncSession, user_email: str, address_id: int) -> None:
    rows = (await db.execute(select(Address).where(Address.user_email == user_email))).scalars().all()
    found = False
    for row in rows: row.is_default = row.id == address_id; found = found or row.id == address_id
    if not found: raise HTTPException(status.HTTP_404_NOT_FOUND, "Morada não encontrada.")


@router.post("/addresses", status_code=status.HTTP_201_CREATED)
async def create_address(data: AddressIn, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    full_address = (data.full_address or data.address).strip()
    if not full_address or len(full_address) < 10: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Morada deve ter pelo menos 10 caracteres.")
    if data.phone and not data.phone.replace(" ", "").replace("+", "").replace("-", "").isdigit():
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Telefone inválido. Use formato +244 9XX XXX XXX.")
    existing_count = (await db.execute(select(func.count(Address.id)).where(Address.user_email == user.email))).scalar() or 0
    if existing_count >= 5:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Limite de 5 moradas atingido.")
    address = Address(user_email=user.email, label=data.label, name=data.name, phone=data.phone, city=data.city,
                      full_address=full_address, reference=data.reference, is_default=data.is_default or existing_count == 0)
    if address.is_default:
        rows = (await db.execute(select(Address).where(Address.user_email == user.email))).scalars().all()
        for row in rows: row.is_default = False
    db.add(address); await db.commit(); await db.refresh(address); return _address_out(address)


@router.patch("/addresses/{address_id}")
async def update_address(address_id: int, data: AddressPatch, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    address = (await db.execute(select(Address).where(Address.id == address_id, Address.user_email == user.email))).scalar_one_or_none()
    if not address: raise HTTPException(status.HTTP_404_NOT_FOUND, "Morada não encontrada.")
    values = data.model_dump(exclude_unset=True)
    if "address" in values: values["full_address"] = values.pop("address")
    for key, value in values.items(): setattr(address, key, value)
    if values.get("is_default"): await _set_only_default(db, user.email, address.id)
    await db.commit(); await db.refresh(address); return _address_out(address)


@router.post("/addresses/{address_id}/set_default")
async def set_default(address_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    await _set_only_default(db, user.email, address_id); await db.commit(); return {"detail": "Morada padrão."}


@router.delete("/addresses/{address_id}")
async def delete_address(address_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    address = (await db.execute(select(Address).where(Address.id == address_id, Address.user_email == user.email))).scalar_one_or_none()
    if not address: raise HTTPException(status.HTTP_404_NOT_FOUND, "Morada não encontrada.")
    was_default = address.is_default; await db.delete(address); await db.flush()
    if was_default:
        replacement = (await db.execute(select(Address).where(Address.user_email == user.email).order_by(Address.id.desc()).limit(1))).scalar_one_or_none()
        if replacement: replacement.is_default = True
    await db.commit(); return {"detail": "Morada removida."}


@router.get("/notifications")
async def notifications(page_size: int = Query(100, ge=1, le=200), user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Notification).where(Notification.user_email == user.email).order_by(Notification.created_at.desc()).limit(page_size))).scalars().all()
    return [_notification_out(row) for row in rows]


@router.get("/notifications/unread_count")
async def unread_count(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    count = (await db.execute(select(func.count(Notification.id)).where(Notification.user_email == user.email, Notification.is_read.is_(False)))).scalar() or 0
    return {"count": count}


@router.post("/notifications/{notification_id}/mark_read")
async def mark_read(notification_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    notification = (await db.execute(select(Notification).where(Notification.id == notification_id, Notification.user_email == user.email))).scalar_one_or_none()
    if not notification: raise HTTPException(status.HTTP_404_NOT_FOUND, "Notificação não encontrada.")
    notification.is_read = True; await db.commit(); return {"detail": "Lida."}


@router.post("/notifications/mark_all_read")
async def mark_all_read(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Notification).where(Notification.user_email == user.email, Notification.is_read.is_(False)))).scalars().all()
    for row in rows: row.is_read = True
    await db.commit(); return {"detail": "Todas lidas."}


@router.delete("/notifications/{notification_id}")
async def delete_notification(notification_id: int, user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(Notification).where(Notification.id == notification_id, Notification.user_email == user.email))
    if not result.rowcount: raise HTTPException(status.HTTP_404_NOT_FOUND, "Notificação não encontrada.")
    await db.commit(); return {"detail": "Removida."}


@router.post("/orders", status_code=status.HTTP_201_CREATED)
async def create_order(data: OrderIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    snapshots = []
    for raw in data.items:
        slug = str(raw.get("slug") or raw.get("product_slug") or raw.get("productId") or raw.get("product_id") or "").strip()
        quantity = int(raw.get("quantity") or 1)
        if quantity < 1 or quantity > 99: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Quantidade inválida.")
        product = await _active_product(db, slug)
        snapshots.append({"product_id": product.id, "slug": product.slug, "name": product.name, "image": product.image, "price": product.price, "quantity": quantity})
    subtotal = sum(item["price"] * item["quantity"] for item in snapshots)
    access_token = "ord_" + secrets.token_urlsafe(24)
    order = Order(order_number="ORD-" + secrets.token_hex(4).upper(), access_token_hash=hashlib.sha256(access_token.encode()).hexdigest(),
                  user_email=user.email if user else None, customer_name=data.customer_name.strip(), customer_email=data.customer_email.strip().lower(),
                  customer_phone=data.customer_phone.strip(), items=dump_json(snapshots), subtotal=subtotal, shipping=data.shipping,
                  total=subtotal + data.shipping, payment_method=data.payment_method, shipping_address=dump_json(data.shipping_address), status="pending")
    db.add(order); await db.flush()
    if user:
        db.add(Notification(user_email=user.email, title=f"Pedido {order.order_number} recebido", body="O seu pedido foi registado com sucesso.", type="order", metadata_json=dump_json({"link": f"/conta/pedidos/{order.id}"})))
    await db.commit(); await db.refresh(order)
    return {**_order_out(order), "access_token": access_token}


@router.get("/orders/by_number")
async def order_by_number(order_number: str, access_token: str, db: AsyncSession = Depends(get_db)):
    order = (await db.execute(select(Order).where(Order.order_number == order_number))).scalar_one_or_none()
    if not order or not access_token or not secrets.compare_digest(hashlib.sha256(access_token.encode()).hexdigest(), order.access_token_hash or ""):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Encomenda não encontrada.")
    return _order_out(order)


@router.get("/orders/mine")
async def my_orders(user: User = Depends(require_user), db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Order).where(Order.user_email == user.email).order_by(Order.created_at.desc()))).scalars().all()
    return [_order_out(row) for row in rows]


@router.get("/orders/manage")
async def manage_orders(page: int = Query(1, ge=1), page_size: int = Query(50, ge=1, le=200), status_filter: str | None = Query(None, alias="status"),
                        db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "orders:read"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    q = select(Order)
    if status_filter: q = q.where(Order.status == require_choice(status_filter, ORDER_STATUSES))
    q = q.order_by(Order.created_at.desc()); total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return {"count": total, "next": None, "previous": None, "results": [_order_out(row) for row in rows]}


@router.get("/orders/{order_id}")
async def order_detail(order_id: int, db: AsyncSession = Depends(get_db), user: User = Depends(require_user)):
    order = (await db.execute(select(Order).where(Order.id == order_id))).scalar_one_or_none()
    if not order: raise HTTPException(status.HTTP_404_NOT_FOUND, "Encomenda não encontrada.")
    is_staff = (user.is_staff or user.is_admin) and has_perm(user, "orders:read")
    if not is_staff and order.user_email != user.email: raise HTTPException(status.HTTP_404_NOT_FOUND, "Encomenda não encontrada.")
    return _order_out(order)


@router.post("/orders/manage/{order_id}/update_status")
async def update_order_status(order_id: int, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "orders:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    new_status = require_choice(str(data.get("status") or ""), ORDER_STATUSES)
    order = (await db.execute(select(Order).where(Order.id == order_id).with_for_update())).scalar_one_or_none()
    if not order: raise HTTPException(status.HTTP_404_NOT_FOUND, "Encomenda não encontrada.")
    previous = order.status; order.status = new_status
    if order.user_email:
        db.add(Notification(user_email=order.user_email, title=f"Pedido {order.order_number} atualizado", body=f"O estado mudou de {previous} para {new_status}.", type="order", metadata_json=dump_json({"link": f"/conta/pedidos/{order.id}"})))
    await audit(db, user, "order.status", str(order.id), {"from": previous, "to": new_status}); await db.commit(); await db.refresh(order)
    return _order_out(order)
