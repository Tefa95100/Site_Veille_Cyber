import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()


def test_partial_update_article_title_only():
    r_create = client.post(
        "/api/articles/",
        {
            "title": "Old Title",
            "url": "https://ex.com/art1",
            "theme": "security",
        },
        format="json",
    )
    assert r_create.status_code == 201, r_create.data
    art_id = r_create.data["id"]

    r_patch = client.patch(
        f"/api/articles/{art_id}/",
        {"title": "New Title"},
        format="json",
    )

    assert r_patch.status_code == 200, r_patch.data
    assert r_patch.data["id"] == art_id
    assert r_patch.data["title"] == "New Title"
    assert r_patch.data["url"] == "https://ex.com/art1"
    assert r_patch.data["theme"] == "security"

    r_get = client.get(f"/api/articles/{art_id}/")
    assert r_get.status_code == 200, r_get.data
    assert r_get.data["title"] == "New Title"
    assert r_get.data["url"] == "https://ex.com/art1"
    assert r_get.data["theme"] == "security"
