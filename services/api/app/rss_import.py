from datetime import datetime
from datetime import timezone as dt_timezone

import feedparser
from django.db import transaction
from django.utils import timezone

from app.utils.ollama import detect_theme, summarize_article
from core.models import Article, FeedSource

MAX_CONTENT_CHARS = 3000


def _to_dt(entry):
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        return datetime(*entry.published_parsed[:6], tzinfo=dt_timezone.utc)
    return None


@transaction.atomic
def import_one_feed(feed: FeedSource):
    print(f"[RSS] Lecture du flux: {feed.url}")
    parsed = feedparser.parse(feed.url)
    last_fetch = feed.last_fetched_at
    now = timezone.now()

    for entry in parsed.entries:
        url = entry.get("link") or entry.get("id")
        if not url:
            print("  [RSS] entrée sans URL, on saute")
            continue

        if Article.objects.filter(url=url).exists():
            continue

        entry_dt = _to_dt(entry)
        if last_fetch and entry_dt and entry_dt <= last_fetch:
            continue

        raw_content = (
            entry.get("summary") or entry.get("description") or entry.get("title") or ""
        )

        raw_content = raw_content[:MAX_CONTENT_CHARS]

        try:
            summary = summarize_article(raw_content)
            print(f"  [IA] résumé OK pour {url}")
        except Exception as e:
            print(f"  [IA] résumé FAILED pour {url}: {e}")
            summary = ""

        try:
            theme = detect_theme(raw_content)
            print(f"  [IA] thème OK pour {url}: {theme}")
        except Exception as e:
            print(f"  [IA] thème FAILED pour {url}: {e}")
            theme = ""

        Article.objects.create(
            title=entry.get("title", "Sans titre"),
            url=url,
            summary=summary,
            theme=theme,
            publish_date=entry_dt,
        )

    feed.last_fetched_at = now
    feed.save()
    print(f"[RSS] Fin du flux: {feed.url}")


def import_all_feeds():
    for feed in FeedSource.objects.all():
        import_one_feed(feed)
