import os
import re
import requests

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
OLLAMA_MODEL = os.environ.get("OLLAMA_MODEL", "phi")


def _strip_html(text: str) -> str:
    return re.sub(r"<[^>]+>", "", text or "").strip()


def ollama_generate(prompt: str) -> str:
    url = f"{OLLAMA_HOST}/api/generate"
    try:
        resp = requests.post(
            url,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
            },
            timeout=60,
        )
        if resp.status_code != 200:
            print(f"[OLLAMA] HTTP {resp.status_code} : {resp.text[:200]}")
            return ""
        data = resp.json()
        return data.get("response", "").strip()
    except Exception as e:
        print(f"[OLLAMA] erreur: {e}")
        return ""


def summarize_article(content: str) -> str:
    content = _strip_html(content)
    prompt = (
        "Tu es un assistant qui résume des articles de cybersécurité en français.\n"
        "Résume le texte suivant en 2-3 phrases maximum, sans détails inutiles.\n\n"
        f"TEXTE:\n{content}\n\nRÉSUMÉ:"
    )
    return ollama_generate(prompt)


def detect_theme(content: str) -> str:
    content = _strip_html(content)
    prompt = (
        "Lis le texte et donne uniquement un thème parmi : "
        "sécurité, vulnérabilité, ransomware, cloud, pentest, IA, autre.\n"
        "Réponds juste par le thème.\n\n"
        f"TEXTE:\n{content}\n\nTHÈME:"
    )
    return ollama_generate(prompt).lower()
