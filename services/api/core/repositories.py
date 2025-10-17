from core.models import Article


class ArticleRepository:
    def get(self, pk: int) -> Article:
        return Article.objects.get(pk=pk)

    def list(self, **filters):
        return Article.objects.filter(**filters).order_by(
            "-publish_date", "-created_at")

    def create(self, **fields) -> Article:
        return Article.objects.create(**fields)

    def update(self, obj: Article, **fields) -> Article:
        for k, v in fields.items():
            if v is not None:
                setattr(obj, k, v)
        obj.save(update_fields=[k for k, v in fields.items() if v is not None])
        return obj

    def delete(self, obj: Article) -> None:
        obj.delete()
