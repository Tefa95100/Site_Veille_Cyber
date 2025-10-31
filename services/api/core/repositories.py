from core.models import Article
from django.db import IntegrityError


class ArticleRepository:

    class NotFound(Exception):
        pass

    class UniqueViolation(Exception):
        pass

    def get(self, pk: int) -> Article:
        try:
            return Article.objects.get(pk=pk)
        except Article.DoesNotExist:
            raise self.NotFound()

    def list(self, **filters):
        qs = Article.objects.all()

        theme = filters.get("theme")
        if theme:
            if isinstance(theme, list):
                qs = qs.filter(theme__in=theme)
            else:
                qs = qs.filter(theme=theme)

        return qs.order_by("-publish_date", "-created_at")

    def exists_url(self, url: str) -> bool:
        return Article.objects.filter(url=url).exists()

    def create(self, **fields) -> Article:
        try:
            return Article.objects.create(**fields)
        except IntegrityError as e:
            raise self.UniqueViolation() from e

    def update(self, obj: Article, **fields) -> Article:
        for k, v in fields.items():
            if v is not None:
                setattr(obj, k, v)

        try:
            obj.save(update_fields=[k for k, v in fields.items() if v is not None])
            return obj
        except IntegrityError as e:
            raise self.UniqueViolation() from e

    def delete(self, obj: Article) -> None:
        obj.delete()
