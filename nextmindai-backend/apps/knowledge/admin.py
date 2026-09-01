from django.contrib import admin

from .models import Collection, DocumentChunk


@admin.register(Collection)
class CollectionAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "created_at")
    list_filter = ("created_at",)
    search_fields = ("name", "user__email")
    raw_id_fields = ("user",)


@admin.register(DocumentChunk)
class DocumentChunkAdmin(admin.ModelAdmin):
    list_display = ("document", "chunk_index", "page_number", "token_count")
    list_filter = ("page_number",)
    search_fields = ("content", "document__name")
    raw_id_fields = ("document",)
