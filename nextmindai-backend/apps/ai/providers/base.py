from abc import ABC, abstractmethod
from typing import List, Dict, Optional


class BaseLLMProvider(ABC):
    @abstractmethod
    def generate(
        self,
        messages: List[Dict],
        context: Optional[str] = None,
        temperature: float = 0.3,
        max_tokens: int = 2048,
    ) -> str:
        raise NotImplementedError
