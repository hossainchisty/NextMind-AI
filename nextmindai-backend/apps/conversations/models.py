from django.conf import settings
from django.db import models

from apps.core.constants import MESSAGE_ROLE_CHOICES
from apps.core.models import TimeStampedModel, UUIDModel


class Conversation(UUIDModel, TimeStampedModel):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="conversations",
    )
    title = models.CharField(max_length=255, blank=True, default="New Conversation")
    collection = models.ForeignKey(
        "knowledge.Collection",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="conversations",
    )

    class Meta:
        ordering = ["-updated_at"]

    def __str__(self):
        return self.title


class Message(UUIDModel):
    conversation = models.ForeignKey(
        Conversation,
        on_delete=models.CASCADE,
        related_name="messages",
    )
    role = models.CharField(max_length=20, choices=MESSAGE_ROLE_CHOICES)
    content = models.TextField()
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"{self.role}: {self.content[:50]}"
