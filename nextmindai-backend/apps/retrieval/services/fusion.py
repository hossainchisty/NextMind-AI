import logging
from typing import List, Dict
from django.conf import settings

logger = logging.getLogger("apps")


def reciprocal_rank_fusion(
    dense_results: List[Dict],
    bm25_results: List[Dict],
    k: int = None,
) -> List[Dict]:
    if k is None:
        k = getattr(settings, "RRF_K", 60)

    chunk_scores: Dict[str, Dict] = {}

    for rank, result in enumerate(dense_results):
        cid = result["chunk_id"]
        if cid not in chunk_scores:
            chunk_scores[cid] = _init_result(result)
        chunk_scores[cid]["dense_rank"] = rank + 1
        chunk_scores[cid]["rrf_score"] += 1.0 / (k + rank + 1)

    for rank, result in enumerate(bm25_results):
        cid = result["chunk_id"]
        if cid not in chunk_scores:
            chunk_scores[cid] = _init_result(result)
        chunk_scores[cid]["bm25_rank"] = rank + 1
        chunk_scores[cid]["rrf_score"] += 1.0 / (k + rank + 1)

    results = list(chunk_scores.values())
    results.sort(key=lambda x: x["rrf_score"], reverse=True)
    return results


def _init_result(result: Dict) -> Dict:
    return {
        "chunk_id": result["chunk_id"],
        "content": result["content"],
        "document": result["document"],
        "page_number": result["page_number"],
        "section_title": result["section_title"],
        "chunk_index": result["chunk_index"],
        "dense_score": result.get("dense_score", 0),
        "bm25_score": result.get("bm25_score", 0),
        "dense_rank": 0,
        "bm25_rank": 0,
        "rrf_score": 0.0,
    }
