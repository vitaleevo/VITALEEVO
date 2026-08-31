from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, has_perm, require_staff
from app.core.domain import CONTENT_STATUSES, audit, dump_json, json_list, load_json, require_choice, slugify
from app.models.catalog import Brand, Category, InventoryMovement, Product, User

router = APIRouter(prefix="/catalog", tags=["catalog"])


class ProductIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=2, max_length=200)
    slug: str | None = Field(None, max_length=220)
    sku: str | None = Field(None, max_length=80)
    description: str = Field("", max_length=50_000)
    image: str | None = Field(None, max_length=500)
    gallery: list[str] | str = Field(default_factory=list)
    specifications: dict | str = Field(default_factory=dict)
    price: int = Field(0, ge=0, le=2_000_000_000)
    old_price: int | None = Field(None, ge=0, le=2_000_000_000)
    brand: str | None = Field(None, max_length=120)
    category: str | None = Field(None, max_length=140)
    subcategory: str | None = Field(None, max_length=140)
    stock: int = Field(0, ge=0, le=100_000_000)
    is_new: bool = False
    is_featured: bool = False
    status: str = "draft"
    active: bool = True


class ProductPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(None, min_length=2, max_length=200)
    slug: str | None = Field(None, max_length=220)
    sku: str | None = Field(None, max_length=80)
    description: str | None = Field(None, max_length=50_000)
    image: str | None = Field(None, max_length=500)
    gallery: list[str] | str | None = None
    specifications: dict | str | None = None
    price: int | None = Field(None, ge=0, le=2_000_000_000)
    old_price: int | None = Field(None, ge=0, le=2_000_000_000)
    brand: str | None = Field(None, max_length=120)
    category: str | None = Field(None, max_length=140)
    subcategory: str | None = Field(None, max_length=140)
    stock: int | None = Field(None, ge=0, le=100_000_000)
    is_new: bool | None = None
    is_featured: bool | None = None
    status: str | None = None
    active: bool | None = None


class CategoryIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=2, max_length=120)
    slug: str | None = Field(None, max_length=140)
    parent_slug: str | None = Field(None, max_length=140)
    type: str = Field("store", pattern="^(store|blog|portfolio)$")
    description: str = Field("", max_length=3000)
    active: bool = True


class CategoryPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(None, min_length=2, max_length=120)
    slug: str | None = Field(None, max_length=140)
    parent_slug: str | None = Field(None, max_length=140)
    type: str | None = Field(None, pattern="^(store|blog|portfolio)$")
    description: str | None = Field(None, max_length=3000)
    active: bool | None = None


class BrandIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str = Field(min_length=2, max_length=120)
    slug: str | None = Field(None, max_length=140)
    active: bool = True


class BrandPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    name: str | None = Field(None, min_length=2, max_length=120)
    slug: str | None = Field(None, max_length=140)
    active: bool | None = None


def _product_out(product: Product) -> dict:
    return {
        "id": product.id, "name": product.name, "slug": product.slug, "sku": product.sku,
        "description": product.description, "image": product.image, "gallery": load_json(product.gallery, []),
        "specifications": load_json(product.specifications, {}), "price": str(product.price),
        "old_price": str(product.old_price) if product.old_price is not None else None,
        "category": product.category, "category_name": product.category,
        "subcategory": product.subcategory, "subcategory_name": product.subcategory,
        "brand": product.brand, "brand_name": product.brand, "stock": product.stock,
        "is_new": product.is_new, "is_featured": product.is_featured, "active": product.active,
        "status": product.status or ("published" if product.active else "archived"),
        "rating": "0.00", "review_count": 0,
        "created_at": product.created_at.isoformat() if product.created_at else None,
        "updated_at": product.updated_at.isoformat() if product.updated_at else None,
    }


def _category_out(category: Category) -> dict:
    return {"id": category.id, "name": category.name, "slug": category.slug, "parent": category.parent_slug,
            "parent_slug": category.parent_slug, "type": category.type, "description": category.description,
            "active": category.active}


def _brand_out(brand: Brand) -> dict:
    return {"id": brand.id, "name": brand.name, "slug": brand.slug, "active": brand.active}


def _can_read_catalog(user: User | None) -> bool:
    return bool(user and has_perm(user, "catalog:read"))


