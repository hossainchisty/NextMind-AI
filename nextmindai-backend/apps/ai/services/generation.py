import logging
from typing import List, Dict, Optional

logger = logging.getLogger("apps")

_provider = None


def get_llm_provider():
    global _provider
    if _provider is None:
        import django.conf as conf
        provider_name = getattr(conf.settings, "LLM_PROVIDER", "openai")

        if provider_name == "openai":
            from apps.ai.providers.openai_provider import OpenAIProvider
            _provider = OpenAIProvider()
        elif provider_name == "anthropic":
            from apps.ai.providers.anthropic_provider import AnthropicProvider
            _provider = AnthropicProvider()
        else:
            from apps.ai.providers.local_provider import LocalProvider
            _provider = LocalProvider()

        logger.info("LLM provider initialized: %s", provider_name)
    return _provider
