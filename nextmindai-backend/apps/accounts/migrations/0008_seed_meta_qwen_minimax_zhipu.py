# Generated manually
from django.db import migrations


def seed_providers(apps, schema_editor):
    Provider = apps.get_model("accounts", "Provider")
    providers = [
        {
            "value": "meta",
            "label": "Meta (Llama)",
            "endpoint": "https://api.llama.com/compat/v1",
            "placeholder": "LLM_...",
            "color": "#0668E1",
        },
        {
            "value": "qwen",
            "label": "Qwen (Alibaba)",
            "endpoint": "https://dashscope.aliyuncs.com/compatible-mode/v1",
            "placeholder": "sk-...",
            "color": "#615EFC",
        },
        {
            "value": "minimax",
            "label": "MiniMax",
            "endpoint": "https://api.minimax.chat/v1",
            "placeholder": "eyJ...",
            "color": "#3B82F6",
        },
        {
            "value": "zhipu",
            "label": "Zhipu (GLM)",
            "endpoint": "https://open.bigmodel.cn/api/paas/v4",
            "placeholder": "...",
            "color": "#4D5BFF",
        },
        {
            "value": "xiaomi",
            "label": "Xiaomi",
            "endpoint": "https://api.xiaomimimo.com/v1",
            "placeholder": "...",
            "color": "#FF6900",
        },
    ]
    for p in providers:
        Provider.objects.update_or_create(value=p["value"], defaults=p)


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0007_alter_user_avatar"),
    ]

    operations = [
        migrations.RunPython(seed_providers, migrations.RunPython.noop),
    ]