async def _validate_taxonomy(db: AsyncSession, category: str | None, subcategory: str | None, brand: str | None) -> None:
    if category:
        row = (await db.execute(select(Category).where(Category.slug == category, Category.type == "store", Category.active.is_(True)))).scalar_one_or_none()
        if not row: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Categoria inválida.")
    if subcategory:
        row = (await db.execute(select(Category).where(Category.slug == subcategory, Category.type == "store", Category.active.is_(True)))).scalar_one_or_none()
        if not row or (category and row.parent_slug != category):
            raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Subcategoria inválida para a categoria selecionada.")
    if brand:
        row = (await db.execute(select(Brand).where(Brand.slug == brand, Brand.active.is_(True)))).scalar_one_or_none()
        # O legado guarda nomes de marca; aceita nome ou slug enquanto o frontend é migrado.
        if not row:
            row = (await db.execute(select(Brand).where(Brand.name == brand, Brand.active.is_(True)))).scalar_one_or_none()
        if not row: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Marca inválida.")


async def _ensure_product_uniques(db: AsyncSession, slug: str, sku: str | None, product_id: int | None = None) -> None:
    slug_query = select(Product.id).where(func.lower(Product.slug) == slug.lower())
    if product_id: slug_query = slug_query.where(Product.id != product_id)
    if (await db.execute(slug_query)).scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    if sku:
        sku_query = select(Product.id).where(func.lower(Product.sku) == sku.lower())
        if product_id: sku_query = sku_query.where(Product.id != product_id)
        if (await db.execute(sku_query)).scalar_one_or_none():
            raise HTTPException(status.HTTP_409_CONFLICT, "SKU já existe.")


def _product_values(data: ProductIn | ProductPatch, patch: bool = False) -> dict:
    values = data.model_dump(exclude_unset=patch)
    if "gallery" in values and values["gallery"] is not None: values["gallery"] = dump_json(json_list(values["gallery"], max_items=12))
    if "specifications" in values and values["specifications"] is not None:
        raw = values["specifications"]
        if isinstance(raw, str):
            import json
            try: raw = json.loads(raw)
            except ValueError: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Especificações devem ser um objeto JSON.")
        if not isinstance(raw, dict): raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Especificações devem ser um objeto.")
        values["specifications"] = dump_json(raw)
    if values.get("status"):
        values["status"] = require_choice(values["status"], CONTENT_STATUSES)
        values["active"] = values["status"] == "published"
    if values.get("sku"): values["sku"] = values["sku"].strip().upper()
    return values


