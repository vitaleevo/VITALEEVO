"""Bootstrap manual e seguro de um super administrador."""

import os

from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.core.management.base import BaseCommand, CommandError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken

from apps.core.enums import StaffRole

User = get_user_model()


class Command(BaseCommand):
    help = "Cria ou promove um super administrador sem credenciais fixas no código."

    def add_arguments(self, parser):
        parser.add_argument(
            "--email",
            default=os.environ.get("ADMIN_BOOTSTRAP_EMAIL"),
            help="E-mail do administrador (ou ADMIN_BOOTSTRAP_EMAIL).",
        )
        parser.add_argument(
            "--password",
            default=os.environ.get("ADMIN_BOOTSTRAP_PASSWORD"),
            help="Password apenas para criação/rotação (ou ADMIN_BOOTSTRAP_PASSWORD).",
        )
        parser.add_argument(
            "--rotate-password",
            action="store_true",
            help="Redefine explicitamente a password de um administrador existente.",
        )

    def handle(self, *args, **options):
        email = (options.get("email") or "").strip().lower()
        password = options.get("password") or ""
        rotate_password = bool(options.get("rotate_password"))

        if not email:
            raise CommandError("Informe --email ou ADMIN_BOOTSTRAP_EMAIL.")

        existing = User.objects.filter(email=email).first()
        if existing is None and not password:
            raise CommandError(
                "Uma password é obrigatória para criar o administrador; "
                "use --password ou ADMIN_BOOTSTRAP_PASSWORD."
            )
        if existing is not None and rotate_password and not password:
            raise CommandError(
                "Informe --password ou ADMIN_BOOTSTRAP_PASSWORD para rotacionar a password."
            )

        user = existing or User(email=email)
        created = existing is None
        user.role = StaffRole.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        if created or rotate_password:
            validate_password(password, user=user)
            user.set_password(password)
        user.save()

        if rotate_password and not created:
            for token in OutstandingToken.objects.filter(user=user):
                BlacklistedToken.objects.get_or_create(token=token)

        action = "criado" if created else "promovido/confirmado"
        if rotate_password and not created:
            action = "atualizado com password rotacionada"
        self.stdout.write(self.style.SUCCESS(f"Super administrador {action}: {email}"))
