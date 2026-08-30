from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import decode_access_token
from app.db.session import get_sessionmaker
from app.models.catalog import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


async def get_db():
    sessionmaker = get_sessionmaker()
    async with sessionmaker() as session:
        yield session


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    if not token:
        return None
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        return None
    result = await db.execute(select(User).where(User.email == payload["sub"]))
    user = result.scalar_one_or_none()
    if user is None or int(payload.get("ver", 0)) != int(user.token_version or 0):
        return None
    return user


def user_permissions(user: User | None) -> list[str]:
    if user is None:
        return []
    import json

    try:
        perms = json.loads(user.permissions or "[]")
    except ValueError:
        perms = []
    if user.is_admin:
        perms = list(set(perms) | {"system:manage", "*"})
    return [p for p in perms if p != ""]


async def require_user(user: User | None = Depends(get_current_user)) -> User:
    if user is None or not user.active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    return user


async def require_staff(user: User | None = Depends(get_current_user)) -> User:
    if user is None or not user.active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sessão inválida.")
    if not user.is_staff and not user.is_admin:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito.")
    return user


def has_perm(user: User, permission: str) -> bool:
    perms = user_permissions(user)
    return "*" in perms or permission in perms


def utcnow() -> datetime:
    return datetime.now(timezone.utc)
