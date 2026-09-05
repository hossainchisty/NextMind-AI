from rest_framework import serializers

from apps.core.constants import SUPPORTED_UPLOAD_TYPES_LABEL, infer_file_type

from .models import Document


def validate_uploaded_file(value):
    from django.conf import settings

    filename = getattr(value, "name", "") or ""
    content_type = getattr(value, "content_type", "") or ""
    if infer_file_type(filename, content_type) is None:
        raise serializers.ValidationError(
            f"Unsupported file type. Supported file types: {SUPPORTED_UPLOAD_TYPES_LABEL}."
        )
    if value.size > settings.MAX_UPLOAD_SIZE:
        max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
        raise serializers.ValidationError(f"File too large. Maximum file size: {max_mb}MB per file.")
    return value


class DocumentSerializer(serializers.ModelSerializer):
    file_url = serializers.SerializerMethodField()

    class Meta:
        model = Document
        fields = [
            "id", "name", "original_filename", "file_key", "file_type",
            "file_size", "status", "error_message", "page_count",
            "collection", "file_url", "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "original_filename", "file_key", "file_type", "file_size",
            "status", "error_message", "page_count", "file_url",
            "created_at", "updated_at",
        ]

    def get_file_url(self, obj):
        return obj.file_url


class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = Document
        fields = ["id", "file", "name", "collection", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_file(self, value):
        return validate_uploaded_file(value)

    def validate_collection(self, value):
        request = self.context.get("request") if hasattr(self, "context") else None
        if value is not None and request is not None and value.user_id != request.user.id:
            raise serializers.ValidationError("Collection not found.")
        return value

    def create(self, validated_data):
        from apps.documents.services.storage import upload_to_r2, build_r2_key

        file = validated_data.pop("file")
        user = self.context["request"].user
        content_type = getattr(file, "content_type", "") or "application/octet-stream"

        validated_data["original_filename"] = file.name
        validated_data["file_size"] = file.size
        inferred = infer_file_type(file.name, content_type)
        validated_data["file_type"] = inferred or "txt"
        if not validated_data.get("name"):
            validated_data["name"] = file.name

        doc = Document(**validated_data)
        doc.save()

        file_key = build_r2_key(str(user.id), file.name)
        upload_to_r2(file, file_key, content_type=content_type)
        doc.file_key = file_key
        doc.save(update_fields=["file_key"])

        return doc


class DocumentFileSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        return validate_uploaded_file(value)
