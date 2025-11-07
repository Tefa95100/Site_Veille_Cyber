from django.contrib import admin
from django.contrib.auth import get_user_model

from .models import InterestCenter
from .models import FeedSource

User = get_user_model()


@admin.register(InterestCenter)
class InterestCenterAdmin(admin.ModelAdmin):
    list_display = ("user", "theme")
    list_filter = ("theme",)
    search_fields = ("user__username", "user__email", "theme")


@admin.register(FeedSource)
class FeedSourceAdmin(admin.ModelAdmin):
    list_display = ("url", "last_fetched_at")
