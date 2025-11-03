import os
import requests

OLLAMA_HOST = os.environ.get("OLLAMA_HOST", "http://localhost:11434")
MODEL_NAME = os.environ.get("OLLAMA_MODEL", "mistral")


def ollama_generate(prompt: str) -> str:
    """
    Appelle Ollama et renvoie le texte généré (réponse brute).
    """
    url = f"{OLLAMA_HOST}/api/generate"
    resp = requests.post(
        url,
        json={
            "model": MODEL_NAME,
            "prompt": prompt,
            "stream": False,
        },
        timeout=60,
    )
    resp.raise_for_status()
    data = resp.json()
    return data.get("response", "").strip()


def summarize_article(content: str) -> str:
    prompt = (
        "Résume le texte suivant en 3 phrases maximum, en français, clair et concis.\n\n"
        f"TEXTE:\n{content}\n\nRÉSUMÉ:"
    )
    return ollama_generate(prompt)


def detect_theme(content: str) -> str:
    prompt = (
        "Lis le texte suivant et donne UNIQUEMENT le thème principal parmi cette liste : "
        "sécurité, cloud, pentest, intelligence artificielle, vulnérabilité, autre.\n"
        "Réponds juste par le thème, sans phrase.\n\n"
        f"TEXTE:\n{content}\n\nTHÈME:"
    )
    return ollama_generate(prompt).lower()
