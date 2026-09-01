from rest_framework import serializers

from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = [
            "id", "name", "original_filename", "file_type", "file_size",
            "status", "error_message", "page_count", "collection",
            "created_at", "updated_at",
        ]
        read_only_fields = [
            "id", "original_filename", "file_type", "file_size",
            "status", "error_message", "page_count", "created_at", "updated_at",
        ]


class DocumentUploadSerializer(serializers.ModelSerializer):
    file = serializers.FileField()

    class Meta:
        model = Document
        fields = ["id", "file", "name", "collection", "created_at"]
        read_only_fields = ["id", "created_at"]

    def validate_file(self, value):
        from django.conf import settings
        from apps.core.constants import ALLOWED_DOCUMENT_TYPES

        if value.content_type not in ALLOWED_DOCUMENT_TYPES:
            raise serializers.ValidationError(
                f"Unsupported file type. Allowed: {', '.join(ALLOWED_DOCUMENT_TYPES.values())}"
            )
        if value.size > settings.MAX_UPLOAD_SIZE:
            max_mb = settings.MAX_UPLOAD_SIZE // (1024 * 1024)
            raise serializers.ValidationError(f"File too large. Maximum size: {max_mb}MB")
        return value

    def create(self, validated_data):
        file = validated_data["file"]
        validated_data["original_filename"] = file.name
        validated_data["file_size"] = file.size
        from apps.core.constants import ALLOWED_DOCUMENT_TYPES
        validated_data["file_type"] = ALLOWED_DOCUMENT_TYPES.get(file.content_type, "txt")
        if not validated_data.get("name"):
            validated_data["name"] = file.name
        return super().create(validated_data)
