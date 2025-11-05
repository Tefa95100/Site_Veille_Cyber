from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models


class User(models.Model):
    name = models.CharField(max_length=120)
    email = models.EmailField(unique=True)
    # hash in app
    password = models.CharField(max_length=128)
    registration_date = models.DateField()

    class Meta:
        db_table = "user"  # name of table
        # order by default (more recently in first)
        ordering = ["-registration_date"]
        indexes = [models.Index(fields=["email"])]

    def __str__(self):
        return f"{self.nom} <{self.email}>"


class InterestCenter(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="interest_center",
    )
    theme = models.CharField(max_length=120)

    class Meta:
        db_table = "interest_center"
        # An user can have only one theme
        unique_together = (("user", "theme"),)
        indexes = [models.Index(fields=["theme"])]

    def __str__(self):
        return f"{self.theme} (user={self.utilisateur_id})"


class Result(models.Model):
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="results",
    )
    module = models.ForeignKey(
        "Module", on_delete=models.CASCADE, related_name="results"
    )
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )

    class Meta:
        db_table = "result"
        ordering = ["-score"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "module"], name="uniq_result_user_module"
            )
        ]
        indexes = [models.Index(fields=["user", "module"])]

    def __str__(self) -> str:
        # Choisis un identifiant lisible de l'utilisateur et du module
        user_label = getattr(self.user, "username", None) or getattr(
            self.user, "email", str(self.user_id)
        )
        module_label = getattr(self.module, "titre", None) or getattr(
            self.module, "title", str(self.module_id)
        )
        return f"Result(user={
            user_label}, module={module_label}, score={self.score})"


class Module(models.Model):
    title = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True, default="")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "module"
        ordering = ["title"]  # default sort by title
        indexes = [
            models.Index(fields=["title"]),
        ]

    def __str__(self) -> str:
        return self.title


class Quizz(models.Model):
    module = models.ForeignKey(
        "Module",
        on_delete=models.CASCADE,
        related_name="quizz",  # a module has several quizzes
    )
    question = models.CharField(max_length=500)
    correct_answer = models.CharField(max_length=500)

    class Meta:
        db_table = "quizz"
        ordering = ["id"]  # simple order
        indexes = [
            models.Index(fields=["module"]),
        ]

    def __str__(self) -> str:
        return f"Quizz(module={
            self.module_id}, question={self.question[:30]}…)"


class PossibleChoice(models.Model):
    quizz = models.ForeignKey(
        "Quizz",
        on_delete=models.CASCADE,
        related_name="choix_possibles",
    )
    choice = models.CharField(max_length=500)

    class Meta:
        db_table = "possible_choice"
        ordering = ["id"]
        # Avoid duplicating the same choice for the same quiz
        constraints = [
            models.UniqueConstraint(
                fields=["quizz", "choice"], name="uniq_quizz_choice"
            )
        ]
        indexes = [
            models.Index(fields=["quizz"]),
        ]

    def __str__(self) -> str:
        return f"Choix(quizz={self.quiz_id}, '{self.choix[:30]}…')"


class Article(models.Model):
    title = models.CharField(max_length=300)
    url = models.URLField(unique=True)
    theme = models.CharField(max_length=120, null=True, blank=True)
    summary = models.TextField(blank=True)
    image_url = models.URLField(null=True, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "article"
        ordering = ["-publish_date", "-created_at"]
        indexes = [
            models.Index(fields=["theme"]),
            models.Index(fields=["-publish_date"]),
            models.Index(fields=["-created_at"]),
        ]

    def __str__(self) -> str:
        return f"{self.title} ({self.theme})"


class Favoris(models.Model):
    # a user has multiple favorites
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="favoris",
    )
    # an article can be favorited by several users
    article = models.ForeignKey(
        "Article",
        on_delete=models.CASCADE,
        related_name="favoris",
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "favoris"
        ordering = ["-created_at"]
        constraints = [
            # prevents a duplicate of the same article
            # as a favorite for the same user
            models.UniqueConstraint(
                fields=["user", "article"],
                name="uniq_favoris_user_article",
            ),
        ]
        indexes = [
            models.Index(fields=["user", "article"]),
        ]

    def __str__(self) -> str:
        return f"Favoris(user={
            self.utilisateur_id}, article={self.article_id})"


class FeedSource(models.Model):
    url = models.URLField(unique=True)
    last_fetched_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return self.url
