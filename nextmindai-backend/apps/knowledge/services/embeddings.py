import logging
from abc import ABC, abstractmethod
from typing import List

logger = logging.getLogger("apps")


class BaseEmbeddingProvider(ABC):
    @abstractmethod
    def embed(self, text: str) -> List[float]:
        raise NotImplementedError

    @abstractmethod
    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        raise NotImplementedError


_provider = None


def get_embedding_provider() -> BaseEmbeddingProvider:
    global _provider
    if _provider is None:
        from django.conf import settings
        _provider = SentenceTransformerEmbeddingProvider(
            model_name=settings.EMBEDDING_MODEL,
            dimensions=settings.EMBEDDING_DIMENSIONS,
        )
    return _provider


class SentenceTransformerEmbeddingProvider(BaseEmbeddingProvider):
    def __init__(self, model_name: str = "BAAI/bge-base-en-v1.5", dimensions: int = 768):
        import os
        os.environ.setdefault("PYTORCH_MPS_HIGH_WATERMARK_RATIO", "0.0")
        from sentence_transformers import SentenceTransformer
        import torch
        logger.info("Loading embedding model: %s", model_name)
        device = "cpu"
        self.model = SentenceTransformer(model_name, device=device)
        self.dimensions = dimensions
        logger.info("Embedding model loaded: %s (dim=%d)", model_name, dimensions)

    def embed(self, text: str) -> List[float]:
        embedding = self.model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def embed_batch(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, normalize_embeddings=True, batch_size=32, show_progress_bar=False)
        return embeddings.tolist()
