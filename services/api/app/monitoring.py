import os
from pathlib import Path

from django.http import JsonResponse


def health(request):
    return JsonResponse({"status": "ok"})


def version(request):
    v = os.getenv("APP_VERSION")
    if not v:
        version_file = Path(__file__).resolve().parent.parent / "version.txt"
        if version_file.exists():
            v = version_file.read_text().strip()
        else:
            v = "dev"
    return JsonResponse({"version": v})
