from django.contrib import admin

from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ("name", "user", "file_type", "status", "page_count", "created_at")
    list_filter = ("status", "file_type", "created_at")
    search_fields = ("name", "original_filename", "user__email")
    raw_id_fields = ("user", "collection")
    readonly_fields = ("file_size", "page_count", "error_message")
