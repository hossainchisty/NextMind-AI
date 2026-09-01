import logging
import pickle
from typing import List, Dict, Optional
from uuid import UUID

from rank_bm25 import BM25Okapi

from apps.knowledge.models import DocumentChunk

logger = logging.getLogger("apps")


def bm25_search(
    query: str,
    user_id: UUID,
    collection_id: Optional[UUID] = None,
    top_k: int = 20,
) -> List[Dict]:
    qs = DocumentChunk.objects.filter(
        document__user_id=user_id,
    )
    if collection_id:
        qs = qs.filter(document__collection_id=collection_id)

    chunks = list(qs.select_related("document"))
    if not chunks:
        return []

    corpus = [_tokenize(c.content) for c in chunks]
    bm25 = BM25Okapi(corpus)

    query_tokens = _tokenize(query)
    scores = bm25.get_scores(query_tokens)

    scored = []
    for chunk, score in zip(chunks, scores):
        scored.append({
            "chunk_id": str(chunk.id),
            "content": chunk.content,
            "bm25_score": float(score),
            "document": {
                "id": str(chunk.document.id),
                "name": chunk.document.name,
            },
            "page_number": chunk.page_number,
            "section_title": chunk.section_title,
            "chunk_index": chunk.chunk_index,
        })

    scored.sort(key=lambda x: x["bm25_score"], reverse=True)
    return scored[:top_k]


def _tokenize(text: str) -> List[str]:
    import re
    return re.findall(r"\w+", text.lower())
