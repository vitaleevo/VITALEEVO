"""Storage abstraction com fallback local.

Se S3/Tigris estiver configurado (via envs AWS_*), faz upload para o bucket.
Caso contrário mantém comportamento local (media/) — 100% compatível dev/teste.

Env vars usadas (todas via Settings):
  AWS_STORAGE_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY,
  AWS_S3_ENDPOINT_URL, AWS_S3_REGION_NAME, AWS_S3_ADDRESSING_STYLE

Compatível com Railway Tigris:
  AWS_S3_ENDPOINT_URL=https://storage.railway.app
  AWS_S3_REGION_NAME=auto
  AWS_S3_ADDRESSING_STYLE=virtual
"""
from __future__ import annotations

import os
import logging
from functools import lru_cache
from pathlib import Path
from typing import BinaryIO

logger = logging.getLogger(__name__)


def _get_settings():
    from app.core.config import get_settings

    return get_settings()


def is_s3_enabled() -> bool:
    """True quando todas as envs obrigatórias estão presentes."""
    try:
        return _get_settings().s3_enabled
    except Exception:
        return False


@lru_cache(maxsize=1)
def _get_s3_client():  # type: ignore[no-untyped-def]
    """Cria cliente boto3 lazy, só quando S3 está ativo."""
    settings = _get_settings()
    import boto3
    from botocore.config import Config

    addressing = (settings.aws_s3_addressing_style or "virtual").lower()
    s3_config = Config(s3={"addressing_style": addressing})
    return boto3.client(
        "s3",
        endpoint_url=settings.aws_s3_endpoint_url,
        aws_access_key_id=settings.aws_access_key_id,
        aws_secret_access_key=settings.aws_secret_access_key,
        region_name=settings.aws_s3_region_name or "auto",
        config=s3_config,
    )


def _content_type_for_ext(ext: str) -> str:
    return {
        "jpg": "image/jpeg",
        "jpeg": "image/jpeg",
        "png": "image/png",
        "webp": "image/webp",
        "gif": "image/gif",
        "avif": "image/avif",
    }.get(ext.lower(), "application/octet-stream")


def save(*, key: str, data: bytes, content_type: str | None = None) -> str:
    """
    Guarda bytes em S3 se habilitado, senão no filesystem local.
    Retorna URL pública/relativa para o ficheiro.

    key: nome dentro do bucket/pasta media (ex: 'abc123.webp')
    """
    settings = _get_settings()

    # normaliza key — sem leading slash
    key = key.lstrip("/")

    if is_s3_enabled():
        try:
            client = _get_s3_client()
            ct = content_type or _content_type_for_ext(key.rsplit(".", 1)[-1] if "." in key else "")
            # Tigris/Railway exige bucket já criado; ACL public-read não suportado em buckets com Object Lock — deixa policy do bucket controlar
            extra = {"ContentType": ct, "CacheControl": "public, max-age=31536000, immutable"}
            # Tenta com ACL public-read primeiro, fallback sem ACL se bucket bloquear
            try:
                client.put_object(
                    Bucket=settings.aws_storage_bucket_name,
                    Key=key,
                    Body=data,
                    **extra,  # type: ignore[arg-type]
                    ACL="public-read",
                )
            except Exception as e:
                if "AccessControlListNotSupported" in str(e) or "InvalidRequest" in str(e):
                    client.put_object(
                        Bucket=settings.aws_storage_bucket_name,
                        Key=key,
                        Body=data,
                        **extra,  # type: ignore[arg-type]
                    )
                else:
                    raise
            # URL pública via endpoint virtual-hosted style
            endpoint = settings.aws_s3_endpoint_url.rstrip("/")
            # endpoint virtual: https://bucket.storage.railway.app/key  vs path-style
            # Com virtual addressing, URL canónica: endpoint/bucket não — usamos endpoint com bucket como subdomínio quando possível
            # Fallback simples e fiável: endpoint/bucket/key via path-style (funciona em ambos)
            # Preferimos virtual se endpoint contiver storage.railway.app
            if "storage.railway.app" in endpoint and settings.aws_s3_addressing_style == "virtual":
                # https://storage.railway.app/bucket/key funciona também; usamos URL path-style compatível
                url = f"{endpoint}/{settings.aws_storage_bucket_name}/{key}"
            else:
                url = f"{endpoint}/{settings.aws_storage_bucket_name}/{key}"
            return url
        except Exception as exc:  # noqa: BLE001
            logger.warning("S3 upload falhou, fallback local: %s", exc)
            # cai para fallback local abaixo

    # Fallback local (dev/teste)
    media_dir = Path("media")
    media_dir.mkdir(parents=True, exist_ok=True)
    # Previne traversal mas respeita subpastas legítimas
    safe_key = "/".join(p for p in Path(key).parts if p not in ("/", "\\", ".."))
    dest = media_dir / safe_key
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(data)
    # Retorna URL relativa montada em StaticFiles (/media)
    return f"/media/{safe_key}"


