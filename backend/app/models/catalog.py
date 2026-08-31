from sqlalchemy import Boolean, DateTime, Index, Integer, String, Text, UniqueConstraint, func
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    first_name: Mapped[str] = mapped_column(String(120), default="")
    last_name: Mapped[str] = mapped_column(String(120), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[str] = mapped_column(String(30), default="client")
    permissions: Mapped[str] = mapped_column(Text, default="")  # JSON list
    is_staff: Mapped[bool] = mapped_column(Boolean, default=False)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    token_version: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    type: Mapped[str] = mapped_column(String(20), default="store")
    parent_slug: Mapped[str | None] = mapped_column(String(140), nullable=True)
    description: Mapped[str] = mapped_column(Text, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Brand(Base):
    __tablename__ = "brands"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    slug: Mapped[str] = mapped_column(String(140), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200), index=True)
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    sku: Mapped[str] = mapped_column(String(80), default="")
    description: Mapped[str] = mapped_column(Text, default="")
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    gallery: Mapped[str] = mapped_column(Text, default="[]")
    specifications: Mapped[str] = mapped_column(Text, default="{}")
    price: Mapped[int] = mapped_column(Integer, default=0)  # Kwanza
    old_price: Mapped[int | None] = mapped_column(Integer, nullable=True)
    brand: Mapped[str | None] = mapped_column(String(120), nullable=True)
    category: Mapped[str | None] = mapped_column(String(140), nullable=True)
    subcategory: Mapped[str | None] = mapped_column(String(140), nullable=True)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    is_new: Mapped[bool] = mapped_column(Boolean, default=False)
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    status: Mapped[str] = mapped_column(String(20), default="published", index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class SiteSetting(Base):
    __tablename__ = "site_settings"

    id: Mapped[int] = mapped_column(primary_key=True)
    key: Mapped[str] = mapped_column(String(120), unique=True, index=True)
    value: Mapped[str] = mapped_column(Text, default="{}")
    updated_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    excerpt: Mapped[str] = mapped_column(Text, default="")
    content: Mapped[str] = mapped_column(Text, default="")
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="published")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    read_time: Mapped[str | None] = mapped_column(String(20), nullable=True)
    author: Mapped[str] = mapped_column(String(160), default="Equipa Vitaleevo")
    author_role: Mapped[str] = mapped_column(String(160), default="Especialista")
    author_image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    published_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(500))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text, default="")
    full_description: Mapped[str] = mapped_column(Text, default="")
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    images: Mapped[str] = mapped_column(Text, default="[]")
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    client: Mapped[str | None] = mapped_column(String(200), nullable=True)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    challenge: Mapped[str] = mapped_column(Text, default="")
    solution: Mapped[str] = mapped_column(Text, default="")
    results: Mapped[str] = mapped_column(Text, default="[]")
    tags: Mapped[str] = mapped_column(Text, default="[]")
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="published")
    is_featured: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class Service(Base):
    __tablename__ = "services"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(220))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    subtitle: Mapped[str] = mapped_column(Text, default="")
    description: Mapped[str] = mapped_column(Text, default="")
    icon: Mapped[str] = mapped_column(String(80), default="globe")
    image: Mapped[str | None] = mapped_column(String(500), nullable=True)
    features: Mapped[str] = mapped_column(Text, default="[]")
    benefits: Mapped[str] = mapped_column(Text, default="[]")
    process: Mapped[str] = mapped_column(Text, default="[]")
    cta_text: Mapped[str] = mapped_column(String(160), default="Solicitar proposta")
    display_order: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(20), default="published", index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class LegalDocument(Base):
    __tablename__ = "legal_documents"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class SitePage(Base):
    __tablename__ = "site_pages"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    slug: Mapped[str] = mapped_column(String(220), unique=True, index=True)
    content: Mapped[str] = mapped_column(Text, default="")
    hero_title: Mapped[str] = mapped_column(String(500), default="")
    hero_subtitle: Mapped[str] = mapped_column(Text, default="")
    seo_title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    seo_description: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[str] = mapped_column(String(20), default="draft", index=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class ContactMessage(Base):
    __tablename__ = "contact_messages"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str] = mapped_column(String(255))
    phone: Mapped[str] = mapped_column(String(40), default="")
    subject: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text)
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    access_token_hash: Mapped[str] = mapped_column(String(120))
    customer_name: Mapped[str] = mapped_column(String(200), default="")
    customer_email: Mapped[str] = mapped_column(String(255), default="")
    customer_phone: Mapped[str] = mapped_column(String(40), default="")
    user_email: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    company: Mapped[str] = mapped_column(String(200), default="")
    message: Mapped[str] = mapped_column(Text, default="")
    items: Mapped[str] = mapped_column(Text, default="[]")  # JSON list
    status: Mapped[str] = mapped_column(String(30), default="new", index=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    assigned_to: Mapped[str | None] = mapped_column(String(255), nullable=True)
    next_follow_up_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    proposal: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True)
    order_number: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    access_token_hash: Mapped[str] = mapped_column(String(120), default="")
    user_email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    customer_name: Mapped[str] = mapped_column(String(255))
    customer_email: Mapped[str] = mapped_column(String(255))
    customer_phone: Mapped[str] = mapped_column(String(40), default="")
    items: Mapped[str] = mapped_column(Text, default="[]")
    subtotal: Mapped[int] = mapped_column(Integer, default=0)
    shipping: Mapped[int] = mapped_column(Integer, default=0)
    total: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[str] = mapped_column(String(30), default="pendente")
    payment_method: Mapped[str] = mapped_column(String(30), default="no_pagamento")
    shipping_address: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


