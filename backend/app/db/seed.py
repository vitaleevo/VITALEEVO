import json
import re
import unicodedata

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import hash_password
from app.db.session import get_sessionmaker
from app.models.catalog import (Article, Brand, Category, Product, SiteSetting, User)


def _slugify(value: str) -> str:
    value = unicodedata.normalize("NFKD", value.lower()).encode("ascii", "ignore").decode()
    value = re.sub(r"[^\w\s-]", "", value).strip()
    return re.sub(r"[-\s]+", "-", value) or "produto"


CATEGORIES: list[dict] = [
    {"name": "Computadores", "slug": "computadores", "description": "Portáteis e desktops."},
    {"name": "Impressão", "slug": "impressao", "description": "Impressoras, tinteiros e toners."},
    {"name": "Redes", "slug": "redes", "description": "Routers, switches e acessórios."},
    {"name": "UPS & Energia", "slug": "ups-energia", "description": "UPS, estabilizadores e fontes."},
    {"name": "Escritório", "slug": "escritorio", "description": "Material de escritório."},
    {"name": "Acessórios", "slug": "acessorios", "description": "Periféricos e acessórios."},
]

PRODUCTS: list[dict] = [
    {"name": "Portátil HP 250 G8", "category": "computadores", "brand": "HP", "price": 750000, "stock": 10, "featured": True, "description": "Core i5, 8GB, 512GB SSD, 15.6\"."},
    {"name": "Portátil Lenovo ThinkPad E15", "category": "computadores", "brand": "Lenovo", "price": 890000, "stock": 8, "description": "Ryzen 5, 16GB, 512GB SSD, 15.6\"."},
    {"name": "Impressora HP Laserjet M111", "category": "impressao", "brand": "HP", "price": 145000, "stock": 15, "featured": True, "description": "Mono, laser, USB."},
    {"name": "Impressora Multifunções Epson L3250", "category": "impressao", "brand": "Epson", "price": 245000, "stock": 12, "description": "A4, wifi, tanque de tinta."},
    {"name": "Toner HP 85A (CF285A)", "category": "impressao", "brand": "HP", "price": 95000, "stock": 20, "description": "Toner preto ~1600 páginas."},
    {"name": "Tinteiro Epson 664 (preto)", "category": "impressao", "brand": "Epson", "price": 8500, "stock": 40, "description": "Tinta preta 70ml."},
    {"name": "Router Wi-Fi 6 TP-Link", "category": "redes", "brand": "TP-Link", "price": 120000, "stock": 18, "featured": True, "description": "AX1500, dupla banda."},
    {"name": "Switch 8 Portas TP-Link", "category": "redes", "brand": "TP-Link", "price": 45000, "stock": 25, "description": "Gigabit, desktop."},
    {"name": "UPS 1500VA", "category": "ups-energia", "brand": "APC", "price": 285000, "stock": 6, "featured": True, "description": "Back-UPS com regulação."},
    {"name": "Estabilizador 8 Tomadas", "category": "ups-energia", "brand": "APC", "price": 55000, "stock": 12, "description": "Estabilizador automático."},
    {"name": "Cadeira de Escritório Ergonómica", "category": "escritorio", "brand": "Kayan", "price": 145000, "stock": 6, "description": "Com apoio lombar regulável."},
    {"name": "Mesa de Escritório 140 cm", "category": "escritorio", "brand": "Kayan", "price": 385000, "stock": 4, "description": "Em madeira e metal."},
    {"name": "Resma de Papel A4 80g", "category": "escritorio", "brand": "Navigator", "price": 9500, "stock": 100, "description": "500 folhas."},
    {"name": "Teclado + Rato sem fios", "category": "acessorios", "brand": "Logitech", "price": 32000, "stock": 30, "featured": True, "description": "Combo MK295."},
    {"name": "Monitor 24\" Full HD", "category": "acessorios", "brand": "Samsung", "price": 185000, "stock": 9, "description": "IPS, HDMI/VGA."},
    {"name": "SSD 1TB NVMe", "category": "acessorios", "brand": "Kingston", "price": 145000, "stock": 10, "description": "NVMe M.2 2280."},
]

BRANDS: list[str] = ["HP", "Lenovo", "Epson", "TP-Link", "APC", "Kayan", "Navigator", "Logitech", "Samsung", "Kingston"]


async def ensure_admin_user() -> None:
    settings = get_settings()
    if not settings.first_admin_password or settings.first_admin_password == "":
        return
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        result = await session.execute(
            select(User).where(User.email == settings.first_admin_email.lower())
        )
        user = result.scalar_one_or_none()
        if user is None:
            session.add(
                User(
                    email=settings.first_admin_email.lower(),
                    first_name="Admin",
                    hashed_password=hash_password(settings.first_admin_password),
                    role="admin",
                    permissions=json.dumps(["system:manage", "*"]),
                    is_staff=True,
                    is_admin=True,
                )
            )
            await session.commit()


async def seed_catalog() -> None:
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        count = (await session.execute(select(func.count(Product.id)))).scalar() or 0
        if count > 0:
            await _ensure_site_settings(session)
            return

        for cat in CATEGORIES:
            session.add(Category(name=cat["name"], slug=cat["slug"], description=cat.get("description", ""), type="store"))
        for brand in BRANDS:
            session.add(Brand(name=brand, slug=_slugify(brand)))
        for prod in PRODUCTS:
            session.add(
                Product(
                    name=prod["name"],
                    slug=_slugify(prod["name"]),
                    sku=_slugify(prod["name"]).replace("-", "").upper()[:12],
                    description=prod.get("description", ""),
                    price=prod["price"],
                    brand=prod.get("brand"),
                    category=prod["category"],
                    stock=prod.get("stock", 0),
                    is_featured=prod.get("featured", False),
                )
            )
        await _ensure_site_settings(session)
        await session.commit()


async def _ensure_site_settings(session: AsyncSession) -> None:
    result = await session.execute(
        select(SiteSetting).where(SiteSetting.key == "site_config")
    )
    if result.scalar_one_or_none() is None:
        session.add(
            SiteSetting(
                key="site_config",
                value=json.dumps(
                    {
                        "siteName": "Vitaleevo",
                        "currency": "AOA",
                        "contactEmail": "info@vitaleevo.ao",
                        "contactPhone": "+244 950 744 445",
                        "whatsapp": "+244 924 197 009",
                        "siteDescription": "Inovação tecnológica e design de alto impacto em Angola.",
                        "maintenance": False,
                    }
                ),
            )
        )
