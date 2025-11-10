import re
from datetime import datetime
from datetime import timezone as dt_timezone

import feedparser
from django.db import transaction
from django.utils import timezone

from app.utils.ai import detect_theme, summarize_article
from core.models import Article, FeedSource

MAX_CONTENT_CHARS = 3000

IMG_TAG_RE = re.compile(r'<img[^>]+src="([^"]+)"', re.IGNORECASE)


def _to_dt(entry):
    if hasattr(entry, "published_parsed") and entry.published_parsed:
        return datetime(*entry.published_parsed[:6], tzinfo=dt_timezone.utc)
    return None


def _extract_image_url(entry) -> str | None:
    enclosures = entry.get("enclosures") or getattr(entry, "enclosures", None)
    if enclosures:
        first = enclosures[0]
        url = first.get("url")
        if url:
            return url

    media_content = entry.get("media_content") or getattr(entry, "media_content", None)
    if media_content:
        url = media_content[0].get("url")
        if url:
            return url

    media_thumb = entry.get("media_thumbnail") or getattr(
        entry, "media_thumbnail", None
    )
    if media_thumb:
        url = media_thumb[0].get("url")
        if url:
            return url

    desc = entry.get("description") or entry.get("summary") or ""
    if desc:
        m = IMG_TAG_RE.search(desc)
        if m:
            return m.group(1)

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

        image_url = _extract_image_url(entry)
        if image_url:
            print(f"  [RSS] image trouvée pour {url}: {image_url}")

        Article.objects.create(
            title=entry.get("title", "Sans titre"),
            url=url,
            summary=summary,
            theme=theme,
            image_url=image_url,
            publish_date=entry_dt,
        )

    feed.last_fetched_at = now
    feed.save()
    print(f"[RSS] Fin du flux: {feed.url}")


def import_all_feeds():
    for feed in FeedSource.objects.all():
        import_one_feed(feed)
