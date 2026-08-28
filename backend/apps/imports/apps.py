"""Importação de dados em massa a partir de Excel (backoffice)."""
from django.apps import AppConfig


class ImportsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "apps.imports"
    verbose_name = "Importações"