from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.core.enums import StaffRole

User = get_user_model()

class Command(BaseCommand):
    help = "Garante a existência de um utilizador administrador"

    def handle(self, *args, **options):
        email = "negociosvitaleevo@gmail.com"
        password = "Am3liazau123!!!"
        
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "first_name": "Super Admin",
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
        user.first_name = "Super Admin"
        user.last_name = "VitalEvo"
        user.save()
        
        if created:
            self.stdout.write(self.style.SUCCESS(f"Super admin criado: {email}"))
        else:
            self.stdout.write(self.style.SUCCESS(f"Super admin atualizado: {email}"))

        # Manter admin@vitaleevo.ao como admin secundário para compatibilidade
        legacy_email = "admin@vitaleevo.ao"
        legacy, _ = User.objects.get_or_create(
            email=legacy_email,
            defaults={
                "first_name": "Administrador",
                "last_name": "VitalEvo",
                "role": StaffRole.ADMIN,
                "is_staff": True,
                "is_superuser": True,
                "is_active": True,
            }
        )
        legacy.role = StaffRole.ADMIN
        legacy.is_staff = True
        legacy.is_superuser = True
        legacy.is_active = True
        legacy.save()
