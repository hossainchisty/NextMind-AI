import os
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase, RequestFactory, override_settings

User = get_user_model()


class UserModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com",
            password="testpass123",
            name="Test User",
        )

    def test_create_user(self):
        self.assertEqual(self.user.email, "test@example.com")
        self.assertEqual(self.user.name, "Test User")
        self.assertTrue(self.user.check_password("testpass123"))
        self.assertTrue(self.user.is_active)
        self.assertFalse(self.user.is_staff)

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123",
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_str(self):
        self.assertEqual(str(self.user), "test@example.com")

    def test_user_uuid_pk(self):
        self.assertIsNotNone(self.user.id)
        self.assertEqual(len(str(self.user.id)), 36)


class RegisterViewTest(TestCase):
    def test_register_success(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "new@example.com",
                "name": "New User",
                "password": "strongpass123",
                "password_confirm": "strongpass123",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        self.assertTrue(response.json()["success"])
        self.assertIn("tokens", response.json()["data"])

    def test_register_password_mismatch(self):
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "new@example.com",
                "name": "New User",
                "password": "strongpass123",
                "password_confirm": "differentpass",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)

    def test_register_duplicate_email(self):
        User.objects.create_user(email="dup@example.com", password="pass12345")
        response = self.client.post(
            "/api/v1/auth/register/",
            {
                "email": "dup@example.com",
                "name": "Dup",
                "password": "pass12345",
                "password_confirm": "pass12345",
            },
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 400)


class LoginViewTest(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123"
        )

    def test_login_success(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "testpass123"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn("tokens", response.json()["data"])

    def test_login_wrong_password(self):
        response = self.client.post(
            "/api/v1/auth/login/",
            {"email": "test@example.com", "password": "wrongpass"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)


class MeViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="test@example.com", password="testpass123", name="Test User"
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_me_authenticated(self):
        response = self.client.get(
            "/api/v1/auth/me/",
            HTTP_AUTHORIZATION=f"Bearer {self.token}",
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]
        self.assertEqual(data["email"], "test@example.com")

    def test_me_unauthenticated(self):
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, 401)


class LoginThrottleTest(TestCase):
    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        User.objects.create_user(email="throttle@example.com", password="pass1234")

    def test_login_throttled_after_budget(self):
        # Dev budget is 10/minute; other tests in this process make at most
        # a couple of login attempts, so the first is allowed and the 12th
        # is always throttled regardless of ordering.
        statuses = []
        for _ in range(12):
            response = self.client.post(
                "/api/v1/auth/login/",
                {"email": "throttle@example.com", "password": "wrong"},
                content_type="application/json",
            )
            statuses.append(response.status_code)
        self.assertEqual(statuses[0], 401)
        self.assertEqual(statuses[-1], 429)


class LogoutBlacklistTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="logout@example.com", password="pass1234")
        from rest_framework_simplejwt.tokens import RefreshToken
        self.refresh = str(RefreshToken.for_user(self.user))
        self.access = str(RefreshToken.for_user(self.user).access_token)

    def test_logout_blacklists_refresh_token(self):
        response = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": self.refresh},
            content_type="application/json",
            HTTP_AUTHORIZATION=f"Bearer {self.access}",
        )
        self.assertEqual(response.status_code, 200)

        reuse = self.client.post(
            "/api/v1/auth/token/refresh/",
            {"refresh": self.refresh},
            content_type="application/json",
        )
        self.assertEqual(reuse.status_code, 401)

    def test_logout_requires_auth(self):
        response = self.client.post(
            "/api/v1/auth/logout/",
            {"refresh": "anything"},
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 401)


class ProductionSettingsTest(TestCase):
    def test_production_hardening_flags(self):
        import importlib
        import os
        from unittest.mock import patch

        with patch.dict(os.environ, {"ALLOWED_HOSTS": "example.com"}):
            mod = importlib.reload(importlib.import_module("config.settings.production"))
        self.assertFalse(mod.DEBUG)
        self.assertTrue(mod.SECURE_SSL_REDIRECT)
        self.assertTrue(mod.SESSION_COOKIE_SECURE)
        self.assertTrue(mod.CSRF_COOKIE_SECURE)
        self.assertGreater(mod.SECURE_HSTS_SECONDS, 0)
        self.assertFalse(mod.CORS_ALLOW_ALL_ORIGINS)


