from django.core.exceptions import ValidationError


class NumberValidator:
    def validate(self, password, user=None):
        if not any(c.isdigit() for c in password):
            raise ValidationError("Le mot de passe doit contenir au moins un chiffre.")

    def get_help_text(self):
        return "Votre mot de passe doit contenir au moins un chiffre."


class SpecialCharValidator:
    SPECIALS = "!@#$%^&*()-_=+[]{};:,<.>/?|\\"

    def validate(self, password, user=None):
        if not any(c in self.SPECIALS for c in password):
            raise ValidationError(
                "Le mot de passe doit contenir au moins un caractère spécial."
            )

    def get_help_text(self):
        return "Votre mot de passe doit contenir au moins un caractère spécial."
