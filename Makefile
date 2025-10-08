# -------- Makefile (root) --------
PROJECT_NAME ?= portfolio

# Chargement éventuel de .env (facultatif)
ifneq (,$(wildcard ./.env))
include .env
export
endif

# Aide
.PHONY: help
help:
	@echo "Available targets:"
	@echo "  make dev             - Build & run all services (compose up)"
	@echo "  make down            - Stop & remove containers"
	@echo "  make ps              - Show containers"
	@echo "  make logs            - Tail all logs"
	@echo "  make dev-api         - Run only API (if defined as a profile/service)"
	@echo "  make dev-frontend    - Run only Frontend"
	@echo "  make migrate         - Django migrate (in container)"
	@echo "  make makemigrations  - Django makemigrations (in container)"
	@echo "  make test            - Run backend & frontend tests"
	@echo "  make lint            - Run linters (backend & frontend)"
	@echo "  make fmt             - Auto-format (backend & frontend)"

# Compose wrapper (ajuste le fichier si nécessaire)
COMPOSE ?= docker compose

.PHONY: dev down ps logs
dev:
	$(COMPOSE) up --build

down:
	$(COMPOSE) down

ps:
	$(COMPOSE) ps

logs:
	$(COMPOSE) logs -f

# --- API (Django) ---
API_SVC ?= api

.PHONY: migrate makemigrations superuser shell
migrate:
	$(COMPOSE) exec $(API_SVC) python manage.py migrate

makemigrations:
	$(COMPOSE) exec $(API_SVC) python manage.py makemigrations

superuser:
	$(COMPOSE) exec $(API_SVC) python manage.py createsuperuser

shell:
	$(COMPOSE) exec $(API_SVC) python manage.py shell

# --- Tests ---
# Remarque : ces commandes supposent que les deps (pytest/coverage ou Django test)
# et ESLint/Prettier sont installés dans les images S1/S4.
.PHONY: test test-api test-frontend
test: test-api test-frontend

test-api:
	$(COMPOSE) exec $(API_SVC) python manage.py test

test-frontend:
	$(COMPOSE) exec frontend npm test -- --watch=false || true

# --- Lint / Format ---
.PHONY: lint lint-api lint-frontend fmt fmt-api fmt-frontend
lint: lint-api lint-frontend

lint-api:
	-$(COMPOSE) exec $(API_SVC) ruff check . && $(COMPOSE) exec $(API_SVC) black --check .

lint-frontend:
	-$(COMPOSE) exec frontend npm run lint

fmt: fmt-api fmt-frontend

fmt-api:
	-$(COMPOSE) exec $(API_SVC) black .

fmt-frontend:
	-$(COMPOSE) exec frontend npm run fmt

# Optionnel: run services individuellement si tu ajoutes des profiles dans compose
.PHONY: dev-api dev-frontend
dev-api:
	$(COMPOSE) up --build $(API_SVC)

dev-frontend:
	$(COMPOSE) up --build frontend
