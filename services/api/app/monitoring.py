# services/api/app/monitoring.py
import os
from pathlib import Path
from django.http import JsonResponse


def health(request):
    # doit être ultra-rapide, aucune dépendance réseau/DB
    return JsonResponse({"status": "ok"})


def version(request):
    # 1) priority to environment variable (runtime)
    v = os.getenv("APP_VERSION")
    if not v:
        # 2) fallback: read a file version.txt put in the image at build
        version_file = Path(__file__).resolve().parent.parent / "version.txt"
        if version_file.exists():
            v = version_file.read_text().strip()
        else:
            v = "dev"
    return JsonResponse({"version": v})
