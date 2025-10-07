from django.test import TestCase
from .models import Article


class ArticleTest(TestCase):
    def test_create_article(self):
        a = Article.objects.create(title="Hello")
        self.assertIsNotNone(a.id)
