import logging
from typing import List, Dict, Optional

from .base import BaseLLMProvider

logger = logging.getLogger("apps")


class LocalProvider(BaseLLMProvider):
    def generate(
        self,
        messages: List[Dict],
        context: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        return "Local LLM provider not configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY."
