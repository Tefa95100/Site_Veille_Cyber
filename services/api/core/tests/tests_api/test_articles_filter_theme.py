import pytest
from rest_framework.test import APIClient

pytestmark = pytest.mark.django_db
client = APIClient()


def test_list_articles_filtered_by_multiple_themes():

    r1 = client.post(
        "/api/articles/",
        {
            "title": "Ransomware Playbook",
            "url": "https://ex.com/a",
            "theme": "security",
        },
        format="json",
    )
    assert r1.status_code == 201, r1.data

    r2 = client.post(
        "/api/articles/",
        {
            "title": "Pentest Methodology",
            "url": "https://ex.com/b",
            "theme": "pentest",
        },
        format="json",
    )
    assert r2.status_code == 201, r2.data

    r3 = client.post(
        "/api/articles/",
        {
            "title": "Cloud Cost Optimization",
            "url": "https://ex.com/c",
            "theme": "cloud",
        },
        format="json",
    )
    assert r3.status_code == 201, r3.data

    response = client.get(
        "/api/articles/?theme=security&theme=pentest",
        format="json",
    )

    assert response.status_code == 200, response.data

    themes_returned = {article["theme"] for article in response.data["results"]}

    assert themes_returned == {"security", "pentest"}

    for article in response.data["results"]:
        assert article["theme"] in ("security", "pentest")
        assert article["theme"] != "cloud"