def _make_thumbnail(data: bytes, max_size: tuple[int, int] = (400, 400)) -> bytes | None:
    """Gera miniatura 400x400 preservando aspect ratio. Retorna None se não for imagem válida."""
    try:
        from PIL import Image
        import io

        with Image.open(io.BytesIO(data)) as im:
            # Converte para RGB se necessário (ex: RGBA PNG)
            if im.mode in ("RGBA", "LA", "P"):
                background = Image.new("RGB", im.size, (255, 255, 255))
                if im.mode == "P":
                    im = im.convert("RGBA")
                background.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
                im = background
            elif im.mode != "RGB":
                im = im.convert("RGB")
            thumb = im.copy()
            thumb.thumbnail(max_size, Image.LANCZOS)
            out = io.BytesIO()
            # Força JPEG para miniaturas (menor tamanho), PNG se original tinha transparência já convertida
            thumb.save(out, format="JPEG", quality=82, optimize=True)
            return out.getvalue()
    except Exception as exc:  # noqa: BLE001
        logger.debug("thumbnail falhou: %s", exc)
        return None


def save_with_thumbnail(*, key: str, data: bytes, content_type: str | None = None) -> dict[str, str]:
    """Guarda original + miniatura thumb_*. Retorna {url, thumb_url}."""
    url = save(key=key, data=data, content_type=content_type)
    thumb_url = url
    thumb_data = _make_thumbnail(data)
    if thumb_data:
        thumb_key = f"thumb_{key}"
        thumb_url = save(key=thumb_key, data=thumb_data, content_type="image/jpeg")
    return {"url": url, "thumb_url": thumb_url}


def save_fileobj(*, key: str, fileobj: BinaryIO, content_type: str | None = None) -> str:
    """Variante que aceita file-like object."""
    data = fileobj.read()
    if isinstance(data, str):
        data = data.encode()
    return save(key=key, data=data, content_type=content_type)


def delete(key: str) -> None:
    """Remove ficheiro do S3 ou local. No-op se não existir."""
    key = key.lstrip("/")
    if is_s3_enabled():
        try:
            client = _get_s3_client()
            client.delete_object(Bucket=_get_settings().aws_storage_bucket_name, Key=key)
            return
        except Exception as exc:  # noqa: BLE001
            logger.warning("S3 delete falhou: %s", exc)
    try:
        Path("media") .joinpath(key).unlink(missing_ok=True)
    except Exception:
        pass


def get_presigned_url(key: str, expires: int | None = None) -> str:
    """URL assinada temporária (útil para buckets privados). Fallback retorna URL pública/local."""
    settings = _get_settings()
    key = key.lstrip("/")
    if is_s3_enabled():
        try:
            client = _get_s3_client()
            exp = expires or settings.aws_querystring_expire
            return client.generate_presigned_url(
                "get_object",
                Params={"Bucket": settings.aws_storage_bucket_name, "Key": key},
                ExpiresIn=exp,
            )
        except Exception as exc:  # noqa: BLE001
            logger.warning("presigned url falhou: %s", exc)
    # fallback
    if key.startswith("http"):
        return key
    return f"/media/{key}"
