import pytest
from core.services import ArticleService
from core.dtos import ArticleCreateDTO

pytestmark = pytest.mark.django_db


def test_create_and_get_article():
    svc = ArticleService()
    dto = svc.create(ArticleCreateDTO(title="Zero Trust", url="https://ex.com/zt", theme="sécurité"))
    got = svc.get(dto.id)
    assert got.title == "Zero Trust"
    assert got.url == "https://ex.com/zt"
