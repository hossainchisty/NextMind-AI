import logging
from typing import List, Dict, Optional

import django.conf as conf

logger = logging.getLogger("apps")

_llm_client = None
_llm_model = None


def _get_client():
    global _llm_client, _llm_model
    if _llm_client is None:
        import openai
        _llm_model = getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini")

        provider_name = getattr(conf.settings, "LLM_PROVIDER", "openai")
        from apps.accounts.models import Provider
        db_provider = Provider.objects.get(value=provider_name, is_active=True)

        _llm_client = openai.OpenAI(api_key="omniroute", base_url=db_provider.endpoint)
        logger.info("LLM client initialized: %s (%s)", provider_name, db_provider.endpoint)
    return _llm_client


def generate(messages: List[Dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
    client = _get_client()
    response = client.chat.completions.create(
        model=_llm_model or "gpt-4o-mini",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    return response.choices[0].message.content


def get_llm_provider(user=None):
    if user is not None:
        try:
            from apps.accounts.models import UserAPIKey
            user_key = UserAPIKey.objects.filter(user=user, is_active=True).first()
            if user_key:
                import openai
                logger.info("Using user's API key for provider: %s", user_key.provider.value)
                client = openai.OpenAI(api_key=user_key.api_key, base_url=user_key.provider.endpoint)
                model = getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini")
                return _ProviderStub(client, model)
        except Exception:
            pass
    return _ProviderStub(_get_client(), getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini"))


class _ProviderStub:
    def __init__(self, client, model):
        self._client = client
        self._model = model

    def generate(self, messages, temperature=0.3, max_tokens=2048):
        response = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
