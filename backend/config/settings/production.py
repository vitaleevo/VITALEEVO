"""Ambiente de produção: hardening, segredos obrigatórios via variáveis de ambiente."""
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403

DEBUG = False

if SECRET_KEY == "dev-only-secret-key-change-me-!1234567890abcdef":
    raise ImproperlyConfigured("SECRET_KEY é obrigatório em produção")
if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":
    raise ImproperlyConfigured("Produção exige PostgreSQL configurado via DATABASE_URL")
if not USE_S3_STORAGE:  # noqa: F405
    raise ImproperlyConfigured("Produção exige Railway Bucket/S3 para media persistente")
_default_mailer = MAILERS["default"]  # noqa: F405
_mail_opts_prod = _default_mailer.get("OPTIONS", {})  # noqa: F405
if (
    _default_mailer["BACKEND"] == "django.core.mail.backends.console.EmailBackend"
    or not _mail_opts_prod.get("host")
    or not _mail_opts_prod.get("username")
    or not _mail_opts_prod.get("password")
):
    raise ImproperlyConfigured("SMTP é obrigatório em produção")

SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
# Railway healthcheck hits http:// private network without X-Forwarded-Proto.
SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS")  # noqa: F405
