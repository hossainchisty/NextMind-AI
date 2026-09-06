import logging

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from apps.core.constants import MAX_UPLOAD_BATCH_SIZE
from apps.core.utils import error_response, success_response

from .models import Document
from .serializers import DocumentFileSerializer, DocumentSerializer, DocumentUploadSerializer

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
        search = self.request.query_params.get("search")
        if search:
            qs = qs.filter(name__icontains=search)
        return qs

    def perform_create(self, serializer):
        doc = serializer.save(user=self.request.user)
        from apps.documents.tasks import process_document_task
        process_document_task.delay(str(doc.id))
        logger.info("Document uploaded: %s, queued for processing", doc.id)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(success_response(data=serializer.data))

    def create(self, request, *args, **kwargs):
        batch_files = request.FILES.getlist("files")
        if batch_files:
            return self.create_batch(request, batch_files)

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        doc = serializer.instance
        return Response(
            success_response(
                data=DocumentSerializer(doc).data,
                message="Document uploaded",
            ),
            status=status.HTTP_201_CREATED,
        )

    def create_batch(self, request, batch_files):
        max_batch = getattr(settings, "MAX_UPLOAD_BATCH_SIZE", MAX_UPLOAD_BATCH_SIZE)
        if len(batch_files) > max_batch:
            return Response(
                error_response(
                    message=f"Too many files. Maximum batch size: {max_batch} files per upload."
                ),
                status=status.HTTP_400_BAD_REQUEST,
            )

        collection_id = request.data.get("collection") or None
        single_name = request.data.get("name") if len(batch_files) == 1 else None
        uploaded = []
        errors = []
        for uploaded_file in batch_files:
            doc, error = self._create_one(request, uploaded_file, collection_id, single_name)
            if doc is not None:
                uploaded.append(doc)
            else:
                errors.append(error)

        if not uploaded:
            return Response(
                error_response(message="All uploads failed.", errors={"files": errors}),
                status=status.HTTP_400_BAD_REQUEST,
            )

        message = f"Uploaded {len(uploaded)} of {len(batch_files)} documents."
        return Response(
            success_response(
                data={
                    "documents": DocumentSerializer(uploaded, many=True).data,
                    "errors": errors,
                },
                message=message,
            ),
            status=status.HTTP_201_CREATED,
        )

    def _create_one(self, request, uploaded_file, collection_id, single_name=None):
        data = {"file": uploaded_file, "name": single_name or uploaded_file.name}
        if collection_id:
            data["collection"] = collection_id
        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            return None, {
                "filename": uploaded_file.name,
                "error": self._first_error(serializer.errors),
            }
        try:
            self.perform_create(serializer)
        except Exception as exc:
            logger.error("Batch upload failed for %s: %s", uploaded_file.name, exc)
            instance = serializer.instance
            if instance is not None and instance.pk:
                instance.delete()
            return None, {"filename": uploaded_file.name, "error": "Upload failed. Please try again."}
        return serializer.instance, None

    def _first_error(self, errors):
        if isinstance(errors, dict):
            for value in errors.values():
                first = self._first_error(value)
                if first:
                    return first
            return "Invalid file."
        if isinstance(errors, list) and errors:
            first = errors[0]
            return str(getattr(first, "message", first))
        return str(errors) if errors else "Invalid file."


class DocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = DocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(success_response(data=serializer.data))

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.FILES.get("file") is not None:
            return self.replace_file(request, instance)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(success_response(data=serializer.data))

    def replace_file(self, request, instance):
        from apps.documents.services.storage import build_r2_key, delete_from_r2, upload_to_r2
        from apps.knowledge.models import DocumentChunk
        from apps.core.constants import infer_file_type

        new_file = request.FILES.get("file")
        validator = DocumentFileSerializer(data={"file": new_file})
        validator.is_valid(raise_exception=True)

        from .serializers import validate_storage_quota
        validate_storage_quota(
            request.user, new_file.size, exclude_bytes=instance.file_size or 0
        )

        content_type = getattr(new_file, "content_type", "") or "application/octet-stream"
        file_type = infer_file_type(new_file.name, content_type) or "txt"
        old_key = instance.file_key
        new_key = build_r2_key(str(request.user.id), new_file.name)
        upload_to_r2(new_file, new_key, content_type=content_type)

        if instance.name == instance.original_filename:
            instance.name = new_file.name
        requested_name = request.data.get("name")
        if requested_name:
            instance.name = requested_name
        instance.original_filename = new_file.name
        instance.file_key = new_key
        instance.file_type = file_type
        instance.file_size = new_file.size
        instance.status = "pending"
        instance.error_message = ""
        instance.page_count = 0
        instance.save()

        DocumentChunk.objects.filter(document=instance).delete()

        from apps.documents.tasks import process_document_task
        process_document_task.delay(str(instance.id))
        logger.info("Document re-uploaded: %s, queued for processing", instance.id)

        if old_key and old_key != new_key:
            try:
                delete_from_r2(old_key)
            except Exception as exc:
                logger.error("Failed to delete replaced R2 file %s: %s", old_key, exc)

        return Response(
            success_response(
                data=DocumentSerializer(instance).data,
                message="Document re-uploaded. The updated file will be reprocessed.",
            )
        )

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        from apps.documents.tasks import delete_document_task
        delete_document_task.delay(str(instance.id))
        return Response(status=status.HTTP_204_NO_CONTENT)
