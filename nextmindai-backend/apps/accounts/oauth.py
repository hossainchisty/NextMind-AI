"""OAuth SSO entry points built on python-social-auth.

Adding another provider later (e.g. GitHub) means: a backend entry in
AUTHENTICATION_BACKENDS, its key/secret settings, and no view changes —
begin/complete routes below already take the backend name.
"""

import logging
from urllib.parse import urlencode

from django.conf import settings
from django.contrib.auth import REDIRECT_FIELD_NAME
from django.http import HttpResponseBase
from django.shortcuts import redirect
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import csrf_exempt
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from social_core.actions import do_auth, do_complete
from social_core.exceptions import AuthException
from social_django.utils import psa

from apps.core.utils import success_response

logger = logging.getLogger("apps")


def google_configured() -> bool:
    return bool(settings.GOOGLE_CLIENT_ID and settings.GOOGLE_CLIENT_SECRET)


def _frontend_redirect(path: str, params: dict):
    base = settings.FRONTEND_URL.rstrip("/")
    return redirect(f"{base}{path}?{urlencode(params)}")


def _oauth_failed():
    return _frontend_redirect("/login", {"error": "oauth_failed"})


@never_cache
@psa("oauth_complete")
def oauth_begin(request, backend):
    return do_auth(request.backend, redirect_name=REDIRECT_FIELD_NAME)


@never_cache
@csrf_exempt
@psa("oauth_complete")
def oauth_complete(request, backend):
    captured = {}

    def _capture(backend, user, social_user):
        captured["user"] = user

    try:
        current = request.user if request.user.is_authenticated else None
        result = do_complete(
            request.backend,
            _capture,
            user=current,
            redirect_name=REDIRECT_FIELD_NAME,
            request=request,
        )
    except AuthException as e:
        logger.warning("OAuth complete failed for %s: %s", backend, e)
        return _oauth_failed()

    user = captured.get("user")
    if user is not None and user.is_active:
        refresh = RefreshToken.for_user(user)
        return _frontend_redirect("/auth/callback", {
            "access": str(refresh.access_token),
            "refresh": str(refresh),
        })
    if isinstance(result, HttpResponseBase):
        return result
    return _oauth_failed()


class OAuthProvidersView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        from django.urls import reverse

        google_auth_url = None
        if google_configured():
            google_auth_url = request.build_absolute_uri(
                reverse("oauth_begin", args=("google-oauth2",))
            )
        return Response(success_response(data={
            "google": {"enabled": google_configured(), "auth_url": google_auth_url},
        }))
