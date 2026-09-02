from django.db import migrations


def seed_providers(apps, schema_editor):
    Provider = apps.get_model("accounts", "Provider")
    providers = [
        {"value": "groq", "label": "Groq", "endpoint": "https://api.groq.com/openai/v1", "placeholder": "gsk_...", "color": "#f55036"},
        {"value": "together", "label": "Together AI", "endpoint": "https://api.together.xyz/v1", "placeholder": "tok_...", "color": "#6366f1"},
        {"value": "cohere", "label": "Cohere", "endpoint": "https://api.cohere.com/v2", "placeholder": "sk-...", "color": "#39594D"},
        {"value": "huggingface", "label": "Hugging Face", "endpoint": "https://api-inference.huggingface.co/v1", "placeholder": "hf_...", "color": "#ffd21e"},
        {"value": "perplexity", "label": "Perplexity", "endpoint": "https://api.perplexity.ai", "placeholder": "pplx-...", "color": "#20b8cd"},
        {"value": "cloudflare", "label": "Cloudflare Workers AI", "endpoint": "https://api.cloudflare.com/client/v4", "placeholder": "...", "color": "#f48120"},
        {"value": "replicate", "label": "Replicate", "endpoint": "https://api.replicate.com/v1", "placeholder": "r8_...", "color": "#3b82f6"},
    ]
    for p in providers:
        Provider.objects.update_or_create(value=p["value"], defaults=p)


def remove_providers(apps, schema_editor):
    Provider = apps.get_model("accounts", "Provider")
    for p in ["groq", "together", "cohere", "huggingface", "perplexity", "cloudflare", "replicate"]:
        Provider.objects.filter(value=p).delete()


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0003_logo_charfield'),
    ]

    operations = [
        migrations.RunPython(seed_providers, remove_providers),
    ]
