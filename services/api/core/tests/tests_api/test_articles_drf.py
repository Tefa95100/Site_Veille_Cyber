# services/api/core/tests_api/test_articles_drf.py
import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()


def test_create_duplicate_url_400():
    r1 = client.post(
        "/api/articles/",
        {"title": "A valid title", "url": "https://ex.com/dup"},
        format="json",
    )
    assert r1.status_code == 201
    r2 = client.post(
        "/api/articles/",
        {"title": "Another valid title", "url": "https://ex.com/dup"},
        format="json",
    )
    assert r2.status_code == 400
    assert r2.data.get("code") == "duplicate_url"