@router.get("/products")
async def list_products(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=200), search: str | None = None,
                        category: str | None = None, brand: str | None = None, is_featured: bool | None = None,
                        status_filter: str | None = Query(None, alias="status"), sort: str | None = None,
                        ordering: str | None = None, db: AsyncSession = Depends(get_db),
                        user: User | None = Depends(get_current_user)):
    q = select(Product)
    if _can_read_catalog(user):
        if status_filter: q = q.where(Product.status == require_choice(status_filter, CONTENT_STATUSES))
    else: q = q.where(Product.active.is_(True), Product.status == "published")
    if search: q = q.where(or_(Product.name.ilike(f"%{search}%"), Product.description.ilike(f"%{search}%"), Product.sku.ilike(f"%{search}%")))
    if category: q = q.where(or_(Product.category == category, Product.subcategory == category))
    if brand: q = q.where(or_(Product.brand == brand, func.lower(Product.brand) == brand.lower()))
    if is_featured is not None: q = q.where(Product.is_featured == is_featured)
    order = ordering or sort
    if order in ("-price", "price_desc"): q = q.order_by(Product.price.desc())
    elif order in ("price", "price_asc"): q = q.order_by(Product.price.asc())
    elif order == "name": q = q.order_by(Product.name.asc())
    else: q = q.order_by(Product.created_at.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return {"count": total, "next": None if page * page_size >= total else f"/api/v1/catalog/products?page={page + 1}",
            "previous": None if page <= 1 else f"/api/v1/catalog/products?page={page - 1}", "results": [_product_out(row) for row in rows]}


@router.get("/products/{slug}")
async def get_product(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    product = (await db.execute(select(Product).where(Product.slug == slug))).scalar_one_or_none()
    if not product or ((not product.active or product.status != "published") and not _can_read_catalog(user)):
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    return _product_out(product)


@router.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(data: ProductIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = _product_values(data); product_slug = slugify(values.pop("slug", None) or values["name"])
    await _ensure_product_uniques(db, product_slug, values.get("sku")); await _validate_taxonomy(db, values.get("category"), values.get("subcategory"), values.get("brand"))
    product = Product(slug=product_slug, **values); db.add(product); await audit(db, user, "product.create", product_slug)
    await db.commit(); await db.refresh(product); return _product_out(product)


@router.patch("/products/{slug}")
async def update_product(slug: str, data: ProductPatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    product = (await db.execute(select(Product).where(Product.slug == slug))).scalar_one_or_none()
    if not product: raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    values = _product_values(data, True); new_slug = slugify(values.pop("slug", None) or product.slug)
    await _ensure_product_uniques(db, new_slug, values.get("sku", product.sku), product.id)
    await _validate_taxonomy(db, values.get("category", product.category), values.get("subcategory", product.subcategory), values.get("brand", product.brand))
    product.slug = new_slug
    if "stock" in values and values["stock"] != product.stock:
        if not has_perm(user, "stock:manage"):
            raise HTTPException(status.HTTP_403_FORBIDDEN, "Sem permissão para alterar stock.")
        db.add(InventoryMovement(product_slug=new_slug, quantity=values["stock"] - product.stock,
                                 stock_before=product.stock, stock_after=values["stock"],
                                 note="Atualização no formulário do produto", actor=user.email))
    for key, value in values.items(): setattr(product, key, value)
    await audit(db, user, "product.update", product.slug, {"fields": sorted(values)})
    await db.commit(); await db.refresh(product); return _product_out(product)


@router.delete("/products/{slug}")
async def archive_product(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    product = (await db.execute(select(Product).where(Product.slug == slug))).scalar_one_or_none()
    if not product: raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    product.active = False; product.status = "archived"; await audit(db, user, "product.archive", slug); await db.commit()
    return {"detail": "Produto arquivado."}


@router.post("/products/{slug}/adjust_stock")
async def adjust_stock(slug: str, data: dict, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "stock:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    quantity = int(data.get("quantity") or 0); note = str(data.get("note") or "").strip()
    if quantity == 0: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "A quantidade não pode ser zero.")
    if not note: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Informe o motivo do ajuste.")
    product = (await db.execute(select(Product).where(Product.slug == slug).with_for_update())).scalar_one_or_none()
    if not product: raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    before = product.stock; after = before + quantity
    if after < 0: raise HTTPException(status.HTTP_409_CONFLICT, "O ajuste resultaria em stock negativo.")
    product.stock = after
    db.add(InventoryMovement(product_slug=product.slug, quantity=quantity, stock_before=before, stock_after=after, note=note[:500], actor=user.email))
    await audit(db, user, "stock.adjust", slug, {"quantity": quantity, "before": before, "after": after})
    await db.commit(); return {"stock": after}


@router.get("/products/{slug}/movements")
async def stock_movements(slug: str, page_size: int = Query(50, ge=1, le=200), db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "stock:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    product = (await db.execute(select(Product).where(Product.slug == slug))).scalar_one_or_none()
    if not product: raise HTTPException(status.HTTP_404_NOT_FOUND, "Produto não encontrado.")
    rows = (await db.execute(select(InventoryMovement).where(InventoryMovement.product_slug == slug).order_by(InventoryMovement.created_at.desc()).limit(page_size))).scalars().all()
    return {"stock": product.stock, "history": [{"id": row.id, "quantity": row.quantity, "stock_before": row.stock_before, "stock_after": row.stock_after, "note": row.note, "actor": row.actor, "created_at": row.created_at.isoformat() if row.created_at else None} for row in rows]}


@router.get("/categories")
async def list_categories(type: str | None = None, include_inactive: bool = False, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    q = select(Category)
    if not (_can_read_catalog(user) and include_inactive): q = q.where(Category.active.is_(True))
    if type: q = q.where(Category.type == type)
    rows = (await db.execute(q.order_by(Category.name))).scalars().all()
    return [_category_out(row) for row in rows]


async def _validate_parent(db: AsyncSession, parent_slug: str | None, category_type: str, current_slug: str | None = None) -> None:
    if not parent_slug: return
    if parent_slug == current_slug: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Uma categoria não pode ser filha de si própria.")
    parent = (await db.execute(select(Category).where(Category.slug == parent_slug, Category.type == category_type, Category.active.is_(True)))).scalar_one_or_none()
    if not parent: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Categoria principal inválida.")
    cursor = parent
    visited = {current_slug} if current_slug else set()
    while cursor and cursor.parent_slug:
        if cursor.parent_slug in visited: raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "A hierarquia criaria um ciclo.")
        visited.add(cursor.slug); cursor = (await db.execute(select(Category).where(Category.slug == cursor.parent_slug))).scalar_one_or_none()


@router.post("/categories", status_code=status.HTTP_201_CREATED)
async def create_category(data: CategoryIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = data.model_dump(); category_slug = slugify(values.pop("slug", None) or values["name"])
    if (await db.execute(select(Category.id).where(Category.slug == category_slug))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    await _validate_parent(db, values.get("parent_slug"), values["type"])
    category = Category(slug=category_slug, **values); db.add(category); await audit(db, user, "category.create", category_slug)
    await db.commit(); await db.refresh(category); return _category_out(category)


@router.patch("/categories/{slug}")
async def update_category(slug: str, data: CategoryPatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    category = (await db.execute(select(Category).where(Category.slug == slug))).scalar_one_or_none()
    if not category: raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada.")
    values = data.model_dump(exclude_unset=True); new_slug = slugify(values.pop("slug", None) or category.slug)
    if (await db.execute(select(Category.id).where(Category.slug == new_slug, Category.id != category.id))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    await _validate_parent(db, values.get("parent_slug", category.parent_slug), values.get("type", category.type), slug)
    old_slug = category.slug; category.slug = new_slug
    for key, value in values.items(): setattr(category, key, value)
    if new_slug != old_slug:
        children = (await db.execute(select(Category).where(Category.parent_slug == old_slug))).scalars().all()
        for child in children: child.parent_slug = new_slug
    await audit(db, user, "category.update", new_slug, {"fields": sorted(values)}); await db.commit(); await db.refresh(category)
    return _category_out(category)


@router.delete("/categories/{slug}")
async def archive_category(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    category = (await db.execute(select(Category).where(Category.slug == slug))).scalar_one_or_none()
    if not category: raise HTTPException(status.HTTP_404_NOT_FOUND, "Categoria não encontrada.")
    used = (await db.execute(select(Product.id).where(or_(Product.category == slug, Product.subcategory == slug), Product.active.is_(True)).limit(1))).scalar_one_or_none()
    if used: raise HTTPException(status.HTTP_409_CONFLICT, "A categoria está ligada a produtos ativos.")
    category.active = False; await audit(db, user, "category.archive", slug); await db.commit(); return {"detail": "Categoria arquivada."}


@router.get("/brands")
async def list_brands(page_size: int = Query(100, ge=1, le=200), include_inactive: bool = False, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    q = select(Brand)
    if not (_can_read_catalog(user) and include_inactive): q = q.where(Brand.active.is_(True))
    rows = (await db.execute(q.order_by(Brand.name).limit(page_size))).scalars().all()
    return {"count": len(rows), "next": None, "previous": None, "results": [_brand_out(row) for row in rows]}


@router.post("/brands", status_code=status.HTTP_201_CREATED)
async def create_brand(data: BrandIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = data.model_dump(); brand_slug = slugify(values.pop("slug", None) or values["name"])
    if (await db.execute(select(Brand.id).where(Brand.slug == brand_slug))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    brand = Brand(slug=brand_slug, **values); db.add(brand); await audit(db, user, "brand.create", brand_slug); await db.commit(); await db.refresh(brand)
    return _brand_out(brand)


@router.patch("/brands/{slug}")
async def update_brand(slug: str, data: BrandPatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    brand = (await db.execute(select(Brand).where(Brand.slug == slug))).scalar_one_or_none()
    if not brand: raise HTTPException(status.HTTP_404_NOT_FOUND, "Marca não encontrada.")
    values = data.model_dump(exclude_unset=True); new_slug = slugify(values.pop("slug", None) or brand.slug)
    if (await db.execute(select(Brand.id).where(Brand.slug == new_slug, Brand.id != brand.id))).scalar_one_or_none(): raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    brand.slug = new_slug
    for key, value in values.items(): setattr(brand, key, value)
    await audit(db, user, "brand.update", new_slug, {"fields": sorted(values)}); await db.commit(); await db.refresh(brand); return _brand_out(brand)


@router.delete("/brands/{slug}")
async def archive_brand(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "catalog:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    brand = (await db.execute(select(Brand).where(Brand.slug == slug))).scalar_one_or_none()
    if not brand: raise HTTPException(status.HTTP_404_NOT_FOUND, "Marca não encontrada.")
    used = (await db.execute(select(Product.id).where(or_(Product.brand == slug, Product.brand == brand.name), Product.active.is_(True)).limit(1))).scalar_one_or_none()
    if used: raise HTTPException(status.HTTP_409_CONFLICT, "A marca está ligada a produtos ativos.")
    brand.active = False; await audit(db, user, "brand.archive", slug); await db.commit(); return {"detail": "Marca arquivada."}
