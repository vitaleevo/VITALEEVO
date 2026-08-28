from django.db import migrations


ORDER_PERMISSIONS = ("orders:read", "orders:manage")


def add_operations_order_permissions(apps, schema_editor):
    User = apps.get_model("users", "User")
    for user in User.objects.filter(role="operations").iterator():
        permissions = list(user.permissions or [])
        changed = False
        for permission in ORDER_PERMISSIONS:
            if permission not in permissions:
                permissions.append(permission)
                changed = True
        if changed:
            User.objects.filter(pk=user.pk).update(permissions=permissions, is_staff=True)


def remove_operations_order_permissions(apps, schema_editor):
    User = apps.get_model("users", "User")
    for user in User.objects.filter(role="operations").iterator():
        permissions = [item for item in (user.permissions or []) if item not in ORDER_PERMISSIONS]
        User.objects.filter(pk=user.pk).update(permissions=permissions)


class Migration(migrations.Migration):
    dependencies = [("users", "0001_initial")]

    operations = [
        migrations.RunPython(add_operations_order_permissions, remove_operations_order_permissions),
    ]
