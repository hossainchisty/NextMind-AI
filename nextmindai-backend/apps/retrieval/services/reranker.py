import logging
import time
from typing import List, Dict
from abc import ABC, abstractmethod

logger = logging.getLogger("apps")


class BaseReranker(ABC):
    @abstractmethod
    def rerank(self, query: str, documents: List[Dict], top_k: int = 5) -> List[Dict]:
        raise NotImplementedError


_reranker = None


def get_reranker() -> BaseReranker:
    global _reranker
    if _reranker is None:
        from django.conf import settings
        _reranker = CrossEncoderReranker(model_name=settings.RERANKER_MODEL)
    return _reranker


class CrossEncoderReranker(BaseReranker):
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        from sentence_transformers import CrossEncoder
        logger.info("Loading reranker model: %s", model_name)
        self.model = CrossEncoder(model_name, device="cpu")
        logger.info("Reranker model loaded: %s", model_name)

    def rerank(self, query: str, documents: List[Dict], top_k: int = 5) -> List[Dict]:
        if not documents:
            return []

        start = time.time()
        pairs = [(query, doc["content"]) for doc in documents]
        scores = self.model.predict(pairs)

        for doc, score in zip(documents, scores):
            doc["rerank_score"] = float(score)

        documents.sort(key=lambda x: x["rerank_score"], reverse=True)
        result = documents[:top_k]

        elapsed = time.time() - start
        logger.info("Reranking: %d docs -> %d in %.3fs", len(documents), len(result), elapsed)
        return result
