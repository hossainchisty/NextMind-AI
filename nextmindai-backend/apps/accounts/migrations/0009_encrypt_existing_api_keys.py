from django.db import migrations


def encrypt_legacy_keys(apps, schema_editor):
    from apps.accounts.services.vault import encrypt_api_key, is_encrypted

    UserAPIKey = apps.get_model("accounts", "UserAPIKey")
    for key in UserAPIKey.objects.all().only("id", "api_key"):
        if key.api_key and not is_encrypted(key.api_key):
            key.api_key = encrypt_api_key(key.api_key)
            key.save(update_fields=["api_key"])


class Migration(migrations.Migration):

    dependencies = [
        ("accounts", "0008_seed_meta_qwen_minimax_zhipu"),
    ]

    operations = [
        migrations.RunPython(encrypt_legacy_keys, migrations.RunPython.noop),
    ]
