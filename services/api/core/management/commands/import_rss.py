from django.core.management.base import BaseCommand
from app import rss_import


class Command(BaseCommand):
    help = "Récupère les articles depuis les flux RSS et les enrichit avec l'IA."

    def handle(self, *args, **options):
        rss_import.import_all_feeds()
        self.stdout.write(self.style.SUCCESS("Import RSS terminé"))
