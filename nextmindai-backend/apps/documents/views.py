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

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(success_response(data=serializer.data))

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            success_response(data=serializer.data, message="Document uploaded"),
            status=status.HTTP_201_CREATED,
        )


class DocumentDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(success_response(data=serializer.data))

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        from apps.documents.tasks import delete_document_task
        delete_document_task.delay(str(instance.id))
        return Response(status=status.HTTP_204_NO_CONTENT)
