import logging

from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.core.utils import success_response

from .models import Document
from .serializers import DocumentSerializer, DocumentUploadSerializer

logger = logging.getLogger("apps")


class DocumentListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DocumentUploadSerializer
        return DocumentSerializer

    def get_queryset(self):
        qs = Document.objects.filter(user=self.request.user)
        collection_id = self.request.query_params.get("collection")
        if collection_id:
            qs = qs.filter(collection_id=collection_id)
        return qs

    def perform_create(self, serializer):
        doc = serializer.save(user=self.request.user)
        from apps.documents.tasks import process_document_task
        process_document_task.delay(str(doc.id))
        logger.info("Document uploaded: %s, queued for processing", doc.id)


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
