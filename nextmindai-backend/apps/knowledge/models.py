from django.conf import settings
from django.db import models

from apps.core.models import TimeStampedModel, UUIDModel


class Collection(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="collections",
    )
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, default="")

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name


class DocumentChunk(UUIDModel):
    document = models.ForeignKey(
        "documents.Document",
        on_delete=models.CASCADE,
        related_name="chunks",
    )
    content = models.TextField()
    contextual_prefix = models.TextField(blank=True, default="")
    embedding = models.JSONField(null=True, blank=True)
    chunk_index = models.IntegerField(default=0)
    page_number = models.IntegerField(default=1)
    section_title = models.CharField(max_length=500, blank=True, default="")
    token_count = models.IntegerField(default=0)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["document", "chunk_index"]
        indexes = [
            models.Index(fields=["document", "chunk_index"]),
            models.Index(fields=["page_number"]),
        ]

    def __str__(self):
        return f"Chunk {self.chunk_index} of {self.document.name}"
