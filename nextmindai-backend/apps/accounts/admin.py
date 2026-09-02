from django import forms
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import Provider, User, UserAPIKey


class ProviderAdminForm(forms.ModelForm):
    logo = forms.ImageField(required=False)

    class Meta:
        model = Provider
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.instance and self.instance.logo:
            self.fields["logo"].help_text = f"Current: {self.instance.logo}"


@admin.register(Provider)
class ProviderAdmin(admin.ModelAdmin):
    form = ProviderAdminForm
    list_display = ("label", "value", "endpoint", "is_active", "created_at")
    list_filter = ("is_active",)
    search_fields = ("label", "value", "endpoint")
    ordering = ("label",)
    fieldsets = (
        (None, {"fields": ("label", "value", "endpoint", "placeholder", "color", "is_active")}),
        ("Logo", {"fields": ("logo",)}),
    )

    def save_model(self, request, obj, form, change):
        logo_file = form.cleaned_data.get("logo")
        if logo_file:
            import uuid as uuid_pkg
            from django.conf import settings
            from apps.documents.services.storage import get_r2_client

            ext = logo_file.name[logo_file.name.rfind('.'):]
            key = f"provider_logos/{uuid_pkg.uuid4()}{ext}"
            client = get_r2_client()
            client.upload_fileobj(
                logo_file,
                settings.R2_BUCKET_NAME,
                key,
                ExtraArgs={"ContentType": logo_file.content_type},
            )
            obj.logo = key
        super().save_model(request, obj, form, change)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    model = User
    list_display = ("email", "name", "is_active", "is_staff", "created_at")
    list_filter = ("is_active", "is_staff", "created_at")
    search_fields = ("email", "name")
    ordering = ("-created_at",)
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Personal info", {"fields": ("name", "avatar")}),
        ("Permissions", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
    )
    add_fieldsets = (
        (None, {
            "classes": ("wide",),
            "fields": ("email", "name", "password1", "password2", "is_active", "is_staff"),
        }),
    )


@admin.register(UserAPIKey)
class UserAPIKeyAdmin(admin.ModelAdmin):
    list_display = ("user", "provider", "is_active", "created_at")
    list_filter = ("is_active", "provider")
    search_fields = ("user__email", "provider__label")
    ordering = ("-created_at",)