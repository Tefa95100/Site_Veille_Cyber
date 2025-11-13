from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.models import BestPractice, Favorite, Article

User = get_user_model()


class BestPracticeAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user", email="user@example.com", password="password123"
        )
        self.admin = User.objects.create_user(
            username="admin",
            email="admin@example.com",
            password="password123",
            is_staff=True,
        )
        self.client = APIClient()

    def test_list_best_practices_as_anonymous(self):
        bp = BestPractice.objects.create(title="BP 1", content="do this")
        url = reverse("best-practices-list")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 1)
        self.assertIn("is_favorite", res.data["results"][0])
        self.assertFalse(res.data["results"][0]["is_favorite"])

    def test_create_best_practice_requires_admin(self):
        url = reverse("best-practices-list")
        self.client.force_authenticate(user=self.user)
        res = self.client.post(
            url, {"title": "Nope", "content": "no"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user=self.admin)
        res = self.client.post(
            url, {"title": "OK", "content": "yes"}, format="json"
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(BestPractice.objects.count(), 1)

    def test_best_practice_is_favorite_flag(self):
        bp = BestPractice.objects.create(title="BP 1", content="do this")
        ct = ContentType.objects.get_for_model(BestPractice)
        Favorite.objects.create(
            user=self.user,
            content_type=ct,
            object_id=bp.id,
        )

        url = reverse("best-practices-list")
        self.client.force_authenticate(user=self.user)
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data["results"]), 1)
        self.assertTrue(res.data["results"][0]["is_favorite"])
