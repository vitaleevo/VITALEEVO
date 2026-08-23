"""Configurações partilhadas por todos os ambientes.

Convenção padrão Django: cada ambiente herda daqui e só sobrepõe o necessário.
"""
from datetime import timedelta
from pathlib import Path

import environ

BASE_DIR = Path(__file__).resolve().parent.parent.parent

env = environ.Env(
    DEBUG=(bool, False),
    ALLOWED_HOSTS=(list, ["localhost", "127.0.0.1"]),
)
environ.Env.read_env(BASE_DIR / ".env")

SECRET_KEY = env("SECRET_KEY", default="dev-only-secret-key-change-me-!1234567890abcdef")
DEBUG = env("DEBUG")

# Railway injeta RAILWAY_PUBLIC_DOMAIN/RAILWAY_PRIVATE_DOMAIN automaticamente —
# juntar aos hosts permitidos (o healthcheck interno usa o hostname privado).
_allowed_hosts = env("ALLOWED_HOSTS")
for _domain in (
    env.str("RAILWAY_PUBLIC_DOMAIN", default=""),
    env.str("RAILWAY_PRIVATE_DOMAIN", default=""),
    "healthcheck.railway.app",
):
    if _domain:
        _allowed_hosts.append(_domain)
ALLOWED_HOSTS = _allowed_hosts

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Terceiros
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "corsheaders",
    "django_filters",
    "drf_spectacular",
    "django_rq",
    # Domínio
    "apps.core",
    "apps.users",
    "apps.catalog",
    "apps.quotes",
    "apps.cms",
    "apps.blog",
    "apps.portfolio",
    "apps.commerce",
    "apps.audit",
    "apps.imports",
    "apps.analytics",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "apps.core.middleware.RequestObservabilityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"
ASGI_APPLICATION = "config.asgi.application"

# Base de dados: usa DATABASE_URL (Railway / Postgres em produção).
# Se não existir, cai para SQLite local (conveniência local para testes — KISS).
database_url = env.str("DATABASE_URL", default="")
if database_url:
    DATABASES = {"default": env.db("DATABASE_URL")}
    if DATABASES["default"]["ENGINE"] == "django.db.backends.postgresql":
        DATABASES["default"]["CONN_MAX_AGE"] = 60
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
            "OPTIONS": {
                "timeout": 20,
            },
        }
    }

AUTH_USER_MODEL = "users.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator", "OPTIONS": {"min_length": 8}},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "pt-ao"
TIME_ZONE = "Africa/Luanda"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Media persistente: Railway Bucket/S3 em staging e produção; filesystem só em dev/testes.
_s3_bucket = env.str("AWS_STORAGE_BUCKET_NAME", default="")
_s3_access_key = env.str("AWS_ACCESS_KEY_ID", default="")
_s3_secret_key = env.str("AWS_SECRET_ACCESS_KEY", default="")
_s3_endpoint = env.str("AWS_S3_ENDPOINT_URL", default="")
_s3_region = env.str("AWS_S3_REGION_NAME", default="auto")
USE_S3_STORAGE = all((_s3_bucket, _s3_access_key, _s3_secret_key, _s3_endpoint))

# WhiteNoise serve apenas estáticos do Django Admin.
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}
if USE_S3_STORAGE:
    STORAGES["default"] = {
        "BACKEND": "storages.backends.s3.S3Storage",
        "OPTIONS": {
            "access_key": _s3_access_key,
            "secret_key": _s3_secret_key,
            "bucket_name": _s3_bucket,
            "endpoint_url": _s3_endpoint,
            "region_name": _s3_region,
            "addressing_style": env.str("AWS_S3_ADDRESSING_STYLE", default="virtual"),
            "querystring_auth": True,
            "querystring_expire": env.int("AWS_QUERYSTRING_EXPIRE", default=900),
            "file_overwrite": False,
        },
    }

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# --- DRF: convenções padrão ---
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 25,
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
        "rest_framework.filters.SearchFilter",
        "rest_framework.filters.OrderingFilter",
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_THROTTLE_CLASSES": ["rest_framework.throttling.ScopedRateThrottle"],
    "DEFAULT_THROTTLE_RATES": {
        "auth_login": "10/min",
        "auth_refresh": "30/min",
        "auth_register": "5/hour",
        "auth_logout": "30/min",
        "auth_password_reset": "5/hour",
        "auth_password_reset_confirm": "10/hour",
        "analytics_track": "120/min",
        "quotes": "60/min",
        "quote_status": "20/min",
        "writes": "120/min",
    },
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=15),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "CHECK_REVOKE_TOKEN": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "USER_ID_FIELD": "id",
}

SPECTACULAR_SETTINGS = {
    "TITLE": "Vitalevo API",
    "DESCRIPTION": "API do site e backoffice Vitalevo — Angola",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
}

# --- CORS ---
CORS_ALLOWED_ORIGINS = env("CORS_ALLOWED_ORIGINS", default=[
    "http://localhost:3000",
    "https://vitaleevo.ao",
    "https://www.vitaleevo.ao",
])
CORS_ALLOW_CREDENTIALS = True
CSRF_TRUSTED_ORIGINS = env.list(
    "CSRF_TRUSTED_ORIGINS",
    default=["https://api.vitaleevo.ao"],
)

# --- Redis / fila de tarefas (django-rq — KISS: sem Celery) ---
REDIS_URL = env.str("REDIS_URL", default="redis://localhost:6379/0")
RQ_QUEUES = {"default": {"URL": REDIS_URL}}
RQ_ASYNC = env.bool("RQ_ASYNC", default=True)

# --- E-mail (Django 6.1 MAILERS — EMAIL_* removido em 7.0) ---
_mail_host = env.str("EMAIL_HOST", default="")
_mail_opts = (
    {}
    if not _mail_host
    else {
        "host": _mail_host,
        "port": env.int("EMAIL_PORT", default=587),
        "username": env.str("EMAIL_HOST_USER", default=""),
        "password": env.str("EMAIL_HOST_PASSWORD", default=""),
        "use_tls": env.bool("EMAIL_USE_TLS", default=True),
    }
)
MAILERS = {
    "default": {
        "BACKEND": "django.core.mail.backends.console.EmailBackend"
        if not _mail_host
        else "django.core.mail.backends.smtp.EmailBackend",
        "OPTIONS": _mail_opts,
    }
}
DEFAULT_FROM_EMAIL = env.str("DEFAULT_FROM_EMAIL", default="no-reply@vitaleevo.ao")
PASSWORD_RESET_TIMEOUT = env.int("PASSWORD_RESET_TIMEOUT", default=900)
ANALYTICS_RETENTION_DAYS = env.int("ANALYTICS_RETENTION_DAYS", default=180)

# --- URLs públicas do site (usadas em e-mails/notificações) ---
SITE_URL = env.str("SITE_URL", default="https://vitaleevo.ao")
APPEND_SLASH = False

# Railway captura stdout/stderr; JSON facilita pesquisa, alertas e correlação.
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "json": {"()": "config.logging.JsonFormatter"},
    },
    "handlers": {
        "console": {"class": "logging.StreamHandler", "formatter": "json"},
    },
    "root": {"handlers": ["console"], "level": env.str("LOG_LEVEL", default="INFO")},
    "loggers": {
        "django.server": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "vitaleevo.request": {"handlers": ["console"], "level": "INFO", "propagate": False},
        "vitaleevo.health": {"handlers": ["console"], "level": "INFO", "propagate": False},
    },
}
