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
