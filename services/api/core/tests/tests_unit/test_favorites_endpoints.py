from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.models import Article, BestPractice, Favorite

User = get_user_model()


class FavoriteEndpointsTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user", email="user@example.com", password="password123"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.user)

        self.article = Article.objects.create(
            title="A1", url="https://ex.com/a1", theme="security"
        )
        self.bp = BestPractice.objects.create(title="BP 1", content="secure")

    def test_toggle_favorite_article(self):
        url = reverse("favorite-toggle")
        res = self.client.post(
            url,
            {"model": "article", "object_id": self.article.id},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(res.data["favorited"])
        self.assertEqual(
            Favorite.objects.filter(user=self.user).count(),
            1,
        )

        res = self.client.post(
            url,
            {"model": "article", "object_id": self.article.id},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertFalse(res.data["favorited"])
        self.assertEqual(
            Favorite.objects.filter(user=self.user).count(),
            0,
        )

    def test_toggle_favorite_bestpractice(self):
        url = reverse("favorite-toggle")
        res = self.client.post(
            url,
            {"model": "bestpractice", "object_id": self.bp.id},
            format="json",
        )
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertTrue(
            Favorite.objects.filter(
                user=self.user,
                content_type=ContentType.objects.get_for_model(BestPractice),
                object_id=self.bp.id,
            ).exists()
        )

    def test_my_favorites_returns_enriched_data(self):
        ct_article = ContentType.objects.get_for_model(Article)
        Favorite.objects.create(
            user=self.user,
            content_type=ct_article,
            object_id=self.article.id,
        )

        url = reverse("favorite-mine")
        res = self.client.get(url)
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 1)
        fav = res.data[0]
        self.assertIn("model", fav)
        self.assertIn("title", fav)
        self.assertEqual(fav["model"], "article")
        self.assertEqual(fav["title"], self.article.title)
