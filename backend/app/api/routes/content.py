from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, has_perm, require_staff
from app.core.domain import CONTENT_STATUSES, audit, dump_json, json_list, load_json, require_choice, sanitize_html, slugify
from app.models.catalog import Article, Project, SlugRedirect, User

router = APIRouter(tags=["content"])


class ArticleIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=2, max_length=500)
    slug: str | None = Field(None, max_length=220)
    excerpt: str = Field("", max_length=2000)
    content: str = Field("", max_length=200_000)
    image: str | None = Field(None, max_length=500)
    category: str | None = Field(None, max_length=120)
    status: str = "draft"
    is_featured: bool = False
    read_time: str | None = Field(None, max_length=20)
    author: str = Field("Equipa Vitaleevo", max_length=160)
    author_role: str = Field("Especialista", max_length=160)
    author_image: str | None = Field(None, max_length=500)
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)


class ArticlePatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(None, min_length=2, max_length=500)
    slug: str | None = Field(None, max_length=220)
    excerpt: str | None = Field(None, max_length=2000)
    content: str | None = Field(None, max_length=200_000)
    image: str | None = Field(None, max_length=500)
    category: str | None = Field(None, max_length=120)
    status: str | None = None
    is_featured: bool | None = None
    read_time: str | None = Field(None, max_length=20)
    author: str | None = Field(None, max_length=160)
    author_role: str | None = Field(None, max_length=160)
    author_image: str | None = Field(None, max_length=500)
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)


class ProjectIn(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str = Field(min_length=2, max_length=500)
    slug: str | None = Field(None, max_length=220)
    description: str = Field("", max_length=3000)
    full_description: str = Field("", max_length=200_000)
    content: str | None = Field(None, max_length=200_000)
    image: str | None = Field(None, max_length=500)
    images: list[str] | str = Field(default_factory=list)
    category: str | None = Field(None, max_length=120)
    client: str | None = Field(None, max_length=200)
    year: int | None = Field(None, ge=1900, le=2200)
    order: int = Field(0, ge=-10_000, le=10_000)
    challenge: str = Field("", max_length=10_000)
    solution: str = Field("", max_length=10_000)
    results: list[str] | str = Field(default_factory=list)
    tags: list[str] | str = Field(default_factory=list)
    status: str = "draft"
    is_featured: bool = False
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)


class ProjectPatch(BaseModel):
    model_config = ConfigDict(extra="forbid")
    title: str | None = Field(None, min_length=2, max_length=500)
    slug: str | None = Field(None, max_length=220)
    description: str | None = Field(None, max_length=3000)
    full_description: str | None = Field(None, max_length=200_000)
    content: str | None = Field(None, max_length=200_000)
    image: str | None = Field(None, max_length=500)
    images: list[str] | str | None = None
    category: str | None = Field(None, max_length=120)
    client: str | None = Field(None, max_length=200)
    year: int | None = Field(None, ge=1900, le=2200)
    order: int | None = Field(None, ge=-10_000, le=10_000)
    challenge: str | None = Field(None, max_length=10_000)
    solution: str | None = Field(None, max_length=10_000)
    results: list[str] | str | None = None
    tags: list[str] | str | None = None
    status: str | None = None
    is_featured: bool | None = None
    seo_title: str | None = Field(None, max_length=255)
    seo_description: str | None = Field(None, max_length=500)


def _article_out(article: Article) -> dict:
    return {
        "id": article.id, "title": article.title, "slug": article.slug,
        "excerpt": sanitize_html(article.excerpt), "content": sanitize_html(article.content), "image": article.image,
        "category": article.category, "category_name": article.category, "status": article.status,
        "is_featured": bool(article.is_featured), "read_time": article.read_time,
        "author": article.author or "Equipa Vitaleevo", "author_role": article.author_role or "Especialista",
        "author_image": article.author_image, "seo_title": article.seo_title,
        "seo_description": article.seo_description,
        "published_at": article.published_at.isoformat() if article.published_at else None,
        "updated_at": article.updated_at.isoformat() if article.updated_at else None,
    }


