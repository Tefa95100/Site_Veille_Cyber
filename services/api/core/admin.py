from django.contrib import admin
from .models import FeedSource


@admin.register(FeedSource)
class FeedSourceAdmin(admin.ModelAdmin):
    list_display = ("url", "last_fetched_at")
