from rest_framework import serializers


class ArticleCreateIn(serializers.Serializer):
    title = serializers.CharField(min_length=3, max_length=300)
    url = serializers.URLField()
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class ArticleUpdateIn(serializers.Serializer):
    title = serializers.CharField(min_length=3, max_length=300, required=False)
    url = serializers.URLField(required=False)
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class ArticleOut(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    url = serializers.URLField()
    theme = serializers.CharField(allow_null=True, allow_blank=True, required=False)


class ArticleQueryIn(serializers.Serializer):
    theme = serializers.ListField(child=serializers.CharField(), required=False)
    ordering = serializers.CharField(required=False)
    page = serializers.IntegerField(required=False, min_value=1)
