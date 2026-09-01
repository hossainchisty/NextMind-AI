from rest_framework import serializers

from .models import Collection


class CollectionSerializer(serializers.ModelSerializer):
    document_count = serializers.SerializerMethodField()

    class Meta:
        model = Collection
        fields = ["id", "name", "description", "document_count", "created_at", "updated_at"]
        read_only_fields = ["id", "created_at", "updated_at"]

    def get_document_count(self, obj):
        return obj.documents.count()


class CollectionDetailSerializer(CollectionSerializer):
    documents = serializers.SerializerMethodField()

    class Meta(CollectionSerializer.Meta):
        fields = CollectionSerializer.Meta.fields + ["documents"]

    def get_documents(self, obj):
        from apps.documents.serializers import DocumentSerializer
        return DocumentSerializer(obj.documents.all(), many=True).data
