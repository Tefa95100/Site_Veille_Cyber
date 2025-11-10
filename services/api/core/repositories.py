from django.db import IntegrityError

from core.api.serializers import to_english_theme
from core.models import Article, InterestCenter


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

    def list_for_user(self, user=None, theme=None):
        qs = Article.objects.all()

        if user and user.is_authenticated:
            interests = list(
                InterestCenter.objects.filter(user=user).values_list("theme", flat=True)
            )
            user_themes = [to_english_theme(t) for t in interests]
            if user_themes:
                qs = qs.filter(theme__in=user_themes)

        if theme:
            if isinstance(theme, (list, tuple)):
                norm = [to_english_theme(t) for t in theme]
                qs = qs.filter(theme__in=norm)
            else:
                qs = qs.filter(theme=to_english_theme(theme))

        return qs.order_by("-publish_date", "-created_at")

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
        theme = fields.get("theme")
        if theme:
            fields["theme"] = to_english_theme(theme)
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
