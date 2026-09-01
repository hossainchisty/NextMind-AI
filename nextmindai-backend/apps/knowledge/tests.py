from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.core.permissions import IsOwner
from apps.knowledge.models import Collection
from apps.documents.models import Document

User = get_user_model()


class IsOwnerPermissionTest(TestCase):
    def setUp(self):
        from django.test import RequestFactory
        self.factory = RequestFactory()
        self.user1 = User.objects.create_user(email="user1@test.com", password="pass1234")
        self.user2 = User.objects.create_user(email="user2@test.com", password="pass1234")
        self.perm = IsOwner()

    def test_owner_has_permission(self):
        collection = Collection.objects.create(user=self.user1, name="Test")
        request = self.factory.get("/")
        request.user = self.user1
        self.assertTrue(self.perm.has_object_permission(request, None, collection))

    def test_non_owner_denied(self):
        collection = Collection.objects.create(user=self.user1, name="Test")
        request = self.factory.get("/")
        request.user = self.user2
        self.assertFalse(self.perm.has_object_permission(request, None, collection))


class CollectionOwnershipTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email="user1@test.com", password="pass1234")
        self.user2 = User.objects.create_user(email="user2@test.com", password="pass1234")
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token1 = str(RefreshToken.for_user(self.user1).access_token)
        self.token2 = str(RefreshToken.for_user(self.user2).access_token)
        self.collection1 = Collection.objects.create(user=self.user1, name="User1 Collection")

    def test_user1_sees_own_collection(self):
        response = self.client.get(
            "/api/v1/collections/",
            HTTP_AUTHORIZATION=f"Bearer {self.token1}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 1)

    def test_user2_cannot_see_user1_collection(self):
        response = self.client.get(
            "/api/v1/collections/",
            HTTP_AUTHORIZATION=f"Bearer {self.token2}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 0)

    def test_user2_cannot_access_user1_collection_detail(self):
        response = self.client.get(
            f"/api/v1/collections/{self.collection1.id}/",
            HTTP_AUTHORIZATION=f"Bearer {self.token2}",
        )
        self.assertIn(response.status_code, [403, 404])


class DocumentOwnershipTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email="user1@test.com", password="pass1234")
        self.user2 = User.objects.create_user(email="user2@test.com", password="pass1234")
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token1 = str(RefreshToken.for_user(self.user1).access_token)
        self.token2 = str(RefreshToken.for_user(self.user2).access_token)
        self.doc1 = Document.objects.create(
            user=self.user1,
            name="User1 Doc",
            original_filename="test.pdf",
            file_type="pdf",
            file_size=100,
        )

    def test_user1_sees_own_docs(self):
        response = self.client.get(
            "/api/v1/documents/",
            HTTP_AUTHORIZATION=f"Bearer {self.token1}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 1)

    def test_user2_cannot_see_user1_docs(self):
        response = self.client.get(
            "/api/v1/documents/",
            HTTP_AUTHORIZATION=f"Bearer {self.token2}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 0)

    def test_unauthenticated_denied(self):
        response = self.client.get("/api/v1/documents/")
        self.assertEqual(response.status_code, 401)
