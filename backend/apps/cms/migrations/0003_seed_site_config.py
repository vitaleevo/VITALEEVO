from django.db import migrations


def seed_site_config(apps, schema_editor):
    Setting = apps.get_model("cms", "Setting")
    Setting.objects.update_or_create(
        key="site_config",
        defaults={
            "value": {
                "siteName": "VitalEvo",
                "currency": "AOA",
            }
        },
    )


class Migration(migrations.Migration):
    dependencies = [
        ("cms", "0002_newsletterbroadcast"),
    ]

    operations = [
        migrations.RunPython(seed_site_config, migrations.RunPython.noop),
    ]
