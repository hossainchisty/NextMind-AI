from django.urls import path

from . import views

urlpatterns = [
    path("", views.CollectionListCreateView.as_view(), name="collection-list-create"),
    path("<uuid:id>/", views.CollectionDetailView.as_view(), name="collection-detail"),
]
