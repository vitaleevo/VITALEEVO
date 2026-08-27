import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, has_perm, require_staff
from app.models.catalog import Brand, Category, Product, User

router = APIRouter(prefix="/catalog", tags=["catalog"])


class ProductIn(BaseModel):
    name: str
    slug: str | None = None
    sku: str | None = None
    description: str = ""
    image: str | None = None
    price: int = 0
    old_price: int | None = None
    brand: str | None = None
    category: str | None = None
    subcategory: str | None = None
    stock: int = 0
    is_new: bool = False
    is_featured: bool = False


class CategoryIn(BaseModel):
    name: str
    slug: str | None = None
    parent_slug: str | None = None
    type: str = "store"
    description: str = ""


class BrandIn(BaseModel):
    name: str
    slug: str | None = None


def _slugify_simple(value: str) -> str:
    import re
    import unicodedata

    value = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value).strip()
    return re.sub(r"[-\s]+", "-", value) or "item"


def _product_out(p: Product) -> dict:
    return {
        "id": p.id,
        "name": p.name,
        "slug": p.slug,
        "sku": p.sku,
        "description": p.description,
        "image": p.image,
        "price": str(p.price),
        "old_price": str(p.old_price) if p.old_price else None,
        "category": p.category,
        "category_name": p.category,
        "subcategory": p.subcategory,
        "subcategory_name": p.subcategory,
        "brand": p.brand,
        "brand_name": p.brand,
        "stock": p.stock,
        "is_new": p.is_new,
        "is_featured": p.is_featured,
        "rating": "0.00",
        "review_count": 0,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _paginated(rows: list, total: int, page: int, page_size: int, base_path: str) -> dict:
    has_next = page * page_size < total
    has_prev = page > 1
    return {
        "count": total,
        "next": f"{base_path}?page={page + 1}&page_size={page_size}" if has_next else None,
        "previous": f"{base_path}?page={page - 1}&page_size={page_size}" if has_prev else None,
        "results": rows,
    }


@router.get("/products")
async def list_products(
    page: int = 1,
    page_size: int = Query(20, le=100),
    search: str | None = None,
    category: str | None = None,
    brand: str | None = None,
    is_featured: bool | None = None,
    sort: str | None = None,
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = select(Product).where(Product.active.is_(True))
    if not (user and has_perm(user, "catalog:read")):
        q = q.where(Product.active.is_(True))
    if search:
        like = f"%{search}%"
        q = q.where(or_(Product.name.ilike(like), Product.description.ilike(like)))
    if category:
        q = q.where(or_(Product.category == category, Product.subcategory == category))
    if brand:
        q = q.where(Product.brand == brand)
    if is_featured is not None:
        q = q.where(Product.is_featured == is_featured)
    if sort == "-price":
        q = q.order_by(Product.price.desc())
    elif sort == "price":
        q = q.order_by(Product.price.asc())
    else:
        q = q.order_by(Product.created_at.desc())

    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return _paginated([_product_out(p) for p in rows], total, page, page_size, "/api/v1/catalog/products")


@router.get("/products/{slug}")
async def get_product(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product or not product.active:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    return _product_out(product)


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    product = Product(**data.model_dump(exclude_none=True))
    if not product.slug:
        product.slug = _slugify_simple(product.name)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return _product_out(product)


@router.patch("/products/{slug}")
async def update_product(slug: str, data: ProductIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    for k, v in data.model_dump(exclude_none=True).items():
        setattr(product, k, v)
    await db.commit()
    await db.refresh(product)
    return _product_out(product)


@router.delete("/products/{slug}")
async def delete_product(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    product.active = False
    await db.commit()
    return {"detail": "Produto removido."}


@router.post("/products/{slug}/adjust_stock")
async def adjust_stock(slug: str, data: dict, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "stock:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    product.stock += int(data.get("quantity", 0))
    await db.commit()
    return {"stock": product.stock}


@router.get("/products/{slug}/movements")
async def stock_movements(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    result = await db.execute(select(Product).where(Product.slug == slug))
    product = result.scalar_one_or_none()
    if not product:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    return {"stock": product.stock, "history": []}


@router.get("/categories")
async def list_categories(type: str | None = None, db: AsyncSession = Depends(get_db)):
    q = select(Category).where(Category.active.is_(True))
    if type:
        q = q.where(Category.type == type)
    q = q.order_by(Category.name)
    rows = (await db.execute(q)).scalars().all()
    return [
        {
            "id": c.id,
            "name": c.name,
            "slug": c.slug,
            "parent": c.parent_slug,
            "type": c.type,
            "description": c.description,
        }
        for c in rows
    ]


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    cat = Category(**data.model_dump(exclude_none=True))
    if not cat.slug:
        cat.slug = _slugify_simple(cat.name)
    db.add(cat)
    await db.commit()
    await db.refresh(cat)
    return {"id": cat.id, "name": cat.name, "slug": cat.slug, "parent": cat.parent_slug}


@router.get("/brands")
async def list_brands(page_size: int = 100, db: AsyncSession = Depends(get_db)):
    rows = (await db.execute(select(Brand).where(Brand.active.is_(True)).order_by(Brand.name))).scalars().all()
    return {"count": len(rows), "results": [{"id": b.id, "name": b.name, "slug": b.slug} for b in rows]}


@router.post("/brands", status_code=status.HTTP_201_CREATED)
async def create_brand(data: BrandIn, db: AsyncSession = Depends(get_db), user: User | None = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"):
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    brand = Brand(**data.model_dump(exclude_none=True))
    if not brand.slug:
        brand.slug = _slugify_simple(brand.name)
    db.add(brand)
    await db.commit()
    await db.refresh(brand)
    return {"id": brand.id, "name": brand.name, "slug": brand.slug}
