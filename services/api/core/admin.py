from django.contrib import admin
from django.contrib.auth import get_user_model
from .models import BestPractice, Favorite

from .models import FeedSource, InterestCenter

User = get_user_model()


@admin.register(InterestCenter)
class InterestCenterAdmin(admin.ModelAdmin):
    list_display = ("user", "theme")
    list_filter = ("theme",)
    search_fields = ("user__username", "user__email", "theme")


@admin.register(FeedSource)
class FeedSourceAdmin(admin.ModelAdmin):
    list_display = ("url", "last_fetched_at")


@admin.register(BestPractice)
class BestPracticeAdmin(admin.ModelAdmin):
    list_display = ("title", "created_at")
    search_fields = ("title",)


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("user", "content_type", "object_id", "created_at")
    list_filter = ("content_type",)
