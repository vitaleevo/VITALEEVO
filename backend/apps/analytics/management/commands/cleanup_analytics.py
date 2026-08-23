"""Remove eventos analíticos além da retenção configurada."""

from django.core.management.base import BaseCommand

from apps.analytics.tasks import purge_old_analytics


class Command(BaseCommand):
    help = "Remove pageviews e cliques mais antigos que a retenção configurada."

    def add_arguments(self, parser):
        parser.add_argument("--days", type=int, help="Substitui ANALYTICS_RETENTION_DAYS.")

    def handle(self, *args, **options):
        days = options.get("days")
        if days is not None and days < 1:
            self.stderr.write("--days deve ser maior que zero.")
            return
        deleted = purge_old_analytics(days)
        self.stdout.write(
            self.style.SUCCESS(
                f"Analytics removidos: {deleted['pageviews']} pageviews, {deleted['clicks']} cliques."
            )
        )
