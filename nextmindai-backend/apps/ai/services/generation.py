import logging
import os
from typing import List, Dict, Optional

from .base import BaseLLMProvider

logger = logging.getLogger("apps")

_provider = None


def get_llm_provider(user=None):
    global _provider

    api_key = None
    base_url = None

    if user is not None:
        try:
            from apps.accounts.models import UserAPIKey
            user_key = UserAPIKey.objects.filter(user=user, is_active=True).first()
            if user_key:
                api_key = user_key.api_key
                base_url = user_key.provider.endpoint
                logger.info("Using user's API key for provider: %s", user_key.provider.value)
                from apps.ai.providers.openai_provider import OpenAIProvider
                return OpenAIProvider(api_key=api_key, base_url=base_url)
        except Exception:
            pass

    if _provider is None:
        import django.conf as conf
        provider_name = getattr(conf.settings, "LLM_PROVIDER", "openai")

        if provider_name == "openai":
            from apps.ai.providers.openai_provider import OpenAIProvider
            _provider = OpenAIProvider()
        else:
            try:
                from apps.accounts.models import Provider
                db_provider = Provider.objects.get(value=provider_name, is_active=True)
                from apps.ai.providers.openai_provider import OpenAIProvider
                _provider = OpenAIProvider(
                    api_key=os.environ.get("OPENAI_API_KEY"),
                    base_url=db_provider.endpoint,
                )
            except Provider.DoesNotExist:
                from apps.ai.providers.openai_provider import OpenAIProvider
                _provider = OpenAIProvider()

        logger.info("LLM provider initialized: %s", provider_name)
    return _provider
