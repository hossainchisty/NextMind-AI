import logging
from typing import List, Dict, Optional
from uuid import UUID

from apps.knowledge.models import DocumentChunk
from apps.knowledge.services.embeddings import get_embedding_provider

logger = logging.getLogger("apps")


def dense_search(
    query: str,
    user_id: UUID,
    collection_id: Optional[UUID] = None,
    top_k: int = 20,
) -> List[Dict]:
    provider = get_embedding_provider()
    query_embedding = provider.embed(query)

    qs = DocumentChunk.objects.filter(
        document__user_id=user_id,
        embedding__isnull=False,
    )
    if collection_id:
        qs = qs.filter(document__collection_id=collection_id)

    chunks = list(qs.select_related("document"))

    scored = []
    for chunk in chunks:
        score = _cosine_similarity(query_embedding, chunk.embedding)
        scored.append({
            "chunk_id": str(chunk.id),
            "content": chunk.content,
            "dense_score": score,
            "document": {
                "id": str(chunk.document.id),
                "name": chunk.document.name,
            },
            "page_number": chunk.page_number,
            "section_title": chunk.section_title,
            "chunk_index": chunk.chunk_index,
        })

    scored.sort(key=lambda x: x["dense_score"], reverse=True)
    return scored[:top_k]


def _cosine_similarity(a: List[float], b: List[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    norm_a = sum(x * x for x in a) ** 0.5
    norm_b = sum(x * x for x in b) ** 0.5
    if norm_a == 0 or norm_b == 0:
        return 0.0
    return dot / (norm_a * norm_b)
