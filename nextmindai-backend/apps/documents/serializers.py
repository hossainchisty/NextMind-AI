from rest_framework import serializers

from .models import Document


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
        from apps.core.constants import ALLOWED_DOCUMENT_TYPES
        from apps.documents.services.storage import upload_to_r2, build_r2_key

        file = validated_data["file"]
        user = self.context["request"].user

        validated_data["original_filename"] = file.name
        validated_data["file_size"] = file.size
        validated_data["file_type"] = ALLOWED_DOCUMENT_TYPES.get(file.content_type, "txt")
        if not validated_data.get("name"):
            validated_data["name"] = file.name

        doc = Document(**validated_data)
        doc.save()

        file_key = build_r2_key(str(user.id), file.name)
        upload_to_r2(file, file_key, content_type=file.content_type)
        doc.file_key = file_key
        doc.save(update_fields=["file_key"])

        return doc