class VaultTest(TestCase):
    def test_roundtrip(self):
        from apps.accounts.services.vault import decrypt_api_key, encrypt_api_key, is_encrypted

        token = encrypt_api_key("sk-test-secret-key")
        self.assertTrue(is_encrypted(token))
        self.assertNotIn("sk-test-secret-key", token)
        self.assertEqual(decrypt_api_key(token), "sk-test-secret-key")

    def test_legacy_plaintext_passthrough(self):
        from apps.accounts.services.vault import decrypt_api_key, is_encrypted

        self.assertFalse(is_encrypted("sk-legacy-key"))
        self.assertEqual(decrypt_api_key("sk-legacy-key"), "sk-legacy-key")

    def test_migration_encrypts_legacy_rows(self):
        import importlib

        from apps.accounts.models import Provider, UserAPIKey
        from apps.accounts.services.vault import decrypt_api_key, is_encrypted

        user = User.objects.create_user(email="legacy@example.com", password="pass1234")
        provider = Provider.objects.filter(is_active=True).first()
        key = UserAPIKey.objects.create(user=user, provider=provider, api_key="sk-legacy-key")
        self.assertFalse(is_encrypted(key.api_key))

        migration = importlib.import_module("apps.accounts.migrations.0009_encrypt_existing_api_keys")
        from django.apps import apps as django_apps
        migration.encrypt_legacy_keys(django_apps, None)

        key.refresh_from_db()
        self.assertTrue(is_encrypted(key.api_key))
        self.assertEqual(decrypt_api_key(key.api_key), "sk-legacy-key")
        self.assertEqual(key.get_api_key(), "sk-legacy-key")


class APIKeySecurityTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="keys@example.com", password="pass1234", name="Keys User"
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token = str(RefreshToken.for_user(self.user).access_token)
        from apps.accounts.models import Provider
        self.provider = Provider.objects.filter(is_active=True).first()

    def _auth(self):
        return {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

    def test_create_stores_ciphertext_and_hides_key(self):
        from apps.accounts.models import UserAPIKey
        from apps.accounts.services.vault import is_encrypted

        response = self.client.post(
            "/api/v1/auth/api-keys/",
            {"provider": self.provider.value, "api_key": "sk-live-secret-key"},
            content_type="application/json",
            **self._auth(),
        )
        self.assertEqual(response.status_code, 201)
        body = response.json()["data"]
        self.assertNotIn("api_key", body)
        self.assertIn("api_key_masked", body)
        self.assertTrue(body["api_key_masked"].startswith("sk-l"))
        self.assertTrue(body["api_key_masked"].endswith("key"))

        stored = UserAPIKey.objects.get(user=self.user, provider=self.provider)
        self.assertTrue(is_encrypted(stored.api_key))
        self.assertNotIn("sk-live-secret-key", stored.api_key)
        self.assertEqual(stored.get_api_key(), "sk-live-secret-key")

    def test_list_never_returns_raw_keys(self):
        from apps.accounts.models import UserAPIKey

        UserAPIKey.objects.create(user=self.user, provider=self.provider, api_key="sk-live-secret-key")
        response = self.client.get("/api/v1/auth/api-keys/", **self._auth())
        self.assertEqual(response.status_code, 200)
        for item in response.json()["data"]:
            self.assertNotIn("api_key", item)
            self.assertIn("api_key_masked", item)


class ExportViewTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="export@example.com", password="pass1234", name="Export User"
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_export_contains_data_but_no_secrets(self):
        from apps.accounts.models import Provider, UserAPIKey
        from apps.conversations.models import Conversation, Message
        from apps.documents.models import Document
        from apps.knowledge.models import Collection

        provider = Provider.objects.filter(is_active=True).first()
        UserAPIKey.objects.create(user=self.user, provider=provider, api_key="sk-export-secret")
        collection = Collection.objects.create(user=self.user, name="Mine")
        Document.objects.create(
            user=self.user, name="doc.txt", original_filename="doc.txt",
            file_type="txt", file_size=3, collection=collection,
        )
        conv = Conversation.objects.create(user=self.user, title="Chat")
        Message.objects.create(conversation=conv, role="user", content="hello")

        response = self.client.get("/api/v1/auth/me/export/", **{
            "HTTP_AUTHORIZATION": f"Bearer {self.token}"
        })
        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["profile"]["email"], "export@example.com")
        self.assertEqual(len(payload["collections"]), 1)
        self.assertEqual(len(payload["documents"]), 1)
        self.assertEqual(payload["conversations"][0]["messages"][0]["content"], "hello")
        self.assertEqual(len(payload["providers"]), 1)
        self.assertNotIn("sk-export-secret", response.content.decode())

    def test_export_requires_auth(self):
        response = self.client.get("/api/v1/auth/me/export/")
        self.assertEqual(response.status_code, 401)


class DeleteAccountTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email="goodbye@example.com", password="pass1234", name="Bye User"
        )
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token = str(RefreshToken.for_user(self.user).access_token)

    def test_delete_queues_purge_and_removes_everything(self):
        from unittest.mock import patch

        from apps.documents.models import Document

        doc = Document.objects.create(
            user=self.user, name="d.txt", original_filename="d.txt",
            file_type="txt", file_size=1, file_key="docs/gone.txt",
        )

        with patch("apps.documents.services.storage.delete_from_r2"), \
                patch("apps.accounts.tasks.delete_account_task.delay") as mock_delay:
            response = self.client.delete(
                "/api/v1/auth/me/",
                HTTP_AUTHORIZATION=f"Bearer {self.token}",
            )
        self.assertEqual(response.status_code, 202)
        mock_delay.assert_called_once_with(str(self.user.id))

        # Run the purge inline (task body, unbound)
        from apps.accounts.tasks import delete_account_task
        with patch("apps.documents.services.storage.delete_from_r2") as mock_r2:
            delete_account_task.run(str(self.user.id))
        mock_r2.assert_called_once_with("docs/gone.txt")
        self.assertFalse(User.objects.filter(id=self.user.id).exists())
        self.assertFalse(Document.objects.filter(id=doc.id).exists())


class OAuthProvidersViewTest(TestCase):
    @override_settings(GOOGLE_CLIENT_ID="", GOOGLE_CLIENT_SECRET="")
    def test_reports_disabled_without_config(self):
        response = self.client.get("/api/v1/auth/oauth/providers/")
        self.assertEqual(response.status_code, 200)
        google = response.json()["data"]["google"]
        self.assertFalse(google["enabled"])
        self.assertIsNone(google["auth_url"])

    @override_settings(GOOGLE_CLIENT_ID="test-client", GOOGLE_CLIENT_SECRET="test-secret")
    def test_reports_begin_url_when_configured(self):
        response = self.client.get("/api/v1/auth/oauth/providers/")
        google = response.json()["data"]["google"]
        self.assertTrue(google["enabled"])
        self.assertIn("/api/v1/auth/oauth/login/google-oauth2/", google["auth_url"])

    @override_settings(GOOGLE_CLIENT_ID="test-client", GOOGLE_CLIENT_SECRET="test-secret")
    def test_begin_redirects_to_google(self):
        response = self.client.get("/api/v1/auth/oauth/login/google-oauth2/")
        self.assertEqual(response.status_code, 302)
        self.assertTrue(response["Location"].startswith("https://accounts.google.com/"))


