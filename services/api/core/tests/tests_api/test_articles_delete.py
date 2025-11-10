import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()


def test_delete_article_then_404_on_get():
    r_create = client.post(
        "/api/articles/",
        {
            "title": "To Delete",
            "url": "https://ex.com/todel",
            "theme": "ai",
        },
        format="json",
    )
    assert r_create.status_code == 201, r_create.data
    art_id = r_create.data["id"]

    r_del = client.delete(f"/api/articles/{art_id}/")
    assert r_del.status_code == 204

    r_get = client.get(f"/api/articles/{art_id}/")
    assert r_get.status_code == 404
    assert r_get.data.get("code") == "not_found"
