"""Custom python-social-auth pipeline steps for NextMind accounts."""

import logging

from social_core.exceptions import AuthFailed, AuthForbidden

logger = logging.getLogger("apps")


def require_verified_email(strategy, backend, response, *args, **kwargs):
    """Refuse Google logins whose email address is not verified."""
    if backend.name == "google-oauth2" and not response.get("verified_email", False):
        logger.warning("OAuth login refused: unverified Google email")
        raise AuthForbidden(backend)


def get_or_create_user(strategy, details, backend, user=None, *args, **kwargs):
    """Find or create the local user by verified email (links accounts)."""
    from django.contrib.auth import get_user_model

    if user:
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
    else:
        logger.info("OAuth login via %s: %s", backend.name, email)
    return {"is_new": created, "user": user}
