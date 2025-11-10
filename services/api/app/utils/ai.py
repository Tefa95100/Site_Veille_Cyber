from __future__ import annotations

import os
import re

from google import genai

ALLOWED_THEMES = {
    "sécurité": "security",
    "security": "security",
    "cloud": "cloud",
    "pentest": "pentest",
    "intelligence artificielle": "ai",
    "ia": "ai",
    "vulnérabilité": "vulnerability",
    "vulnerability": "vulnerability",
    "autre": "other",
    "other": "other",
}


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def summarize_article(content: str) -> str:
    prompt = (
        "Résume le texte suivant en 3 phrases maximum, en français, clair et "
        "concis.\n\n"
        f"{content}"
    )

    try:
        client = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        text = (resp.text or "").strip()
        if text:
            return text
    except Exception as exc:
        print("[AI] Vertex failed:", exc)


def normalize_theme(raw: str) -> str:
    if not raw:
        return "other"
    text = raw.strip().lower()
    for sep in [".", ":", ";", "\n"]:
        if sep in text:
            text = text.split(sep, 1)[0].strip()
    text = text.strip('"').strip("'")

    if text in ALLOWED_THEMES:
        return ALLOWED_THEMES[text]

    if "sécur" in text or "secur" in text:
        return "security"
    if "vulnér" in text or "vulner" in text:
        return "vulnerability"
    if "cloud" in text:
        return "cloud"
    if "pentest" in text:
        return "pentest"
    if "intelligence artificielle" in text or "ia" in text or "ai" in text:
        return "ia"

    return "other"


def detect_theme(content: str) -> str:
    prompt = (
        "Lis le texte suivant et réponds par UN SEUL thème parmi : "
        "sécurité, cloud, pentest, intelligence artificielle, vulnérabilité, "
        "autre.\n"
        "Réponds uniquement par le thème, sans phrase.\n\n"
        f"{content}"
    )

    try:
        client = genai.Client(
            vertexai=True,
            project=os.getenv("GOOGLE_CLOUD_PROJECT"),
            location=os.getenv("GOOGLE_CLOUD_LOCATION", "us-central1"),
        )
        resp = client.models.generate_content(
            model="gemini-2.0-flash",
            contents=prompt,
        )
        return normalize_theme(resp.text)
    except Exception as exc:
        print("[AI] Vertex theme failed:", exc)
    return "other"
