from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from core.models import Article, BestPractice, Favorite, InterestCenter

User = get_user_model()

THEME_FR_TO_EN = {
    "sécurité": "security",
    "securite": "security",
    "sécurité ": "security",
    "cloud": "cloud",
    "ia": "ai",
    "intelligence artificielle": "ai",
    "vulnérabilité": "vulnerability",
    "vulnerabilite": "vulnerability",
}


def to_english_theme(value: str) -> str:
    if not value:
        return ""
    key = value.strip().lower()
    return THEME_FR_TO_EN.get(key, key)


class ArticleCreateIn(serializers.Serializer):
    title = serializers.CharField(min_length=3, max_length=300)
    url = serializers.URLField()
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    summary = serializers.CharField(allow_blank=True, required=False)
    image_url = serializers.URLField(allow_blank=True, required=False)


class ArticleUpdateIn(serializers.Serializer):
    title = serializers.CharField(min_length=3, max_length=300, required=False)
    url = serializers.URLField(required=False)
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    summary = serializers.CharField(allow_blank=True, required=False)
    image_url = serializers.URLField(allow_blank=True, required=False)


class ArticleOut(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    url = serializers.URLField()
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)
    summary = serializers.CharField(allow_blank=True, required=False)
    image_url = serializers.URLField(allow_blank=True, required=False)
    is_favorite = serializers.SerializerMethodField()

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False

        if isinstance(obj, dict):
            obj_id = obj.get("id")
        else:
            obj_id = getattr(obj, "id", None)

        if not obj_id:
            return False

        ct = ContentType.objects.get_for_model(Article)
        return Favorite.objects.filter(
            user=request.user,
            content_type=ct,
            object_id=obj_id,
        ).exists()


class ArticleQueryIn(serializers.Serializer):
    theme = serializers.ListField(child=serializers.CharField(), required=False)
    ordering = serializers.CharField(required=False)
    page = serializers.IntegerField(required=False, min_value=1)


class RegisterSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    themes = serializers.ListField(
        child=serializers.CharField(max_length=120),
        required=False,
        allow_empty=True,
    )

    def validate_password(self, value):
        validate_password(value)
        return value

    def create(self, validated_data):
        themes = validated_data.pop("themes", [])
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
        )
        for t in themes:
            InterestCenter.objects.create(user=user, theme=to_english_theme(t))
        return user


class UserMeSerializer(serializers.ModelSerializer):
    themes = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "is_staff", "themes"]

    def get_themes(self, obj):
        return list(obj.interest_centers.values_list("theme", flat=True))


class BestPracticeSerializer(serializers.ModelSerializer):
    image = serializers.SerializerMethodField()
    is_favorite = serializers.SerializerMethodField()

    class Meta:
        model = BestPractice
        fields = ["id", "title", "content", "image", "created_at", "is_favorite"]

    def get_image(self, obj):
        if not obj.image:
            return None
        request = self.context.get("request")
        url = obj.image.url
        return request.build_absolute_uri(url) if request else url

    def get_is_favorite(self, obj):
        request = self.context.get("request")
        if not request or request.user.is_anonymous:
            return False
        ct = ContentType.objects.get_for_model(BestPractice)
        return Favorite.objects.filter(
            user=request.user, content_type=ct, object_id=obj.id
        ).exists()


class FavoriteEnrichedSerializer(serializers.ModelSerializer):
    model = serializers.SerializerMethodField()
    title = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()

    class Meta:
        model = Favorite
        fields = [
            "id",
            "model",
            "object_id",
            "title",
            "image",
            "created_at",
        ]

    def get_model(self, obj):
        return obj.content_type.model

    def get_title(self, obj):
        target = obj.content_object
        if not target:
            return None
        return getattr(target, "title", str(target))

    def get_image(self, obj):
        target = obj.content_object
        if not target:
            return None
        image_url = getattr(target, "image_url", None)
        if image_url:
            return image_url
        image_field = getattr(target, "image", None)
        if image_field:
            try:
                return image_field.url
            except ValueError:
                return None
        return None
