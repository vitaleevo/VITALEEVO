import os
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, catalog, cms, commerce, content, misc, quotes
from app.core.config import get_settings
from app.db.seed import ensure_admin_user, seed_catalog
from app.db.migrations import run_additive_migrations
from app.db.session import check_db_ready, get_engine
from app.models.catalog import Base

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Cria tabelas e seed idempotente (padrão vitafarmacia)
    async with get_engine().begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await run_additive_migrations()

    await ensure_admin_user()
    await seed_catalog()
    yield


app = FastAPI(
    title=f"{settings.site_name} API",
    version="1.0.0",
    description="API da Vitaleevo — catálogo, CMS, cotações e comércio.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def trailing_slash_redirect(request: Request, call_next):
    """
    O frontend envia sempre paths com '/' final (ex.: /api/v1/auth/login/).
    Normaliza para o sem '/' antes do routing, evitando redirect 307 (que quebra preflight CORS).
    """
    path = request.url.path
    if path.startswith("/api/v1") and path != "/api/v1" and path.endswith("/"):
        request.scope["path"] = path.rstrip("/")
    response = await call_next(request)
    return response


@app.get("/api/v1/health", tags=["infra"])
async def health():
    return {"status": "ok"}


@app.get("/api/v1/health/live", tags=["infra"])
async def live():
    return {"status": "ok"}


@app.get("/api/v1/health/ready", tags=["infra"])
async def ready():
    db_ok = await check_db_ready()
    return {"status": "ok" if db_ok else "degraded", "dependencies": {"db": db_ok}}


@app.get("/api/v1/health/worker", tags=["infra"])
async def worker():
    # FastAPI é stateless sem worker separado; responde ok para compatibilidade com smoke tests.
    db_ok = await check_db_ready()
    return {"status": "ok" if db_ok else "degraded", "dependencies": {"db": db_ok, "worker": True}}


@app.exception_handler(Exception)
async def generic_handler(request: Request, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": "Erro interno."})


app.include_router(auth.router, prefix="/api/v1")
app.include_router(catalog.router, prefix="/api/v1")
app.include_router(cms.router, prefix="/api/v1")
app.include_router(content.router, prefix="/api/v1")
app.include_router(quotes.router, prefix="/api/v1")
app.include_router(commerce.router, prefix="/api/v1")
app.include_router(misc.router, prefix="/api/v1")

# Media estático (uploads locais enquanto não há S3)
os.makedirs("media", exist_ok=True)
app.mount("/media", StaticFiles(directory="media"), name="media")
