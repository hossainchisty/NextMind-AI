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
        {"id": "gpt-4o", "name": "GPT-4o", "context": "128K", "input_price": "$2.50", "output_price": "$10.00", "pricing_type": "paid", "capabilities": ["vision", "function_calling", "json_mode"], "description": "Flagship model, best overall quality"},
        {"id": "gpt-4o-mini", "name": "GPT-4o Mini", "context": "128K", "input_price": "$0.15", "output_price": "$0.60", "pricing_type": "paid", "capabilities": ["vision", "function_calling", "json_mode"], "description": "Fast and affordable, great for most tasks"},
        {"id": "gpt-4-turbo", "name": "GPT-4 Turbo", "context": "128K", "input_price": "$10.00", "output_price": "$30.00", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Previous gen flagship, strong reasoning"},
        {"id": "o1-preview", "name": "o1 Preview", "context": "128K", "input_price": "$15.00", "output_price": "$60.00", "pricing_type": "paid", "capabilities": ["reasoning"], "description": "Advanced reasoning model for complex problems"},
        {"id": "o1-mini", "name": "o1 Mini", "context": "128K", "input_price": "$3.00", "output_price": "$12.00", "pricing_type": "paid", "capabilities": ["reasoning"], "description": "Fast reasoning model for math and code"},
    ],
    "anthropic": [
        {"id": "claude-sonnet-4-20250514", "name": "Claude Sonnet 4", "context": "200K", "input_price": "$3.00", "output_price": "$15.00", "pricing_type": "paid", "capabilities": ["vision", "function_calling", "extended_thinking"], "description": "Balanced intelligence and speed"},
        {"id": "claude-3-5-haiku-20241022", "name": "Claude 3.5 Haiku", "context": "200K", "input_price": "$0.80", "output_price": "$4.00", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Fastest Claude model, great for chat"},
        {"id": "claude-3-opus-20240229", "name": "Claude 3 Opus", "context": "200K", "input_price": "$15.00", "output_price": "$75.00", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Most capable Claude, best for complex analysis"},
    ],
    "gemini": [
        {"id": "gemini-2.5-flash", "name": "Gemini 2.5 Flash", "context": "1M", "input_price": "Free / $0.15", "output_price": "Free / $0.60", "pricing_type": "freemium", "capabilities": ["vision", "function_calling", "grounding"], "description": "Free tier available, strong reasoning with thinking"},
        {"id": "gemini-2.5-pro", "name": "Gemini 2.5 Pro", "context": "1M", "input_price": "Free / $1.25", "output_price": "Free / $10.00", "pricing_type": "freemium", "capabilities": ["vision", "function_calling", "grounding"], "description": "Free tier available, best Gemini for complex tasks"},
        {"id": "gemini-2.0-flash", "name": "Gemini 2.0 Flash", "context": "1M", "input_price": "Free / $0.10", "output_price": "Free / $0.40", "pricing_type": "freemium", "capabilities": ["vision", "function_calling"], "description": "Free tier, ultra-fast for simple tasks"},
    ],
    "deepseek": [
        {"id": "deepseek-chat", "name": "DeepSeek Chat", "context": "64K", "input_price": "$0.14", "output_price": "$0.28", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Best value, strong coding and math"},
        {"id": "deepseek-reasoner", "name": "DeepSeek Reasoner", "context": "64K", "input_price": "$0.55", "output_price": "$2.19", "pricing_type": "paid", "capabilities": ["reasoning"], "description": "Deep thinking model for complex problems"},
    ],
    "groq": [
        {"id": "llama-3.3-70b-versatile", "name": "Llama 3.3 70B", "context": "128K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": ["function_calling"], "description": "Free tier on Groq, ultra-fast inference"},
        {"id": "llama-3.1-8b-instant", "name": "Llama 3.1 8B", "context": "128K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": [], "description": "Free tier, ultra-fast lightweight model"},
        {"id": "mixtral-8x7b-32768", "name": "Mixtral 8x7B", "context": "32K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": [], "description": "Free tier, mixture of experts"},
        {"id": "gemma2-9b-it", "name": "Gemma 2 9B", "context": "8K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": [], "description": "Free tier, lightweight Google model"},
    ],
    "mistral": [
        {"id": "mistral-large-latest", "name": "Mistral Large", "context": "128K", "input_price": "$2.00", "output_price": "$6.00", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Most capable Mistral model"},
        {"id": "mistral-medium-latest", "name": "Mistral Medium", "context": "32K", "input_price": "$2.70", "output_price": "$8.10", "pricing_type": "paid", "capabilities": [], "description": "Balanced performance and cost"},
        {"id": "mistral-small-latest", "name": "Mistral Small", "context": "32K", "input_price": "$0.10", "output_price": "$0.30", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Fast and affordable"},
    ],
    "together": [
        {"id": "meta-llama/Llama-3.3-70B-Instruct-Turbo", "name": "Llama 3.3 70B Turbo", "context": "128K", "input_price": "$0.88", "output_price": "$0.88", "pricing_type": "paid", "capabilities": [], "description": "Optimized Llama on Together"},
        {"id": "meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo", "name": "Llama 3.1 405B", "context": "128K", "input_price": "$3.50", "output_price": "$3.50", "pricing_type": "paid", "capabilities": [], "description": "Largest open-source model"},
        {"id": "Qwen/Qwen2.5-72B-Instruct-Turbo", "name": "Qwen 2.5 72B", "context": "32K", "input_price": "$0.90", "output_price": "$0.90", "pricing_type": "paid", "capabilities": [], "description": "Strong multilingual model"},
    ],
    "openrouter": [
        {"id": "auto", "name": "Auto (OpenRouter)", "context": "Varies", "input_price": "Varies", "output_price": "Varies", "pricing_type": "paid", "capabilities": ["routing"], "description": "Auto-routes to best model for your prompt"},
    ],
    "xai": [
        {"id": "grok-2", "name": "Grok 2", "context": "128K", "input_price": "$2.00", "output_price": "$10.00", "pricing_type": "paid", "capabilities": ["vision"], "description": "xAI flagship, real-time knowledge"},
        {"id": "grok-2-mini", "name": "Grok 2 Mini", "context": "128K", "input_price": "$0.30", "output_price": "$0.50", "pricing_type": "paid", "capabilities": ["vision"], "description": "Fast Grok variant"},
    ],
    "nvidia": [
        {"id": "meta/llama-3.1-405b-instruct", "name": "Llama 3.1 405B", "context": "128K", "input_price": "$2.70", "output_price": "$2.70", "pricing_type": "paid", "capabilities": [], "description": "Llama on NVIDIA GPUs"},
        {"id": "meta/llama-3.3-70b-instruct", "name": "Llama 3.3 70B", "context": "128K", "input_price": "$0.35", "output_price": "$0.40", "pricing_type": "paid", "capabilities": [], "description": "Fast Llama on NVIDIA"},
    ],
    "fireworks": [
        {"id": "accounts/fireworks/models/llama-v3p3-70b-instruct", "name": "Llama 3.3 70B", "context": "128K", "input_price": "$0.90", "output_price": "$0.90", "pricing_type": "paid", "capabilities": [], "description": "Llama on Fireworks infrastructure"},
        {"id": "accounts/fireworks/models/mixtral-8x22b-instruct", "name": "Mixtral 8x22B", "context": "65K", "input_price": "$1.20", "output_price": "$1.20", "pricing_type": "paid", "capabilities": [], "description": "Large MoE model"},
    ],
    "cohere": [
        {"id": "command-r-plus", "name": "Command R+", "context": "128K", "input_price": "$2.50", "output_price": "$10.00", "pricing_type": "paid", "capabilities": ["function_calling", "rag"], "description": "Best for RAG and tool use"},
        {"id": "command-r", "name": "Command R", "context": "128K", "input_price": "$0.15", "output_price": "$0.60", "pricing_type": "paid", "capabilities": ["function_calling", "rag"], "description": "Affordable RAG-optimized model"},
    ],
    "perplexity": [
        {"id": "llama-3.1-sonar-large-128k-online", "name": "Sonar Large", "context": "128K", "input_price": "$1.00", "output_price": "$1.00", "pricing_type": "paid", "capabilities": ["web_search"], "description": "Online-aware with real-time search"},
        {"id": "llama-3.1-sonar-small-128k-online", "name": "Sonar Small", "context": "128K", "input_price": "$0.20", "output_price": "$0.20", "pricing_type": "paid", "capabilities": ["web_search"], "description": "Fast online-aware model"},
    ],
    "huggingface": [
        {"id": "meta-llama/Llama-3.3-70B-Instruct", "name": "Llama 3.3 70B", "context": "128K", "input_price": "$0.35", "output_price": "$0.40", "pricing_type": "paid", "capabilities": [], "description": "Llama via HuggingFace inference"},
    ],
    "replicate": [
        {"id": "meta/meta-llama-3.1-405b-instruct", "name": "Llama 3.1 405B", "context": "128K", "input_price": "$3.00", "output_price": "$3.00", "pricing_type": "paid", "capabilities": [], "description": "Llama on Replicate cloud"},
    ],
    "cloudflare": [
        {"id": "@cf/meta/llama-3.3-70b-instruct-fp8", "name": "Llama 3.3 70B", "context": "128K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": [], "description": "Free tier on Cloudflare edge"},
    ],
    "meta": [
        {"id": "muse-spark-1.3", "name": "Muse Spark 1.3", "context": "128K", "input_price": "$1.25", "output_price": "$4.25", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Latest Meta model, best quality"},
        {"id": "muse-spark-1.2", "name": "Muse Spark 1.2", "context": "128K", "input_price": "$1.25", "output_price": "$4.25", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Balanced performance and speed"},
        {"id": "muse-spark-1.1", "name": "Muse Spark 1.1", "context": "128K", "input_price": "$1.25", "output_price": "$4.25", "pricing_type": "paid", "capabilities": ["vision"], "description": "Fast and reliable"},
        {"id": "muse-spark-1.3-contributor", "name": "Muse Spark 1.3 (Contributor)", "context": "128K", "input_price": "$0.10", "output_price": "$0.20", "pricing_type": "paid", "capabilities": ["vision", "function_calling"], "description": "Discounted, data used for training"},
        {"id": "muse-spark-1.2-contributor", "name": "Muse Spark 1.2 (Contributor)", "context": "128K", "input_price": "$0.10", "output_price": "$0.20", "pricing_type": "paid", "capabilities": ["vision"], "description": "Discounted, data used for training"},
    ],
    "qwen": [
        {"id": "qwen-max", "name": "Qwen Max", "context": "32K", "input_price": "$1.60", "output_price": "$6.40", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Most capable Qwen model"},
        {"id": "qwen-plus", "name": "Qwen Plus", "context": "128K", "input_price": "$0.40", "output_price": "$1.20", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Balanced performance and cost"},
        {"id": "qwen-turbo", "name": "Qwen Turbo", "context": "128K", "input_price": "$0.05", "output_price": "$0.20", "pricing_type": "paid", "capabilities": [], "description": "Fast and affordable"},
        {"id": "qwen-long", "name": "Qwen Long", "context": "10M", "input_price": "$0.50", "output_price": "$2.00", "pricing_type": "paid", "capabilities": [], "description": "Ultra-long context for documents"},
    ],
    "minimax": [
        {"id": "MiniMax-Text-01", "name": "MiniMax Text 01", "context": "1M", "input_price": "$1.00", "output_price": "$8.00", "pricing_type": "paid", "capabilities": ["function_calling"], "description": "Flagship model, 1M context"},
        {"id": "abab6.5s-chat", "name": "Abab 6.5S", "context": "256K", "input_price": "$0.50", "output_price": "$1.50", "pricing_type": "paid", "capabilities": [], "description": "Fast chat model"},
    ],
    "zhipu": [
        {"id": "glm-4-plus", "name": "GLM-4 Plus", "context": "128K", "input_price": "$0.70", "output_price": "$2.10", "pricing_type": "paid", "capabilities": ["function_calling", "vision"], "description": "Most capable GLM model"},
        {"id": "glm-4-flash", "name": "GLM-4 Flash", "context": "128K", "input_price": "Free", "output_price": "Free", "pricing_type": "free", "capabilities": [], "description": "Free tier, fast inference"},
        {"id": "glm-4-long", "name": "GLM-4 Long", "context": "1M", "input_price": "$0.50", "output_price": "$1.00", "pricing_type": "paid", "capabilities": [], "description": "Ultra-long context"},
    ],
    "xiaomi": [
        {"id": "mimo-v2.5-pro", "name": "MiMo V2.5 Pro", "context": "1M", "input_price": "$0.44", "output_price": "$0.87", "pricing_type": "paid", "capabilities": ["function_calling", "vision", "reasoning"], "description": "Flagship model, best for coding and agents"},
        {"id": "mimo-v2.5", "name": "MiMo V2.5", "context": "1M", "input_price": "$0.14", "output_price": "$0.28", "pricing_type": "paid", "capabilities": ["function_calling", "vision"], "description": "Balanced performance and cost"},
        {"id": "mimo-v2-pro", "name": "MiMo V2 Pro", "context": "1M", "input_price": "$1.00", "output_price": "$3.00", "pricing_type": "paid", "capabilities": ["function_calling", "reasoning"], "description": "Previous gen flagship, strong reasoning"},
        {"id": "mimo-v2-flash", "name": "MiMo V2 Flash", "context": "56K", "input_price": "$0.10", "output_price": "$0.30", "pricing_type": "paid", "capabilities": [], "description": "Fast and cheap, open-source"},
    ],
    "opencode": [
        {"id": "default", "name": "OpenCode Default", "context": "N/A", "input_price": "N/A", "output_price": "N/A", "pricing_type": "free", "capabilities": [], "description": "OpenCode managed model"},
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
            headers = {"Authorization": f"Bearer {api_key}"}
            url = provider_obj.endpoint.rstrip("/") + "/models"
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
