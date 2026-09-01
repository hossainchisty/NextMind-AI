import logging
from typing import List, Dict

from apps.knowledge.models import DocumentChunk

logger = logging.getLogger("apps")


def store_embeddings(document, chunks: List[Dict], embeddings: List[List[float]]):
    objects = []
    for chunk_data, embedding in zip(chunks, embeddings):
        objects.append(DocumentChunk(
            document=document,
            content=chunk_data["content"],
            embedding=embedding,
            chunk_index=chunk_data["chunk_index"],
            page_number=chunk_data["page_number"],
            section_title=chunk_data.get("section_title", ""),
            token_count=chunk_data.get("token_count", 0),
        ))
    DocumentChunk.objects.bulk_create(objects, batch_size=100)
    logger.info("Stored %d chunks for document %s", len(objects), document.id)
