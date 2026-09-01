from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

from apps.conversations.views import ChatView

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/auth/", include("apps.accounts.urls")),
    path("api/v1/collections/", include("apps.knowledge.urls")),
    path("api/v1/documents/", include("apps.documents.urls")),
    path("api/v1/conversations/", include("apps.conversations.urls")),
    path("api/v1/chat/", ChatView.as_view(), name="chat"),
    path("api/v1/retrieval/", include("apps.retrieval.urls")),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
