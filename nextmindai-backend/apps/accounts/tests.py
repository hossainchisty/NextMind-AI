import os
import tempfile

from django.contrib.auth import get_user_model
from django.test import TestCase, RequestFactory

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
