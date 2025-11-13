from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from rest_framework.test import APITestCase, APIRequestFactory

from core.models import Article, Favorite
from core.api.serializers import ArticleOut

User = get_user_model()


class ArticleOutSerializerTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="user", email="user@example.com", password="password123"
        )
        self.article = Article.objects.create(
            title="A1", url="https://ex.com/a1", theme="security"
        )
        self.factory = APIRequestFactory()

    def test_is_favorite_false_by_default(self):
        request = self.factory.get("/fake")
        request.user = self.user
        ser = ArticleOut(self.article.__dict__, context={"request": request})
        self.assertFalse(ser.data["is_favorite"])

    def test_is_favorite_true_when_favorite_exists(self):
        ct = ContentType.objects.get_for_model(Article)
        Favorite.objects.create(
            user=self.user,
            content_type=ct,
            object_id=self.article.id,
        )
        request = self.factory.get("/fake")
        request.user = self.user
        ser = ArticleOut(self.article.__dict__, context={"request": request})
        self.assertTrue(ser.data["is_favorite"])
