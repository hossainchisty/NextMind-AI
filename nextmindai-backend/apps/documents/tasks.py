import logging

from celery import shared_task
from django.utils import timezone

logger = logging.getLogger("apps")


@shared_task(bind=True, max_retries=3)
def process_document_task(self, document_id: str):
    from apps.documents.models import Document

    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        logger.error("Document not found: %s", document_id)
        return

    doc.status = "processing"
    doc.save(update_fields=["status"])
    logger.info("Processing document: %s", doc.id)

    try:
        from apps.documents.services.parsing import parse_document
        from apps.documents.services.chunking import chunk_text
        from apps.knowledge.services.embeddings import get_embedding_provider
        from apps.knowledge.services.indexing import store_embeddings

        pages = parse_document(doc)
        doc.page_count = len(pages)
        doc.save(update_fields=["page_count"])

        chunks = chunk_text(pages, doc)
        logger.info("Document %s: %d chunks created", doc.id, len(chunks))

        provider = get_embedding_provider()
        texts = [c["content"] for c in chunks]
        embeddings = provider.embed_batch(texts)

        store_embeddings(doc, chunks, embeddings)

        doc.status = "completed"
        doc.save(update_fields=["status", "page_count"])
        logger.info("Document processing completed: %s", doc.id)

    except Exception as e:
        doc.status = "failed"
        doc.error_message = str(e)
        doc.save(update_fields=["status", "error_message"])
        logger.error("Document processing failed: %s — %s", doc.id, e)
        raise self.retry(exc=e, countdown=60)


@shared_task
def delete_document_task(document_id: str):
    from apps.documents.models import Document

    try:
        doc = Document.objects.get(id=document_id)
    except Document.DoesNotExist:
        logger.error("Document not found for deletion: %s", document_id)
        return

    if doc.file_key:
        try:
            from apps.documents.services.storage import delete_from_r2
            delete_from_r2(doc.file_key)
        except Exception as e:
            logger.error("Failed to delete R2 file %s: %s", doc.file_key, e)

    from apps.knowledge.models import DocumentChunk
    deleted_count, _ = DocumentChunk.objects.filter(document=doc).delete()
    logger.info("Deleted %d chunks for document %s", deleted_count, doc.id)

    doc.delete()
    logger.info("Deleted document: %s", document_id)
