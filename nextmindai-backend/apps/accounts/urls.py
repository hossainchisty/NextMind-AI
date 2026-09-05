from django.urls import path

from . import views

urlpatterns = [
    path("register/", views.RegisterView.as_view(), name="register"),
    path("login/", views.LoginView.as_view(), name="login"),
    path("token/refresh/", views.TokenRefreshView.as_view(), name="token_refresh"),
    path("me/", views.MeView.as_view(), name="me"),
    path("me/export/", views.ExportView.as_view(), name="export"),
    path("providers/", views.ProviderListView.as_view(), name="provider_list"),
    path("models/", views.UserModelsView.as_view(), name="user_models"),
    path("api-keys/", views.UserAPIKeyListCreateView.as_view(), name="api_keys"),
    path("api-keys/<uuid:id>/", views.UserAPIKeyDetailView.as_view(), name="api_key_detail"),
    path("api-keys/test/", views.APIKeyTestView.as_view(), name="api_key_test"),
]
