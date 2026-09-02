from django.db import IntegrityError
from django.contrib.auth import authenticate, get_user_model
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from apps.core.utils import error_response, success_response

from .models import Provider, UserAPIKey
from .serializers import LoginSerializer, ProviderSerializer, RegisterSerializer, UserAPIKeySerializer, UserSerializer

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            success_response(
                data={
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                message="Registration successful",
            ),
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(
            email=serializer.validated_data["email"],
            password=serializer.validated_data["password"],
        )
        if user is None:
            return Response(
                error_response("Invalid credentials"),
                status=status.HTTP_401_UNAUTHORIZED,
            )
        refresh = RefreshToken.for_user(user)
        return Response(
            success_response(
                data={
                    "user": UserSerializer(user).data,
                    "tokens": {
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    },
                },
                message="Login successful",
            )
        )


class TokenRefreshView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response(
                error_response("Refresh token is required"),
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            refresh = RefreshToken(refresh_token)
            return Response(
                success_response(
                    data={
                        "access": str(refresh.access_token),
                        "refresh": str(refresh),
                    }
                )
            )
        except Exception:
            return Response(
                error_response("Invalid refresh token"),
                status=status.HTTP_401_UNAUTHORIZED,
            )


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(success_response(data=serializer.data))


class UserAPIKeyListCreateView(generics.ListCreateAPIView):
    serializer_class = UserAPIKeySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserAPIKey.objects.filter(user=self.request.user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            self.perform_create(serializer)
        except IntegrityError:
            return Response(
                error_response("API key already exists for this provider"),
                status=status.HTTP_409_CONFLICT,
            )
        return Response(
            success_response(data=serializer.data, message="API key added"),
            status=status.HTTP_201_CREATED,
        )

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(success_response(data=serializer.data))


class UserAPIKeyDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = UserAPIKeySerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = "id"

    def get_queryset(self):
        return UserAPIKey.objects.filter(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProviderListView(generics.ListAPIView):
    serializer_class = ProviderSerializer
    permission_classes = [permissions.AllowAny]
    queryset = Provider.objects.filter(is_active=True)


PROVIDER_MODELS = {
    "openai": [
        {"id": "gpt-4o", "name": "GPT-4o"},
        {"id": "gpt-4o-mini", "name": "GPT-4o Mini"},
        {"id": "gpt-4-turbo", "name": "GPT-4 Turbo"},
        {"id": "o1-preview", "name": "o1 Preview"},
        {"id": "o1-mini", "name": "o1 Mini"},
    ],
    "anthropic": [
        {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4"},
        {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku"},
        {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus"},
    ],
    "gemini": [
        {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash"},
        {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro"},
        {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash"},
    ],
    "deepseek": [
        {"id": "deepseek-chat", "name": "DeepSeek Chat"},
        {"id": "deepseek-reasoner", "name": "DeepSeek Reasoner"},
    ],
    "groq": [
        {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B"},
        {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B"},
        {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B"},
        {"id": "gemma2-9b-it", "name": "Gemma 2 9B"},
    ],
    "mistral": [
        {"id": "mistral-large-latest", "name": "Mistral Large"},
        {"id": "mistral-medium-latest", "name": "Mistral Medium"},
        {"id": "mistral-small-latest", "name": "Mistral Small"},
    ],
    "together": [
        {"id": "meta-llama/Llama-3.3-70B-Instruct-Turbo", "name": "Llama 3.3 70B Turbo"},
        {"id": "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", "name": "Llama 3.1 405B"},
        {"id": "Qwen/Qwen2.5-72B-Instruct-Turbo", "name": "Qwen 2.5 72B"},
    ],
    "openrouter": [
        {"id": "auto", "name": "Auto (OpenRouter)"},
    ],
    "xai": [
        {"id": "grok-2", "name": "Grok 2"},
        {"id": "grok-2-mini", "name": "Grok 2 Mini"},
    ],
    "nvidia": [
        {"id": "meta/llama-3.1-405b-instruct", "name": "Llama 3.1 405B"},
        {"id": "meta/llama-3.3-70b-instruct", "name": "Llama 3.3 70B"},
    ],
    "fireworks": [
        {"id": "accounts/fireworks/models/llama-v3p3-70b-instruct", "name": "Llama 3.3 70B"},
        {"id": "accounts/fireworks/models/mixtral-8x22b-instruct", "name": "Mixtral 8x22B"},
    ],
    "cohere": [
        {"id": "command-r-plus", "name": "Command R+"},
        {"id": "command-r", "name": "Command R"},
    ],
    "perplexity": [
        {"id": "llama-3.1-sonar-large-128k-online", "name": "Sonar Large"},
        {"id": "llama-3.1-sonar-small-128k-online", "name": "Sonar Small"},
    ],
    "huggingface": [
        {"id": "meta-llama/Llama-3.3-70B-Instruct", "name": "Llama 3.3 70B"},
    ],
    "replicate": [
        {"id": "meta/meta-llama-3.1-405b-instruct", "name": "Llama 3.1 405B"},
    ],
    "cloudflare": [
        {"id": "@cf/meta/llama-3.3-70b-instruct-fp8", "name": "Llama 3.3 70B"},
    ],
    "opencode": [
        {"id": "default", "name": "OpenCode Default"},
    ],
}


class UserModelsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        from .models import UserAPIKey
        user_keys = UserAPIKey.objects.filter(user=request.user, is_active=True).select_related("provider")
        connected = {}
        for uk in user_keys:
            p = uk.provider
            models = PROVIDER_MODELS.get(p.value, [])
            connected[p.value] = {
                "provider": {
                    "value": p.value,
                    "label": p.label,
                    "color": p.color,
                    "logo_url": p.logo_url(),
                },
                "models": models,
            }
        return Response(success_response(data=connected))


class APIKeyTestView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        api_key = request.data.get("api_key", "")
        provider = request.data.get("provider", "")
        if not api_key or not provider:
            return Response(
                error_response("api_key and provider are required"),
                status=status.HTTP_400_BAD_REQUEST,
            )

        import requests as http_requests

        try:
            provider_obj = Provider.objects.get(value=provider, is_active=True)
        except Provider.DoesNotExist:
            return Response(
                error_response("Unknown provider"),
                status=status.HTTP_400_BAD_REQUEST,
            )

        url = provider_obj.endpoint.rstrip("/") + "/models"

        headers = {}
        if provider == "anthropic":
            headers = {"x-api-key": api_key, "anthropic-version": "2023-06-01"}
            url = provider_obj.endpoint.rstrip("/") + "/v1/models"
        elif provider == "gemini":
            url = f"{provider_obj.endpoint}/v1beta/models?key={api_key}"
        elif provider == "cohere":
            headers = {"Authorization": f"Bearer {api_key}"}
            url = provider_obj.endpoint.rstrip("/") + "/models"
        else:
            headers = {"Authorization": f"Bearer {api_key}"}

        try:
            resp = http_requests.get(url, headers=headers, timeout=10)
            if resp.status_code < 400:
                return Response(success_response(data={"status": "ok", "status_code": resp.status_code}))
            else:
                return Response(
                    error_response(f"Provider returned {resp.status_code}"),
                    status=status.HTTP_400_BAD_REQUEST,
                )
        except http_requests.exceptions.ConnectionError:
            return Response(
                error_response("Connection failed"),
                status=status.HTTP_400_BAD_REQUEST,
            )
        except http_requests.exceptions.Timeout:
            return Response(
                error_response("Connection timed out"),
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response(
                error_response(str(e)),
                status=status.HTTP_400_BAD_REQUEST,
            )
