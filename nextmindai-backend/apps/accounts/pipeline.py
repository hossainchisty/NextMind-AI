"""Custom python-social-auth pipeline steps for NextMind accounts."""

import logging

from social_core.exceptions import AuthFailed, AuthForbidden

logger = logging.getLogger("apps")


def require_verified_email(strategy, backend, response, *args, **kwargs):
    """Refuse Google logins whose email address is not verified."""
    if backend.name != "google-oauth2":
        return
    # Google userinfo v3 uses `email_verified`; accept the legacy key too.
    verified = response.get("verified_email", response.get("email_verified", False))
    if not verified:
        logger.warning("OAuth login refused: unverified Google email")
        raise AuthForbidden(backend)


def get_or_create_user(strategy, details, backend, user=None, response=None, *args, **kwargs):
    """Find or create the local user by verified email (links accounts)."""
    from django.contrib.auth import get_user_model

    if user:
        if not user.avatar:
            _import_social_avatar(user, response)
        return {"is_new": False, "user": user}

    email = (details.get("email") or "").strip().lower()
    if not email:
        raise AuthFailed(backend, "No email address provided by identity provider")

    User = get_user_model()
    user, created = User.objects.get_or_create(
        email=email,
        defaults={
            "name": (details.get("fullname") or "")[:255],
            "auth_provider": backend.name,
        },
    )
    if created:
        user.set_unusable_password()
        user.save(update_fields=["password"])
        logger.info("OAuth signup via %s: %s", backend.name, email)
        _import_social_avatar(user, response)
    else:
        logger.info("OAuth login via %s: %s", backend.name, email)
        if not user.avatar:
            _import_social_avatar(user, response)
    return {"is_new": created, "user": user}


def _import_social_avatar(user, response):
    """Point the avatar at the provider profile photo (no download, no copy)."""
    picture = (response or {}).get("picture", "")
    if not picture.startswith("https://"):
        return
    from urllib.parse import urlsplit
    if not urlsplit(picture).netloc.endswith("googleusercontent.com"):
        return
    user.avatar = picture
    user.save(update_fields=["avatar"])
    logger.info("Set social avatar for %s", user.email)
