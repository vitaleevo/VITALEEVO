"""Ambiente de desenvolvimento: ferramentas locais, sem hardening."""
from .base import *  # noqa: F401,F403

DEBUG = True

ALLOWED_HOSTS = ["*"]

# Executa tarefas em processo (sem precisar de Redis/worker local).
RQ_ASYNC = False

# E-mail impresso na consola (MAILERS em Django 6.1).
MAILERS["default"]["BACKEND"] = "django.core.mail.backends.console.EmailBackend"  # type: ignore[index]