class WishlistItem(Base):
    __tablename__ = "wishlist_items"
    __table_args__ = (UniqueConstraint("user_email", "product_slug", name="uq_wishlist_user_product"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    product_slug: Mapped[str] = mapped_column(String(220))


class CartItem(Base):
    __tablename__ = "cart_items"
    __table_args__ = (UniqueConstraint("user_email", "product_slug", name="uq_cart_user_product"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    product_slug: Mapped[str] = mapped_column(String(220))
    quantity: Mapped[int] = mapped_column(Integer, default=1)


class Address(Base):
    __tablename__ = "addresses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    label: Mapped[str] = mapped_column(String(120), default="Morada")
    name: Mapped[str] = mapped_column(String(200), default="")
    phone: Mapped[str] = mapped_column(String(40), default="")
    city: Mapped[str] = mapped_column(String(120), default="Luanda")
    full_address: Mapped[str] = mapped_column(Text, default="")
    reference: Mapped[str] = mapped_column(Text, default="")
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_email: Mapped[str] = mapped_column(String(255), index=True)
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text, default="")
    type: Mapped[str] = mapped_column(String(40), default="system")
    metadata_json: Mapped[str] = mapped_column(Text, default="{}")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AnalyticsEvent(Base):
    __tablename__ = "analytics_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[str] = mapped_column(String(40))
    path: Mapped[str] = mapped_column(String(300), default="")
    session_id: Mapped[str] = mapped_column(String(120), default="")
    data: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    actor: Mapped[str] = mapped_column(String(255), default="")
    action: Mapped[str] = mapped_column(String(120))
    resource: Mapped[str] = mapped_column(String(200), default="")
    details: Mapped[str] = mapped_column(Text, default="{}")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class InventoryMovement(Base):
    __tablename__ = "inventory_movements"

    id: Mapped[int] = mapped_column(primary_key=True)
    product_slug: Mapped[str] = mapped_column(String(220), index=True)
    quantity: Mapped[int] = mapped_column(Integer)
    stock_before: Mapped[int] = mapped_column(Integer)
    stock_after: Mapped[int] = mapped_column(Integer)
    note: Mapped[str] = mapped_column(String(500), default="")
    actor: Mapped[str] = mapped_column(String(255), default="")
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SlugRedirect(Base):
    __tablename__ = "slug_redirects"
    __table_args__ = (
        UniqueConstraint("old_slug", "resource_type", name="uq_slug_redirect_old_type"),
        Index("ix_slug_redirect_old_type", "old_slug", "resource_type"),
        Index("ix_slug_redirect_new", "new_slug"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    old_slug: Mapped[str] = mapped_column(String(220), index=True)
    new_slug: Mapped[str] = mapped_column(String(220), index=True)
    resource_type: Mapped[str] = mapped_column(String(20), index=True)  # 'article' | 'project'
    created_at: Mapped[DateTime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[DateTime | None] = mapped_column(DateTime(timezone=True), nullable=True, onupdate=func.now())


Index("ix_articles_status_published_at", Article.status, Article.published_at)
Index("ix_projects_status_order", Project.status, Project.display_order)
Index("ix_products_status_created_at", Product.status, Product.created_at)
