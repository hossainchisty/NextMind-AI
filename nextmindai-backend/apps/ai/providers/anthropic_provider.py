import logging
import os
from typing import List, Dict, Optional

from .base import BaseLLMProvider

logger = logging.getLogger("apps")


class AnthropicProvider(BaseLLMProvider):
    def __init__(self):
        import anthropic
        api_key = os.environ.get("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("ANTHROPIC_API_KEY not set")
        self.client = anthropic.Anthropic(api_key=api_key)

    def generate(
        self,
        messages: List[Dict],
        context: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        import django.conf as conf
        model = getattr(conf.settings, "LLM_MODEL", "claude-3-haiku-20240307")

        system_msg = ""
        user_messages = []
        for msg in messages:
            if msg["role"] == "system":
                system_msg = msg["content"]
            else:
                user_messages.append(msg)

        response = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            temperature=temperature,
            system=system_msg,
            messages=user_messages,
        )
        return response.content[0].text
