import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()

def _mk(n):
    """Crée n articles factices."""
    for i in range(n):
        r = client.post(
            "/api/articles/",
            {
                "title": f"Article {i}",
                "url": f"https://ex.com/{i}",
                "theme": "security" if i % 2 == 0 else "pentest",
            },
            format="json",
        )
        assert r.status_code == 201, r.data

def test_pagination_page_1_and_page_2():
    _mk(30)

    r1 = client.get("/api/articles/?page=1")
    assert r1.status_code == 200
    body1 = r1.json()

    assert "count" in body1
    assert "next" in body1
    assert "previous" in body1
    assert "results" in body1

    assert len(body1["results"]) > 0

    r2 = client.get("/api/articles/?page=2")
    assert r2.status_code == 200
    body2 = r2.json()

    assert body2["previous"] is not None
    assert body2["results"] != body1["results"]
