import pytest
from core.services import ArticleService
from core.dtos import ArticleCreateDTO
from core.exceptions import ValidationError, NotFound

pytestmark = pytest.mark.django_db


def test_create_and_get_article():
    svc = ArticleService()
    dto = svc.create(
        ArticleCreateDTO(title="Zero Trust", url="https://ex.com/zt", theme="sécurité")
    )
    got = svc.get(dto.id)
    assert got.title == "Zero Trust"
    assert got.url == "https://ex.com/zt"


def test_create_invalid_url_raises():
    svc = ArticleService()
    with pytest.raises(ValidationError):
        svc.create(ArticleCreateDTO(title="X", url="notaurl", theme="sécurité"))


def test_get_unknown_id_raises():
    svc = ArticleService()
    with pytest.raises(NotFound):
        svc.get(999999)


def test_create_invalid_url_format_raises():
    svc = ArticleService()
    with pytest.raises(ValidationError):
        svc.create(ArticleCreateDTO(title="Ok", url="notaurl", theme="sécurité"))
