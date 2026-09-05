from unittest.mock import patch

from django.test import TestCase


class HealthViewTest(TestCase):
    def test_public_without_auth(self):
        with patch("apps.core.views.check_database", return_value=(True, 3)), \
                patch("apps.core.views.check_redis", return_value=(True, 2)), \
                patch("apps.core.views.check_storage", return_value=(True, 40)):
            response = self.client.get("/api/v1/health/")
        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]
        self.assertEqual(data["status"], "operational")
        self.assertEqual(data["components"]["database"]["status"], "operational")
        self.assertEqual(data["components"]["queue"]["latency_ms"], 2)
        self.assertIn("checked_at", data)

    def test_degraded_when_component_down(self):
        with patch("apps.core.views.check_database", return_value=(True, 3)), \
                patch("apps.core.views.check_redis", return_value=(False, 0)), \
                patch("apps.core.views.check_storage", return_value=(True, 40)):
            response = self.client.get("/api/v1/health/")
        data = response.json()["data"]
        self.assertEqual(data["status"], "degraded")
        self.assertEqual(data["components"]["queue"]["status"], "down")

    def test_no_internal_errors_leaked(self):
        with patch("apps.core.views.check_database", return_value=(False, 0)), \
                patch("apps.core.views.check_redis", return_value=(True, 1)), \
                patch("apps.core.views.check_storage", return_value=(True, 1)):
            response = self.client.get("/api/v1/health/")
        body = response.content.decode()
        self.assertNotIn("Traceback", body)
        self.assertNotIn("Exception", body)
