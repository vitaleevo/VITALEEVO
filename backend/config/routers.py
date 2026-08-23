"""Router para 100k: reads vão para replica quando disponível, writes sempre no primary."""
import random


class ReplicaRouter:
    def db_for_read(self, model, **hints):
        from django.conf import settings

        if "replica" in settings.DATABASES:
            return random.choice(["default", "replica"]) if model._meta.app_label in {"catalog", "cms", "blog", "portfolio"} else "default"
        return "default"

    def db_for_write(self, model, **hints):
        return "default"

    def allow_relation(self, obj1, obj2, **hints):
        return True

    def allow_migrate(self, db, app_label, model_name=None, **hints):
        return db == "default"