def _project_out(project: Project) -> dict:
    return {
        "id": project.id, "title": project.title, "slug": project.slug,
        "description": sanitize_html(project.description), "full_description": sanitize_html(project.full_description or ""),
        "image": project.image, "images": load_json(project.images, []), "category": project.category,
        "category_name": project.category, "client": project.client, "year": project.year,
        "order": project.display_order or 0, "challenge": sanitize_html(project.challenge or ""),
        "solution": sanitize_html(project.solution or ""), "results": load_json(project.results, []),
        "tags": load_json(project.tags, []), "status": project.status,
        "is_featured": bool(project.is_featured), "seo_title": project.seo_title,
        "seo_description": project.seo_description,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
    }


def _paginate(rows: list, total: int, page: int, page_size: int, path: str) -> dict:
    return {"count": total, "next": f"{path}?page={page + 1}&page_size={page_size}" if page * page_size < total else None,
            "previous": f"{path}?page={page - 1}&page_size={page_size}" if page > 1 else None, "results": rows}


def _can_manage(user: User | None) -> bool:
    return bool(user and has_perm(user, "content:manage"))


async def _resolve_redirect(db: AsyncSession, old_slug: str, resource_type: str) -> str | None:
    """Resolve redirect chain for old_slug, following up to 5 hops."""
    visited: set[str] = set()
    current = old_slug
    final: str | None = None
    for _ in range(5):
        r = (await db.execute(select(SlugRedirect).where(SlugRedirect.old_slug == current, SlugRedirect.resource_type == resource_type))).scalar_one_or_none()
        if not r:
            break
        if r.new_slug in visited:
            break
        visited.add(r.new_slug)
        final = r.new_slug
        current = r.new_slug
    return final


async def _upsert_slug_redirect(db: AsyncSession, old_slug: str, new_slug: str, resource_type: str) -> None:
    if not old_slug or not new_slug or old_slug == new_slug:
        return
    # If there's already a redirect for old_slug, update it
    existing = (await db.execute(select(SlugRedirect).where(SlugRedirect.old_slug == old_slug, SlugRedirect.resource_type == resource_type))).scalar_one_or_none()
    if existing:
        existing.new_slug = new_slug
    else:
        db.add(SlugRedirect(old_slug=old_slug, new_slug=new_slug, resource_type=resource_type))
    # Update chain: any redirects pointing to old_slug should now point to new_slug (short-circuit)
    chain = (await db.execute(select(SlugRedirect).where(SlugRedirect.new_slug == old_slug, SlugRedirect.resource_type == resource_type))).scalars().all()
    for r in chain:
        # avoid self-loop
        if r.old_slug != new_slug:
            r.new_slug = new_slug
    # Cleanup: if new_slug was previously an old_slug (stale redirect), remove it because slug is now live
    await db.execute(delete(SlugRedirect).where(SlugRedirect.old_slug == new_slug, SlugRedirect.resource_type == resource_type))
    # Note: the delete above will not affect the newly created/updated row because its old_slug is old_slug != new_slug
    # Flush to ensure constraints are checked within transaction
    await db.flush()


