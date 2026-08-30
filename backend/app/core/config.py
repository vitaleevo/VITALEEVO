from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    site_name: str = "Vitaleevo"
    secret_key: str = "dev-insecure-change-me"
    algorithm: str = "HS256"
    database_url: str = "sqlite+aiosqlite:///./vitaleevo.db"
    cors_origins: str = "http://localhost:3000"
    access_token_expire_minutes: float = 15
    refresh_token_expire_minutes: float = 60 * 24 * 7
    first_admin_email: str = "admin@vitaleevo.ao"
    first_admin_password: str = ""
    mail_host: str = "smtp.resend.com"
    mail_port: int = 587
    mail_user: str = "resend"
    mail_password: str = ""
    mail_from: str = "no-reply@vitaleevo.ao"
    site_url: str = "https://vitaleevo.ao"

    # S3 / Tigris (Railway) — fallback local quando não configurado
    aws_storage_bucket_name: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""
    aws_s3_endpoint_url: str = ""
    aws_s3_region_name: str = "auto"
    aws_s3_addressing_style: str = "virtual"
    aws_querystring_expire: int = 900

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    @property
    def s3_enabled(self) -> bool:
        return bool(
            self.aws_storage_bucket_name
            and self.aws_access_key_id
            and self.aws_secret_access_key
            and self.aws_s3_endpoint_url
        )

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
