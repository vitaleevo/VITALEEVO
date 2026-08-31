from datetime import datetime, timedelta, timezone

import bcrypt
import jwt

from app.core.config import get_settings


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, extra: dict | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload: dict = {"sub": subject, "exp": expire}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def create_refresh_token(subject: str, extra: dict | None = None) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.refresh_token_expire_minutes
    )
    payload: dict = {"sub": subject, "exp": expire, "typ": "refresh"}
    if extra:
        payload.update(extra)
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_access_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        return jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
    except jwt.PyJWTError:
        return None


def decode_refresh_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        if payload.get("typ") != "refresh":
            return None
        return payload
    except jwt.PyJWTError:
        return None


def create_password_reset_token(subject: str, token_version: int) -> str:
    settings = get_settings()
    payload = {
        "sub": subject,
        "ver": token_version,
        "typ": "password_reset",
        "exp": datetime.now(timezone.utc) + timedelta(minutes=15),
    }
    return jwt.encode(payload, settings.secret_key, algorithm=settings.algorithm)


def decode_password_reset_token(token: str) -> dict | None:
    settings = get_settings()
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        return payload if payload.get("typ") == "password_reset" else None
    except jwt.PyJWTError:
        return None
