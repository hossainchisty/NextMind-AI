import logging
import time

from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

logger = logging.getLogger("apps")


def check_database():
    """Returns (ok, latency_ms) for the primary database."""
    from django.db import connection

    start = time.time()
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        return True, int((time.time() - start) * 1000)
    except Exception as e:
        logger.error("Health check: database failed: %s", e)
        return False, 0


def check_redis():
    """Returns (ok, latency_ms) for the Celery broker."""
    import redis
    from django.conf import settings

    start = time.time()
    try:
        client = redis.Redis.from_url(settings.REDIS_URL, socket_timeout=5)
        client.ping()
        return True, int((time.time() - start) * 1000)
    except Exception as e:
        logger.error("Health check: redis failed: %s", e)
        return False, 0


def check_storage():
    """Returns (ok, latency_ms) for the R2 object store."""
    from django.conf import settings

    start = time.time()
    try:
        from apps.documents.services.storage import get_r2_client
        get_r2_client().head_bucket(Bucket=settings.R2_BUCKET_NAME)
        return True, int((time.time() - start) * 1000)
    except Exception as e:
        logger.error("Health check: storage failed: %s", e)
        return False, 0


class HealthView(APIView):
    permission_classes = [permissions.AllowAny]
    # Polled by the public status page; keep it ungated.
    throttle_classes = []

    def get(self, request):
        from django.utils import timezone

        results = {
            "database": check_database(),
            "queue": check_redis(),
            "storage": check_storage(),
        }
        components = {
            name: {"status": "operational" if ok else "down", "latency_ms": ms}
            for name, (ok, ms) in results.items()
        }
        overall = "operational" if all(ok for ok, _ in results.values()) else "degraded"
        return Response({
            "success": True,
            "data": {
                "status": overall,
                "components": components,
                "checked_at": timezone.now().isoformat(),
            },
        })
