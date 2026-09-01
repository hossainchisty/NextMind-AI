import logging
import time
from typing import List, Dict, Optional
from uuid import UUID

from apps.retrieval.services.dense import dense_search
from apps.retrieval.services.bm25 import bm25_search
from apps.retrieval.services.fusion import reciprocal_rank_fusion

logger = logging.getLogger("apps")


def hybrid_search(
    query: str,
    user_id: UUID,
    collection_id: Optional[UUID] = None,
    top_k: int = 20,
) -> List[Dict]:
    start = time.time()

    dense_results = dense_search(query, user_id, collection_id, top_k=top_k)
    dense_time = time.time() - start

    bm25_start = time.time()
    bm25_results = bm25_search(query, user_id, collection_id, top_k=top_k)
    bm25_time = time.time() - bm25_start

    fused = reciprocal_rank_fusion(dense_results, bm25_results)

    total_time = time.time() - start
    logger.info(
        "Hybrid search: dense=%.3fs, bm25=%.3fs, total=%.3fs, results=%d",
        dense_time, bm25_time, total_time, len(fused),
    )

    return fused[:top_k]
