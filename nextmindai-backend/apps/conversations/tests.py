from django.contrib.auth import get_user_model
from django.test import TestCase

from apps.conversations.models import Conversation, Message

User = get_user_model()


class ConversationModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(email="test@test.com", password="pass1234")

    def test_create_conversation(self):
        conv = Conversation.objects.create(user=self.user, title="Test Conv")
        self.assertEqual(conv.title, "Test Conv")
        self.assertEqual(conv.user, self.user)

    def test_create_message(self):
        conv = Conversation.objects.create(user=self.user)
        msg = Message.objects.create(
            conversation=conv,
            role="user",
            content="Hello",
        )
        self.assertEqual(msg.role, "user")
        self.assertEqual(msg.content, "Hello")


class ConversationAccessTest(TestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(email="user1@test.com", password="pass1234")
        self.user2 = User.objects.create_user(email="user2@test.com", password="pass1234")
        from rest_framework_simplejwt.tokens import RefreshToken
        self.token1 = str(RefreshToken.for_user(self.user1).access_token)
        self.token2 = str(RefreshToken.for_user(self.user2).access_token)
        self.conv1 = Conversation.objects.create(user=self.user1, title="Private")

    def test_user1_sees_own(self):
        response = self.client.get(
            "/api/v1/conversations/",
            HTTP_AUTHORIZATION=f"Bearer {self.token1}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 1)

    def test_user2_cannot_see_user1(self):
        response = self.client.get(
            "/api/v1/conversations/",
            HTTP_AUTHORIZATION=f"Bearer {self.token2}",
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["pagination"]["count"], 0)
