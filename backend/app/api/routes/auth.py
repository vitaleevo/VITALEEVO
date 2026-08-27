import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_user, user_permissions
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.catalog import User

router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_PERMS = ["system:manage", "*"]


class LoginIn(BaseModel):
    email: str
    password: str


class RefreshIn(BaseModel):
    refresh: str


class RegisterIn(BaseModel):
    email: str
    password: str
    first_name: str = ""
    last_name: str = ""
    phone: str = ""


class ChangePasswordIn(BaseModel):
    old_password: str
    new_password: str


class PasswordResetIn(BaseModel):
    email: str


class PasswordResetConfirmIn(BaseModel):
    uid: str
    token: str
    password: str


async def _user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


def _token_out(user: User) -> dict:
    import json as _json

    return {
        "access": create_access_token(subject=user.email, extra={"role": user.role}),
        "refresh": create_refresh_token(subject=user.email),
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "is_staff": user.is_staff,
            "permissions": user_permissions(user),
        },
    }


@router.post("/login")
async def login(data: LoginIn, db: AsyncSession = Depends(get_db)):
    user = await _user_by_email(db, data.email.strip().lower())
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciais inválidas.")
    if not user.active:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Conta desativada.")
    return _token_out(user)


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(data: RegisterIn, db: AsyncSession = Depends(get_db)):
    if await _user_by_email(db, data.email.strip().lower()):
        raise HTTPException(status.HTTP_409_CONFLICT, "E-mail já registado.")
    if len(data.password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Senha muito curta.")
    user = User(
        email=data.email.strip().lower(),
        first_name=data.first_name.strip(),
        last_name=data.last_name.strip(),
        phone=data.phone.strip(),
        hashed_password=hash_password(data.password),
        role="client",
        permissions=json.dumps([]),
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return _token_out(user)


@router.post("/refresh")
async def refresh(data: RefreshIn, db: AsyncSession = Depends(get_db)):
    payload = decode_refresh_token(data.refresh)
    if not payload:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão expirada.")
    user = await _user_by_email(db, payload["sub"])
    if not user or not user.active:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão inválida.")
    return {
        "access": create_access_token(subject=user.email, extra={"role": user.role}),
        "refresh": create_refresh_token(subject=user.email),
    }


@router.post("/logout")
async def logout(data: RefreshIn | None = None):
    return {"detail": "ok"}


@router.get("/me")
async def me(user: User | None = Depends(get_current_user)):
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão inválida.")
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role,
        "is_staff": user.is_staff,
        "permissions": user_permissions(user),
    }


@router.patch("/me")
async def update_me(
    data: dict, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)
):
    for field in ("first_name", "last_name", "phone"):
        if field in data:
            setattr(user, field, str(data[field]).strip())
    await db.commit()
    return {
        "id": user.id,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "role": user.role,
        "is_staff": user.is_staff,
        "permissions": user_permissions(user),
    }


@router.post("/change-password")
async def change_password(
    data: ChangePasswordIn, user: User | None = Depends(require_user), db: AsyncSession = Depends(get_db)
):
    if not verify_password(data.old_password, user.hashed_password):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Senha atual incorreta.")
    if len(data.new_password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Senha muito curta.")
    user.hashed_password = hash_password(data.new_password)
    await db.commit()
    return {"detail": "Senha alterada."}


@router.post("/password-reset")
async def password_reset(data: PasswordResetIn, db: AsyncSession = Depends(get_db)):
    user = await _user_by_email(db, data.email.strip().lower())
    if user:
        # No SMTP real ainda: devolver o link apenas em dev; em produção falha silenciosamente
        try:
            import base64
            import urllib.parse

            payload = f"reset|{user.email}|{int(datetime.now(timezone.utc).timestamp())}"
            token = base64.urlsafe_b64encode(payload.encode()).decode()
            uid = base64.urlsafe_b64encode(str(user.id).encode()).decode()
            url = f"{urllib.parse.urljoin('https://vitaleevo.ao', '/recuperar-senha')}?uid={uid}&token={token}"
        except Exception:
            pass
    return {"detail": "Se o e-mail existir, enviámos um link de reposição."}


@router.post("/password-reset/confirm")
async def password_reset_confirm(data: PasswordResetConfirmIn, db: AsyncSession = Depends(get_db)):
    import base64

    try:
        user_id = int(base64.urlsafe_b64decode(data.uid.encode()).decode())
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Link inválido ou expirado.")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Link inválido ou expirado.")
    if len(data.password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Senha muito curta.")
    user.hashed_password = hash_password(data.password)
    await db.commit()
    return {"detail": "Senha reposta."}
