from pathlib import Path

from sqlalchemy import event, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings


def _normalize_async_url(url: str) -> str:
    if url.startswith("postgresql+asyncpg://") or url.startswith(
        "postgresql+psycopg://"
    ):
        return url
    if url.startswith("postgresql://") or url.startswith("postgres://"):
        return url.replace("postgresql://", "postgresql+psycopg://", 1).replace(
            "postgres://", "postgresql+psycopg://", 1
        )
    return url


_engine = None
_sessionmaker = None


def get_engine():
    global _engine
    if _engine is None:
        settings = get_settings()
        url = _normalize_async_url(settings.database_url)
        connect_args = {}
        if url.startswith("sqlite"):
            db_path = url.split("///")[-1]
            if db_path and db_path != ":memory:":
                Path(db_path).parent.mkdir(parents=True, exist_ok=True)
            connect_args = {"check_same_thread": False}
        _engine = create_async_engine(url, connect_args=connect_args, pool_pre_ping=True)
        if url.startswith("sqlite"):
            @event.listens_for(_engine.sync_engine, "connect")
            def _set_sqlite_pragma(dbapi_connection, _):
                cursor = dbapi_connection.cursor()
                cursor.execute("PRAGMA foreign_keys=ON")
                cursor.close()
    return _engine


def get_sessionmaker() -> async_sessionmaker[AsyncSession]:
    global _sessionmaker
    if _sessionmaker is None:
        _sessionmaker = async_sessionmaker(get_engine(), expire_on_commit=False)
    return _sessionmaker


async def reset_engine():
    global _engine, _sessionmaker
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _sessionmaker = None


async def check_db_ready() -> bool:
    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True
    except Exception:
        return False
