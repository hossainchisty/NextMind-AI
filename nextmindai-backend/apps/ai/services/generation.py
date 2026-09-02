import logging
from typing import List, Dict, Optional

logger = logging.getLogger("apps")

_provider = None


def get_llm_provider(user=None):
    global _provider

    api_key = None
    base_url = None
    provider_override = None

    if user is not None:
        try:
            from apps.accounts.models import UserAPIKey
            user_key = UserAPIKey.objects.filter(user=user, is_active=True).first()
            if user_key:
                api_key = user_key.api_key
                provider_value = user_key.provider.value
                logger.info("Using user's API key for provider: %s", provider_value)
                if provider_value in ("openai", "gemini", "openrouter", "deepseek", "opencode", "xai", "mistral", "nvidia", "fireworks", "groq", "together", "cohere", "huggingface", "perplexity", "cloudflare", "replicate"):
                    from apps.ai.providers.openai_provider import OpenAIProvider
                    base_url = None
                    if provider_value == "gemini":
                        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/"
                    elif provider_value == "openrouter":
                        base_url = "https://openrouter.ai/api/v1"
                    elif provider_value == "deepseek":
                        base_url = "https://api.deepseek.com/v1"
                    elif provider_value == "opencode":
                        base_url = "https://opencode.ai/zen/v1"
                    elif provider_value == "xai":
                        base_url = "https://api.x.ai/v1"
                    elif provider_value == "mistral":
                        base_url = "https://api.mistral.ai/v1"
                    elif provider_value == "nvidia":
                        base_url = "https://integrate.api.nvidia.com/v1"
                    elif provider_value == "fireworks":
                        base_url = "https://api.fireworks.ai/inference/v1"
                    elif provider_value == "groq":
                        base_url = "https://api.groq.com/openai/v1"
                    elif provider_value == "together":
                        base_url = "https://api.together.xyz/v1"
                    elif provider_value == "cohere":
                        base_url = "https://api.cohere.com/compatibility/v1"
                    elif provider_value == "huggingface":
                        base_url = "https://api-inference.huggingface.co/v1"
                    elif provider_value == "perplexity":
                        base_url = "https://api.perplexity.ai"
                    elif provider_value == "cloudflare":
                        base_url = "https://api.cloudflare.com/client/v4"
                    elif provider_value == "replicate":
                        base_url = "https://api.replicate.com/v1"
                    return OpenAIProvider(api_key=api_key, base_url=base_url)
                elif provider_value == "anthropic":
                    from apps.ai.providers.anthropic_provider import AnthropicProvider
                    return AnthropicProvider(api_key=api_key)
        except Exception:
            pass

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
