import uuid

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
    avatar_url = serializers.SerializerMethodField()
    has_usable_password = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "email", "name", "avatar", "avatar_url", "has_usable_password", "created_at", "updated_at"]
        read_only_fields = ["id", "email", "avatar_url", "has_usable_password", "created_at", "updated_at"]

    def get_avatar_url(self, obj):
        return obj.avatar_url()

    def get_has_usable_password(self, obj):
        return obj.has_usable_password()

    def update(self, instance, validated_data):
        avatar_file = self.context["request"].FILES.get("avatar")
        if avatar_file:
            import uuid as uuid_pkg
            from apps.documents.services.storage import upload_to_r2, delete_from_r2

            if instance.avatar and not instance.avatar.startswith("https://"):
                try:
                    delete_from_r2(instance.avatar)
                except Exception:
                    pass

            ext = avatar_file.name[avatar_file.name.rfind("."):]
            key = f"avatars/{instance.id}/{uuid_pkg.uuid4()}{ext}"
            upload_to_r2(avatar_file, key, avatar_file.content_type)
            validated_data["avatar"] = key

        return super().update(instance, validated_data)


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class PasswordChangeSerializer(serializers.Serializer):
    current_password = serializers.CharField(write_only=True, required=False, allow_blank=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        from django.contrib.auth import authenticate
        from django.contrib.auth.password_validation import validate_password

        request = self.context.get("request")
        user = request.user if request else None
        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("Authentication required.")

        if attrs["new_password"] != attrs["new_password_confirm"]:
            raise serializers.ValidationError(
                {"new_password_confirm": "New passwords do not match."}
            )
        validate_password(attrs["new_password"], user)

        if user.has_usable_password():
            current = attrs.get("current_password", "")
            if not current or authenticate(email=user.email, password=current) is None:
                raise serializers.ValidationError(
                    {"current_password": "Current password is incorrect."}
                )
        return attrs


class ProviderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Provider
        fields = ["id", "value", "label", "endpoint", "placeholder", "logo", "logo_url", "color"]

    def get_logo_url(self, obj):
        return obj.logo_url()


class UserAPIKeySerializer(serializers.ModelSerializer):
    api_key_masked = serializers.SerializerMethodField()
    provider_detail = ProviderSerializer(source="provider", read_only=True)
    provider = serializers.CharField(write_only=True)

    class Meta:
        model = UserAPIKey
        fields = ["id", "provider", "provider_detail", "api_key", "api_key_masked", "is_active", "created_at"]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {"api_key": {"write_only": True}}

    def validate_provider(self, value):
        try:
            Provider.objects.get(value=value)
        except Provider.DoesNotExist:
            raise serializers.ValidationError(f"Provider '{value}' does not exist.")
        return value

    def create(self, validated_data):
        from apps.accounts.services.vault import encrypt_api_key

        provider_value = validated_data.pop("provider")
        provider = Provider.objects.get(value=provider_value)
        validated_data["provider"] = provider
        validated_data["id"] = uuid.uuid4()
        validated_data["api_key"] = encrypt_api_key(validated_data["api_key"])
        return super().create(validated_data)

    def get_api_key_masked(self, obj):
        try:
            plaintext = obj.get_api_key()
        except ValueError:
            return "****"
        if len(plaintext) > 8:
            return plaintext[:4] + "****" + plaintext[-4:]
        return "****"
