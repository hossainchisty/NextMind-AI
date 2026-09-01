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
        data = response.json()
        self.assertEqual(data["email"], "test@example.com")

    def test_me_unauthenticated(self):
        response = self.client.get("/api/v1/auth/me/")
        self.assertEqual(response.status_code, 401)
