import logging
from typing import List, Dict, Optional

import django.conf as conf

logger = logging.getLogger("apps")

_default_client = None
_default_model = None


def _get_default_client():
    global _default_client, _default_model
    if _default_client is None:
        import openai
        import os
        _default_model = getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini")
        provider_name = getattr(conf.settings, "LLM_PROVIDER", "openai")
        from apps.accounts.models import Provider
        db_provider = Provider.objects.get(value=provider_name, is_active=True)
        api_key = getattr(conf.settings, "OPENAI_API_KEY", "") or os.environ.get("OPENAI_API_KEY", "")
        if not api_key:
            raise ValueError(f"No API key configured for provider: {provider_name}")
        _default_client = openai.OpenAI(api_key=api_key, base_url=db_provider.endpoint)
        logger.info("Default LLM client: %s", provider_name)
    return _default_client


def generate(messages: List[Dict], temperature: float = 0.3, max_tokens: int = 2048) -> str:
    client = _get_default_client()
    response = client.chat.completions.create(
        model=_default_model or "gpt-4o-mini",
        messages=messages,
        temperature=temperature,
        max_tokens=max_tokens,
    )
    if not response.choices:
        raise ValueError(f"No choices returned. Response: {response}")
    choice = response.choices[0]
    if choice is None or choice.message is None:
        raise ValueError(f"Empty choice returned. Response: {response}")
    content = choice.message.content
    if content is None:
        raise ValueError(f"No content in response. Finish reason: {choice.finish_reason}")
    return content


def get_llm_provider(user=None, provider_value=None, model=None):
    import openai

    # User selected a specific provider+model
    if provider_value:
        try:
            from apps.accounts.models import UserAPIKey
            user_key = UserAPIKey.objects.filter(user=user, provider__value=provider_value, is_active=True).first()
            if user_key:
                client = openai.OpenAI(api_key=user_key.api_key, base_url=user_key.provider.endpoint)
                return _ProviderStub(client, model or getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini"))
        except Exception:
            pass

    # User has any connected provider
    if user:
        try:
            from apps.accounts.models import UserAPIKey
            user_key = UserAPIKey.objects.filter(user=user, is_active=True).first()
            if user_key:
                client = openai.OpenAI(api_key=user_key.api_key, base_url=user_key.provider.endpoint)
                return _ProviderStub(client, model or getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini"))
        except Exception:
            pass

    # System default
    return _ProviderStub(_get_default_client(), model or getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini"))


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
        if not response.choices:
            raise ValueError(f"No choices returned from {self._model}. Response: {response}")
        choice = response.choices[0]
        if choice is None or choice.message is None:
            raise ValueError(f"Empty choice returned from {self._model}. Response: {response}")
        content = choice.message.content
        if content is None:
            raise ValueError(f"No content in response from {self._model}. Finish reason: {choice.finish_reason}")
        return content
