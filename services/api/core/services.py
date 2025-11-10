from django.core.exceptions import ValidationError as DjangoValError
from django.core.validators import URLValidator

from core.dtos import ArticleCreateDTO, ArticleDTO, ArticleUpdateDTO
from core.exceptions import NotFound, ValidationError
from core.repositories import ArticleRepository

_url_validator = URLValidator()


def _validate_url_format(url: str) -> None:
    try:
        _url_validator(url)
    except DjangoValError:
        raise ValidationError("url invalide")


def _to_dto(art) -> ArticleDTO:
    return ArticleDTO(
        id=art.id,
        title=art.title,
        url=art.url,
        theme=art.theme,
        summary=art.summary,
        image_url=art.image_url,
    )


def _validate_create(dto: ArticleCreateDTO) -> None:
    if not dto.title or len(dto.title.strip()) < 3:
        raise ValidationError("titre trop court")
    if not dto.url:
        raise ValidationError("url obligatoire")


def _validate_update(dto: ArticleUpdateDTO) -> None:
    if dto.title is not None and len(dto.title.strip()) < 3:
        raise ValidationError("titre trop court")


class ArticleService:
    def __init__(self, repo: ArticleRepository | None = None):
        self.repo = repo or ArticleRepository()

    def create(self, dto: ArticleCreateDTO) -> ArticleDTO:
        _validate_create(dto)
        _validate_url_format(dto.url)

        if hasattr(self.repo, "exists_url") and self.repo.exists_url(dto.url):
            raise ValidationError("url déjà utilisée", code="duplicate_url")

        try:
            art = self.repo.create(
                title=dto.title.strip(), url=dto.url, theme=dto.theme
            )
        except self.repo.UniqueViolation:
            raise ValidationError("url déjà utilisée", code="duplicate_url")
        return _to_dto(art)

    def get(self, pk: int) -> ArticleDTO:
        try:
            return _to_dto(self.repo.get(pk))
        except Exception:
            raise NotFound(f"Article {pk} introuvable")

    def list(self, user=None, theme=None) -> list[ArticleDTO]:
        return [_to_dto(art) for art in self.repo.list_for_user(user=user, theme=theme)]

    def update(self, pk: int, dto: ArticleUpdateDTO) -> ArticleDTO:
        _validate_update(dto)
        try:
            art = self.repo.get(pk)
        except Exception:
            raise NotFound(f"Article {pk} introuvable")

        new_url = dto.url if dto.url is not None else art.url
        _validate_url_format(new_url)

        if (
            dto.url is not None
            and hasattr(self.repo, "exists_url_other")
            and self.repo.exists_url_other(pk, new_url)
        ):
            raise ValidationError("url déjà utilisée", code="duplicate_url")

        try:
            art = self.repo.update(
                art,
                title=(dto.title.strip() if dto.title is not None else None),
                url=dto.url,
                theme=dto.theme,
            )
        except self.repo.UniqueViolation:
            raise ValidationError("url déjà utilisée", code="duplicate_url")
        return _to_dto(art)

    def delete(self, pk: int) -> None:
        try:
            art = self.repo.get(pk)
        except Exception:
            raise NotFound(f"Article {pk} introuvable")
        self.repo.delete(art)
