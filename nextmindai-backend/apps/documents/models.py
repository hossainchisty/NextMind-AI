from django.conf import settings
from django.db import models

from apps.core.constants import DOCUMENT_STATUS_CHOICES, DOCUMENT_TYPE_CHOICES
from apps.core.models import TimeStampedModel, UUIDModel


class Document(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="documents",
    )
    collection = models.ForeignKey(
        "knowledge.Collection",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="documents",
    )
    name = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=500)
    file_key = models.CharField(max_length=1000, blank=True, default="")
    file_type = models.CharField(max_length=10, choices=DOCUMENT_TYPE_CHOICES)
    file_size = models.BigIntegerField(default=0)
    status = models.CharField(
        max_length=20,
        choices=DOCUMENT_STATUS_CHOICES,
        default="pending",
    )
    error_message = models.TextField(blank=True, default="")
    page_count = models.IntegerField(default=0)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

    @property
    def file_url(self):
        if not self.file_key:
            return None
        from apps.documents.services.storage import get_signed_url
        return get_signed_url(self.file_key)
