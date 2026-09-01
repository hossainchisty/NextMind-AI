import logging
import os
from typing import List, Dict, Optional

from .base import BaseLLMProvider

logger = logging.getLogger("apps")


class OpenAIProvider(BaseLLMProvider):
    def __init__(self):
        import openai
        api_key = os.environ.get("OPENAI_API_KEY", "omniroute")
        base_url = os.environ.get("LLM_BASE_URL")
        kwargs = {"api_key": api_key}
        if base_url:
            kwargs["base_url"] = base_url
        self.client = openai.OpenAI(**kwargs)

    def generate(
        self,
        messages: List[Dict],
        context: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        import django.conf as conf
        model = getattr(conf.settings, "LLM_MODEL", "gpt-4o-mini")

        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
