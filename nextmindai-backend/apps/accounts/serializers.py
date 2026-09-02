from django.contrib.auth import get_user_model
from rest_framework import serializers

from .models import Provider, UserAPIKey

User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password_confirm = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ["email", "name", "password", "password_confirm"]

    def validate(self, attrs):
        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop("password_confirm")
        return User.objects.create_user(**validated_data)


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar", "created_at", "updated_at"]
        read_only_fields = ["id", "email", "created_at", "updated_at"]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class ProviderSerializer(serializers.ModelSerializer):
    logo_url = serializers.SerializerMethodField()

    class Meta:
        model = Provider
        fields = ["id", "value", "label", "endpoint", "placeholder", "logo", "logo_url", "color"]

    def get_logo_url(self, obj):
        if obj.logo:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.logo.url)
            return obj.logo.url
        return ""


class UserAPIKeySerializer(serializers.ModelSerializer):
    api_key_masked = serializers.SerializerMethodField()
    provider_detail = ProviderSerializer(source="provider", read_only=True)

    class Meta:
        model = UserAPIKey
        fields = ["id", "provider", "provider_detail", "label", "api_key", "api_key_masked", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]

    def get_api_key_masked(self, obj):
        if len(obj.api_key) > 8:
            return obj.api_key[:4] + "****" + obj.api_key[-4:]
        return "****"
