from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.enums import StaffRole

User = get_user_model()

class Command(BaseCommand):
    help = "Garante a existência de um utilizador administrador"

    def handle(self, *args, **options):
        email = "admin@vitaleevo.ao"
        password = "Admin@vitaleevo2026!"
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "Administrador",
                "last_name": "VitalEvo",
                "role": StaffRole.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            }
        )
        user.set_password(password)
        user.role = StaffRole.ADMIN
        user.is_staff = True
        user.is_superuser = True
        user.is_active = True
        user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f"Administrador criado: {email}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Palavra-passe do administrador atualizada: {email}"))
