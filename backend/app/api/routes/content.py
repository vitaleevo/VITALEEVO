import json

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_current_user, has_perm, require_staff
from app.models.catalog import Article, Project, User

router = APIRouter(tags=["content"])


def _article_out(a: Article) -> dict:
    return {
        "id": a.id,
        "title": a.title,
        "slug": a.slug,
        "excerpt": a.excerpt,
        "content": a.content,
        "image": a.image,
        "category": a.category,
        "category_name": a.category,
        "status": a.status,
        "published_at": a.published_at.isoformat() if a.published_at else None,
    }


def _project_out(p: Project) -> dict:
    return {
        "id": p.id,
        "title": p.title,
        "slug": p.slug,
        "description": p.description,
        "image": p.image,
        "category": p.category,
        "category_name": p.category,
        "status": p.status,
        "is_featured": p.is_featured,
    }


def _paginate(rows: list, total: int, page: int, page_size: int, path: str) -> dict:
    return {
        "count": total,
        "next": f"{path}?page={page + 1}&page_size={page_size}" if page * page_size < total else None,
        "previous": f"{path}?page={page - 1}&page_size={page_size}" if page > 1 else None,
        "results": rows,
    }


@router.get("/blog/articles")
async def list_articles(
    page: int = 1,
    page_size: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = select(Article).order_by(Article.published_at.desc())
    if not (user and has_perm(user, "content:manage")):
        q = q.where(Article.status == "published")
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return _paginate([_article_out(a) for a in rows], total, page, page_size, "/api/v1/blog/articles")


@router.get("/blog/articles/{slug}")
async def get_article(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    if not article or article.status != "published":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Artigo não encontrado.")
    return _article_out(article)


@router.get("/portfolio/projects")
async def list_projects(
    page: int = 1,
    page_size: int = Query(10, le=50),
    db: AsyncSession = Depends(get_db),
    user: User | None = Depends(get_current_user),
):
    q = select(Project).order_by(Project.id.desc())
    if not (user and has_perm(user, "content:manage")):
        q = q.where(Project.status == "published")
    total = (await db.execute(select(func.count()).select_from(q.subquery()))).scalar() or 0
    rows = (await db.execute(q.offset((page - 1) * page_size).limit(page_size))).scalars().all()
    return _paginate([_project_out(p) for p in rows], total, page, page_size, "/api/v1/portfolio/projects")


@router.get("/portfolio/projects/{slug}")
async def get_project(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Project).where(Project.slug == slug))
    project = result.scalar_one_or_none()
    if not project or project.status != "published":
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Projeto não encontrado.")
    return _project_out(project)
