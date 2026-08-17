"""Ambiente de produção: hardening, segredos obrigatórios via variáveis de ambiente."""
from .base import *  # noqa: F401,F403

DEBUG = False

assert SECRET_KEY != "dev-only-secret-key-change-me-!1234567890abcdef", "SECRET_KEY é obrigatório em produção"  # noqa: S101
assert DATABASES["default"]["ENGINE"] != "django.db.backends.sqlite3", "Produção exige PostgreSQL (DATABASE_URL)"  # noqa: S101

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")  # noqa: F405