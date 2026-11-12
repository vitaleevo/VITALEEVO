"""Django homologation settings for an isolated Railway staging environment.

Use separate Postgres and Redis services, no copied production environment
variables, no real payment gateway credentials and no real outbound emails.
"""
from django.core.exceptions import ImproperlyConfigured

from .base import *  # noqa: F401,F403

# Hard gate: never run these settings in the current Railway production env.
if env.str("RAILWAY_ENVIRONMENT_NAME", default="") != "staging":  # noqa: F405
    raise ImproperlyConfigured("Settings de staging exigem RAILWAY_ENVIRONMENT_NAME=staging.")

DEBUG = False

if SECRET_KEY == "dev-only-secret-key-change-me-!1234567890abcdef":  # noqa: F405
    raise ImproperlyConfigured("SECRET_KEY exclusivo de staging obrigatorio.")
if DATABASES["default"]["ENGINE"] != "django.db.backends.postgresql":  # noqa: F405
    raise ImproperlyConfigured("Staging exige PostgreSQL proprio.")
if not env.str("DATABASE_URL", default=""):  # noqa: F405
    raise ImproperlyConfigured("DATABASE_URL de staging nao configurada.")
if not env.str("REDIS_URL", default=""):  # noqa: F405
    raise ImproperlyConfigured("REDIS_URL de staging nao configurada.")

_staging_site = env.str("SITE_URL", default="").strip().lower().rstrip("/")  # noqa: F405
if not _staging_site.startswith("https://") or _staging_site in (
    "https://vitaleevo.ao",
    "https://www.vitaleevo.ao",
    "https://api.vitaleevo.ao",
):
    raise ImproperlyConfigured("SITE_URL deve ser HTTPS e exclusivo de staging.")

# Tests must not send real emails or initiate real ProxyPay transactions.
MAILERS["default"] = {"BACKEND": "django.core.mail.backends.dummy.EmailBackend"}  # noqa: F405
PROXYPAY_RPS_API_KEY = ""
PROXYPAY_OPG_TOKEN = ""
PROXYPAY_ENTITY_ID = ""
PROXYPAY_OPG_POS_ID = 0

# Production-like browser security without HSTS on an ephemeral test domain.
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SECURE_SSL_REDIRECT = True
SECURE_REDIRECT_EXEMPT = [r"^api/v1/health/"]
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 0
CORS_ALLOWED_ORIGINS = env.list("CORS_ALLOWED_ORIGINS", default=[])  # noqa: F405
CSRF_TRUSTED_ORIGINS = env.list("CSRF_TRUSTED_ORIGINS", default=[])  # noqa: F405
