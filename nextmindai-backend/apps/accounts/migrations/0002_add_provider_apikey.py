from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


def seed_providers(apps, schema_editor):
    Provider = apps.get_model("accounts", "Provider")
    providers = [
        {"value": "openai", "label": "OpenAI", "endpoint": "https://api.openai.com/v1", "placeholder": "sk-...", "logo": "openai", "color": "#10a37f"},
        {"value": "anthropic", "label": "Anthropic", "endpoint": "https://api.anthropic.com", "placeholder": "sk-ant-...", "logo": "anthropic", "color": "#d4a574"},
        {"value": "gemini", "label": "Google Gemini", "endpoint": "https://generativelanguage.googleapis.com", "placeholder": "AIza...", "logo": "gemini", "color": "#4285f4"},
        {"value": "openrouter", "label": "OpenRouter", "endpoint": "https://openrouter.ai/api/v1", "placeholder": "sk-or-...", "logo": "openrouter", "color": "#8b5cf6"},
        {"value": "deepseek", "label": "DeepSeek", "endpoint": "https://api.deepseek.com/v1", "placeholder": "sk-...", "logo": "deepseek", "color": "#0ea5e9"},
        {"value": "xai", "label": "xAI Grok", "endpoint": "https://api.x.ai/v1", "placeholder": "xai-...", "logo": "xai", "color": "#000000"},
        {"value": "mistral", "label": "Mistral", "endpoint": "https://api.mistral.ai/v1", "placeholder": "mist-...", "logo": "mistral", "color": "#ff7000"},
        {"value": "nvidia", "label": "NVIDIA", "endpoint": "https://integrate.api.nvidia.com/v1", "placeholder": "nvapi-...", "logo": "nvidia", "color": "#76b900"},
        {"value": "fireworks", "label": "Fireworks", "endpoint": "https://api.fireworks.ai/inference/v1", "placeholder": "fw-...", "logo": "fireworks", "color": "#ff4d00"},
        {"value": "opencode", "label": "OpenCode Zen", "endpoint": "https://opencode.ai/zen/v1", "placeholder": "sk-...", "logo": "opencode", "color": "#6366f1"},
    ]
    for p in providers:
        Provider.objects.update_or_create(value=p["value"], defaults=p)


def remove_providers(apps, schema_editor):
    Provider = apps.get_model("accounts", "Provider")
    Provider.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Provider',
            fields=[
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('value', models.CharField(max_length=50, unique=True)),
                ('label', models.CharField(max_length=100)),
                ('endpoint', models.URLField(max_length=500)),
                ('placeholder', models.CharField(default='sk-...', max_length=50)),
                ('logo', models.CharField(default='', max_length=50)),
                ('color', models.CharField(default='#666666', max_length=20)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['label'],
            },
        ),
        migrations.CreateModel(
            name='UserAPIKey',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('created_at', models.DateTimeField(auto_now_add=True, db_index=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('api_key', models.CharField(max_length=500)),
                ('label', models.CharField(blank=True, default='', max_length=100)),
                ('is_active', models.BooleanField(default=True)),
                ('provider', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_keys', to='accounts.provider')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='api_keys', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
                'unique_together': {('user', 'provider')},
            },
        ),
        migrations.RunPython(seed_providers, remove_providers),
    ]