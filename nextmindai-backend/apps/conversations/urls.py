from django.urls import path

from . import views

urlpatterns = [
    path("", views.ConversationListCreateView.as_view(), name="conversation-list-create"),
    path("<uuid:id>/", views.ConversationDetailView.as_view(), name="conversation-detail"),
    path("<uuid:id>/messages/", views.MessageListView.as_view(), name="message-list"),
]
