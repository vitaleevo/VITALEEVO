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

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
