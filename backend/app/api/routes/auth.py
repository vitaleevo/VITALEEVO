import asyncio
import base64
import json
import smtplib
from email.message import EmailMessage
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_user, get_db, require_user, user_permissions
from app.core.security import (
    create_access_token,
    create_refresh_token,
    create_password_reset_token,
    decode_password_reset_token,
    decode_refresh_token,
    hash_password,
    verify_password,
)
from app.models.catalog import User
from app.core.config import get_settings

router = APIRouter(prefix="/auth", tags=["auth"])

ADMIN_PERMS = ["system:manage", "*"]


class LoginIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class RefreshIn(BaseModel):
    refresh: str


class RegisterIn(BaseModel):
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    first_name: str = Field("", max_length=120)
    last_name: str = Field("", max_length=120)
    phone: str = Field("", max_length=40)


class ChangePasswordIn(BaseModel):
    old_password: str = Field(min_length=8, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class PasswordResetIn(BaseModel):
    email: EmailStr


class PasswordResetConfirmIn(BaseModel):
    uid: str
    token: str
    password: str = Field(min_length=8, max_length=128)


async def _user_by_email(db: AsyncSession, email: str) -> User | None:
    result = await db.execute(select(User).where(User.email == email.lower()))
    return result.scalar_one_or_none()


def _token_out(user: User) -> dict:
    import json as _json

    return {
        "access": create_access_token(subject=user.email, extra={"role": user.role, "ver": user.token_version or 0}),
        "refresh": create_refresh_token(subject=user.email, extra={"ver": user.token_version or 0}),
        "user": {
            "id": user.id,
            "email": user.email,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "phone": user.phone,
            "role": user.role,
            "is_staff": user.is_staff,
            "permissions": user_permissions(user),
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    }


def _send_reset_email(recipient: str, reset_url: str) -> None:
    settings = get_settings()
    if not settings.mail_password:
        return
    message = EmailMessage()
    message["Subject"] = "Reposição da palavra-passe Vitaleevo"
    message["From"] = settings.mail_from
    message["To"] = recipient
    message.set_content(
        "Recebemos um pedido para repor a sua palavra-passe. "
        f"Abra este link nos próximos 15 minutos: {reset_url}\n\n"
        "Se não fez este pedido, ignore esta mensagem."
    )
    with smtplib.SMTP(settings.mail_host, settings.mail_port, timeout=10) as smtp:
        smtp.starttls()
        smtp.login(settings.mail_user, settings.mail_password)
        smtp.send_message(message)


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
    if not user or not user.active or int(payload.get("ver", 0)) != int(user.token_version or 0):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Sessão inválida.")
    return {
        "access": create_access_token(subject=user.email, extra={"role": user.role, "ver": user.token_version or 0}),
        "refresh": create_refresh_token(subject=user.email, extra={"ver": user.token_version or 0}),
    }


@router.post("/logout")
async def logout(data: RefreshIn | None = None, db: AsyncSession = Depends(get_db)):
    if data:
        payload = decode_refresh_token(data.refresh)
        if payload and payload.get("sub"):
            user = await _user_by_email(db, payload["sub"])
            if user:
                user.token_version = int(user.token_version or 0) + 1
                await db.commit()
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
        "created_at": user.created_at.isoformat() if user.created_at else None,
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
        "created_at": user.created_at.isoformat() if user.created_at else None,
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
    user.token_version = int(user.token_version or 0) + 1
    await db.commit()
    return {"detail": "Senha alterada."}


@router.post("/password-reset")
async def password_reset(data: PasswordResetIn, db: AsyncSession = Depends(get_db)):
    user = await _user_by_email(db, data.email.strip().lower())
    if user:
        settings = get_settings()
        token = create_password_reset_token(user.email, int(user.token_version or 0))
        uid = base64.urlsafe_b64encode(str(user.id).encode()).decode()
        url = f"{settings.site_url.rstrip('/')}/recuperar-senha?uid={uid}&token={token}"
        await asyncio.to_thread(_send_reset_email, user.email, url)
    return {"detail": "Se o e-mail existir, enviámos um link de reposição."}


@router.post("/password-reset/confirm")
async def password_reset_confirm(data: PasswordResetConfirmIn, db: AsyncSession = Depends(get_db)):
    try:
        user_id = int(base64.urlsafe_b64decode(data.uid.encode()).decode())
    except Exception:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Link inválido ou expirado.")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    payload = decode_password_reset_token(data.token)
    if not user or not payload or payload.get("sub") != user.email or int(payload.get("ver", -1)) != int(user.token_version or 0):
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "Link inválido ou expirado.")
    if len(data.password) < 8:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "Senha muito curta.")
    user.hashed_password = hash_password(data.password)
    user.token_version = int(user.token_version or 0) + 1
    await db.commit()
    return {"detail": "Senha reposta."}
