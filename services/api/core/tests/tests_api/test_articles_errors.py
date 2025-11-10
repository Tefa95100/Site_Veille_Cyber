import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()


def test_create_too_short_title_returns_400_uniform_error():
    r = client.post(
        "/api/articles/",
        {"title": "ab", "url": "https://ex.com/x", "theme": "sec"},
        format="json",
    )
    assert r.status_code == 400
    assert "code" in r.data
    assert "message" in r.data
    assert "extra" in r.data

    # format cohérent
    assert r.data["code"] == "invalid_payload"
    assert "title" in r.data["extra"]
    assert "Ensure this field has at least 3 characters." in r.data["extra"]["title"][0]


def test_create_duplicate_url_returns_400_duplicate_url():
    r1 = client.post(
        "/api/articles/",
        {"title": "Valid aaa", "url": "https://ex.com/dup"},
        format="json",
    )
    assert r1.status_code == 201

    r2 = client.post(
        "/api/articles/",
        {"title": "Another valid", "url": "https://ex.com/dup"},
        format="json",
    )
    assert r2.status_code == 400
    assert r2.data["code"] == "duplicate_url"
    assert "déjà utilisée" in r2.data["message"]


def test_get_unknown_id_returns_404_not_found():
    r = client.get("/api/articles/999999/")
    assert r.status_code == 404
    assert r.data["code"] == "not_found"
    assert "introuvable" in r.data["message"]
