"""Production settings. Deploy with DJANGO_SETTINGS_MODULE=config.settings.production."""

from .base import *  # noqa: F401, F403

DEBUG = False

ALLOWED_HOSTS = [
    h.strip() for h in os.environ.get("ALLOWED_HOSTS", "").split(",") if h.strip()  # noqa: F405
]
if not ALLOWED_HOSTS:
    raise RuntimeError("ALLOWED_HOSTS must be set in production")

# TLS / cookies / headers
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = "same-origin"
X_FRAME_OPTIONS = "DENY"

# Never allow open CORS in production
CORS_ALLOW_ALL_ORIGINS = False

LOGGING["root"]["level"] = "INFO"  # noqa: F405
