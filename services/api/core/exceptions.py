from typing import Any, Optional


class DomainError(Exception):
    """
    Base de toutes les erreurs métier.
    - `message`: lisible pour logs/retours contrôlés
    - `code`: court, utile pour l'API (ex: "not_found", "validation_error")
    - `extra`: dict optionnel avec des détails structurés (ex: champs invalides)
    """

    default_message = "Domain error"
    default_code = "domain_error"

    def __init__(
        self,
        message: Optional[str] = None,
        *,
        code: Optional[str] = None,
        extra: Optional[dict[str, Any]] = None,
    ) -> None:
        self.message = message or self.default_message
        self.code = code or self.default_code
        self.extra = extra or {}
        super().__init__(self.message)

    def __str__(self) -> str:
        base = f"{self.code}: {self.message}"
        if self.extra:
            return f"{base} | extra={self.extra}"
        return base


class ValidationError(DomainError):
    """Données invalides (ex: titre trop court, format URL invalide…)."""

    default_message = "Invalid data"
    default_code = "validation_error"


class NotFound(DomainError):
    """Ressource introuvable (ex: Article 123)."""

    default_message = "Resource not found"
    default_code = "not_found"
