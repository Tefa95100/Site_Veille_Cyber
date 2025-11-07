from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from core.models import InterestCenter

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