@router.get("/blog/articles")
async def list_articles(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
                        category: str | None = None, status_filter: str | None = Query(None, alias="status"),
                        is_featured: bool | None = None, search: str | None = None,
                        db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    q = select(Article)
    if _can_manage(user):
        if status_filter:
            q = q.where(Article.status == require_choice(status_filter, CONTENT_STATUSES))
    else:
        q = q.where(Article.status == "published")
    if category: q = q.where(Article.category == category)
    if is_featured is not None: q = q.where(Article.is_featured == is_featured)
    if search: q = q.where(or_(Article.title.ilike(f"%{search}%"), Article.excerpt.ilike(f"%{search}%")))
    q = q.order_by(Article.published_at.desc(), Article.id.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return _paginate([_article_out(row) for row in rows], total, page, page_size, "/api/v1/blog/articles")


@router.get("/blog/articles/{slug}")
async def get_article(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    article = (await db.execute(select(Article).where(Article.slug == slug))).scalar_one_or_none()
    if article:
        if article.status == "published" or _can_manage(user):
            return _article_out(article)
        # Found but not visible to current user -> treat as not found for redirect fallback (only if not manager)
        # For managers, we already returned; for public, fall through to redirect check then 404
        # If status != published and not manager, we should not redirect, just 404
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artigo não encontrado.")
    # Not found -> check slug redirect
    target = await _resolve_redirect(db, slug, "article")
    if target:
        return RedirectResponse(url=f"/api/v1/blog/articles/{target}", status_code=308)
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Artigo não encontrado.")


@router.post("/blog/articles", status_code=status.HTTP_201_CREATED)
async def create_article(data: ArticleIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    article_status = require_choice(data.status, CONTENT_STATUSES)
    article_slug = slugify(data.slug or data.title, "artigo")[:220]
    if (await db.execute(select(Article.id).where(Article.slug == article_slug))).scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    raw = data.model_dump(exclude={"slug", "status"})
    # defense-in-depth: sanitize HTML fields before persist
    raw["content"] = sanitize_html(raw.get("content") or "")
    raw["excerpt"] = sanitize_html(raw.get("excerpt") or "")
    article = Article(**raw, slug=article_slug, status=article_status,
                      published_at=datetime.now(timezone.utc) if article_status == "published" else None)
    db.add(article); await audit(db, user, "article.create", article_slug, {"status": article_status})
    await db.commit(); await db.refresh(article)
    return _article_out(article)


@router.patch("/blog/articles/{slug}")
async def update_article(slug: str, data: ArticlePatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    article = (await db.execute(select(Article).where(Article.slug == slug))).scalar_one_or_none()
    if not article: raise HTTPException(status.HTTP_404_NOT_FOUND, "Artigo não encontrado.")
    payload = data.model_dump(exclude_unset=True)
    if payload.get("status"):
        payload["status"] = require_choice(payload["status"], CONTENT_STATUSES)
        if payload["status"] == "published" and not article.published_at: article.published_at = datetime.now(timezone.utc)
    old_slug = article.slug
    new_slug: str | None = None
    if payload.get("slug"):
        new_slug = slugify(payload.pop("slug"), "artigo")[:220]
        if new_slug != old_slug and (await db.execute(select(Article.id).where(Article.slug == new_slug, Article.id != article.id))).scalar_one_or_none():
            raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    else:
        payload.pop("slug", None)
    # sanitize HTML fields
    if "content" in payload and payload["content"] is not None:
        payload["content"] = sanitize_html(payload["content"])
    if "excerpt" in payload and payload["excerpt"] is not None:
        payload["excerpt"] = sanitize_html(payload["excerpt"])
    for key, value in payload.items(): setattr(article, key, value)
    if new_slug and new_slug != old_slug:
        article.slug = new_slug
        await _upsert_slug_redirect(db, old_slug, new_slug, "article")
    await audit(db, user, "article.update", article.slug, {"fields": sorted(payload)})
    await db.commit(); await db.refresh(article)
    return _article_out(article)


@router.delete("/blog/articles/{slug}")
async def archive_article(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    article = (await db.execute(select(Article).where(Article.slug == slug))).scalar_one_or_none()
    if not article: raise HTTPException(status.HTTP_404_NOT_FOUND, "Artigo não encontrado.")
    article.status = "archived"; await audit(db, user, "article.archive", slug); await db.commit()
    return {"detail": "Artigo arquivado."}


@router.get("/portfolio/projects")
async def list_projects(page: int = Query(1, ge=1), page_size: int = Query(10, ge=1, le=100),
                        category: str | None = None, status_filter: str | None = Query(None, alias="status"),
                        is_featured: bool | None = None, search: str | None = None,
                        db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    q = select(Project)
    if _can_manage(user):
        if status_filter: q = q.where(Project.status == require_choice(status_filter, CONTENT_STATUSES))
    else: q = q.where(Project.status == "published")
    if category: q = q.where(Project.category == category)
    if is_featured is not None: q = q.where(Project.is_featured == is_featured)
    if search: q = q.where(or_(Project.title.ilike(f"%{search}%"), Project.description.ilike(f"%{search}%")))
    q = q.order_by(Project.display_order.asc(), Project.created_at.desc(), Project.id.desc())
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return _paginate([_project_out(row) for row in rows], total, page, page_size, "/api/v1/portfolio/projects")


@router.get("/portfolio/projects/{slug}")
async def get_project(slug: str, db: AsyncSession = Depends(get_db), user: User | None = Depends(get_current_user)):
    project = (await db.execute(select(Project).where(Project.slug == slug))).scalar_one_or_none()
    if project:
        if project.status == "published" or _can_manage(user):
            return _project_out(project)
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Projeto não encontrado.")
    target = await _resolve_redirect(db, slug, "project")
    if target:
        return RedirectResponse(url=f"/api/v1/portfolio/projects/{target}", status_code=308)
    raise HTTPException(status.HTTP_404_NOT_FOUND, "Projeto não encontrado.")


def _project_values(data: ProjectIn | ProjectPatch, patch: bool = False) -> dict:
    values = data.model_dump(exclude_unset=patch)
    if values.get("content") and not values.get("full_description"): values["full_description"] = values["content"]
    values.pop("content", None)
    if "order" in values: values["display_order"] = values.pop("order")
    for key in ("images", "results", "tags"):
        if key in values and values[key] is not None: values[key] = dump_json(json_list(values[key]))
    if values.get("status"): values["status"] = require_choice(values["status"], CONTENT_STATUSES)
    # defense-in-depth: sanitize HTML fields
    for key in ("description", "full_description", "challenge", "solution"):
        if key in values and values[key] is not None:
            values[key] = sanitize_html(values[key])
    return values


@router.post("/portfolio/projects", status_code=status.HTTP_201_CREATED)
async def create_project(data: ProjectIn, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    values = _project_values(data); project_slug = slugify(values.pop("slug", None) or values["title"], "projeto")[:220]
    if (await db.execute(select(Project.id).where(Project.slug == project_slug))).scalar_one_or_none():
        raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    project = Project(slug=project_slug, **values); db.add(project)
    await audit(db, user, "project.create", project_slug, {"status": project.status})
    await db.commit(); await db.refresh(project)
    return _project_out(project)


@router.patch("/portfolio/projects/{slug}")
async def update_project(slug: str, data: ProjectPatch, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    project = (await db.execute(select(Project).where(Project.slug == slug))).scalar_one_or_none()
    if not project: raise HTTPException(status.HTTP_404_NOT_FOUND, "Projeto não encontrado.")
    values = _project_values(data, True)
    old_slug = project.slug
    new_slug: str | None = None
    if values.get("slug"):
        new_slug = slugify(values.pop("slug"), "projeto")[:220]
        if new_slug != old_slug and (await db.execute(select(Project.id).where(Project.slug == new_slug, Project.id != project.id))).scalar_one_or_none():
            raise HTTPException(status.HTTP_409_CONFLICT, "Slug já existe.")
    else: values.pop("slug", None)
    for key, value in values.items(): setattr(project, key, value)
    if new_slug and new_slug != old_slug:
        project.slug = new_slug
        await _upsert_slug_redirect(db, old_slug, new_slug, "project")
    await audit(db, user, "project.update", project.slug, {"fields": sorted(values)})
    await db.commit(); await db.refresh(project)
    return _project_out(project)


@router.delete("/portfolio/projects/{slug}")
async def archive_project(slug: str, db: AsyncSession = Depends(get_db), user: User = Depends(require_staff)):
    if not has_perm(user, "content:manage"): raise HTTPException(status.HTTP_403_FORBIDDEN, "Acesso restrito.")
    project = (await db.execute(select(Project).where(Project.slug == slug))).scalar_one_or_none()
    if not project: raise HTTPException(status.HTTP_404_NOT_FOUND, "Projeto não encontrado.")
    project.status = "archived"; await audit(db, user, "project.archive", slug); await db.commit()
    return {"detail": "Projeto arquivado."}