class OAuthPipelineTest(TestCase):
    def _backend(self, name="google-oauth2"):
        from unittest.mock import Mock
        backend = Mock()
        backend.name = name
        return backend

    def test_verified_email_passes(self):
        from apps.accounts.pipeline import require_verified_email

        self.assertIsNone(require_verified_email(
            None, self._backend(), {"verified_email": True}
        ))
        self.assertIsNone(require_verified_email(
            None, self._backend(), {"email_verified": True}
        ))

    def test_unverified_email_rejected(self):
        from social_core.exceptions import AuthForbidden

        from apps.accounts.pipeline import require_verified_email

        with self.assertRaises(AuthForbidden):
            require_verified_email(None, self._backend(), {"verified_email": False})

    def test_other_backends_skip_verification(self):
        from apps.accounts.pipeline import require_verified_email

        self.assertIsNone(require_verified_email(None, self._backend("github"), {}))

    def test_get_or_create_user_creates(self):
        from apps.accounts.pipeline import get_or_create_user

        result = get_or_create_user(
            None, {"email": "New@Example.com", "fullname": "New User"},
            self._backend(),
        )
        self.assertTrue(result["is_new"])
        user = result["user"]
        self.assertEqual(user.email, "new@example.com")
        self.assertEqual(user.auth_provider, "google-oauth2")
        self.assertFalse(user.has_usable_password())

    def test_get_or_create_user_links_existing(self):
        from apps.accounts.pipeline import get_or_create_user

        existing = User.objects.create_user(email="old@example.com", password="pass1234")
        result = get_or_create_user(
            None, {"email": "old@example.com", "fullname": "Old User"},
            self._backend(),
        )
        self.assertFalse(result["is_new"])
        self.assertEqual(result["user"].id, existing.id)
        self.assertEqual(User.objects.filter(email="old@example.com").count(), 1)

    def test_get_or_create_user_returns_logged_in_user(self):
        from apps.accounts.pipeline import get_or_create_user

        existing = User.objects.create_user(email="me@example.com", password="pass1234")
        result = get_or_create_user(None, {}, self._backend(), user=existing)
        self.assertFalse(result["is_new"])
        self.assertEqual(result["user"].id, existing.id)

    def test_signup_uses_google_photo_url(self):
        from apps.accounts.pipeline import get_or_create_user

        result = get_or_create_user(
            None,
            {"email": "pic@example.com", "fullname": "Pic User"},
            self._backend(),
            response={"picture": "https://lh3.googleusercontent.com/a/photo123"},
        )
        user = result["user"]
        self.assertEqual(user.avatar, "https://lh3.googleusercontent.com/a/photo123")
        self.assertEqual(user.avatar_url(), "https://lh3.googleusercontent.com/a/photo123")

    def test_non_google_picture_url_skipped(self):
        from apps.accounts.pipeline import get_or_create_user

        result = get_or_create_user(
            None,
            {"email": "evil@example.com", "fullname": "Evil"},
            self._backend(),
            response={"picture": "https://attacker.example/pic.jpg"},
        )
        self.assertEqual(result["user"].avatar, "")

    def test_existing_avatar_never_overwritten(self):
        from apps.accounts.pipeline import get_or_create_user

        existing = User.objects.create_user(email="keep@example.com", password="pass1234")
        existing.avatar = "avatars/keep/custom.png"
        existing.save(update_fields=["avatar"])
        result = get_or_create_user(
            None, {}, self._backend(), user=existing,
            response={"picture": "https://lh3.googleusercontent.com/a/other"},
        )
        self.assertEqual(result["user"].avatar, "avatars/keep/custom.png")

    def test_r2_key_avatars_still_use_signed_urls(self):
        from unittest.mock import patch

        user = User.objects.create_user(email="r2@example.com", password="pass1234")
        user.avatar = "avatars/r2/custom.png"
        with patch("apps.documents.services.storage.get_signed_url", return_value="https://signed-url") as mock_sign:
            self.assertEqual(user.avatar_url(), "https://signed-url")
        mock_sign.assert_called_once_with("avatars/r2/custom.png", expires_in=86400)


class OAuthCompleteViewTest(TestCase):
    @override_settings(FRONTEND_URL="http://testserver")
    def test_complete_issues_jwt_redirect(self):
        from unittest.mock import patch

        user = User.objects.create_user(email="social@example.com", password="pass1234")

        def fake_complete(backend, login, user=None, **kwargs):
            pipeline_user = User.objects.get(email="social@example.com")
            login(backend, pipeline_user, None)
            return None

        with patch("apps.accounts.oauth.do_complete", side_effect=fake_complete):
            response = self.client.get("/api/v1/auth/oauth/google-oauth2/callback/")
        self.assertEqual(response.status_code, 302)
        location = response["Location"]
        self.assertTrue(location.startswith("http://testserver/auth/callback?"))
        self.assertIn("access=", location)
        self.assertIn("refresh=", location)
        self.assertTrue(User.objects.filter(email="social@example.com").exists())

    def test_complete_failure_redirects_to_login(self):
        from unittest.mock import patch

        from social_core.exceptions import AuthFailed

        with patch(
            "apps.accounts.oauth.do_complete",
            side_effect=AuthFailed(None, "denied"),
        ):
            response = self.client.get("/api/v1/auth/oauth/google-oauth2/callback/")
        self.assertEqual(response.status_code, 302)
        self.assertIn("/login?error=oauth_failed", response["Location"])
