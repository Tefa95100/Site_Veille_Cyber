# syntax=docker/dockerfile:1.6

# ---- Builder ----
FROM python:3.12.6-slim-bookworm AS Builder

ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
# 1) Dependancies: copy only manifest for cache
COPY requirements*.txt ./
# 2) Install deps in a venv, with cache pip BuildKit
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --upgrade pip && \
    pip install --no-cache-dir -r requirements-dev.txt
# 3) Copy code
COPY . .
ARG APP_VERSION=dev
RUN printf "%s" "${APP_VERSION}" > /app/version.txt

# ---- Runtime ----
FROM python:3.12-slim-bookworm AS Runtime

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/*
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1
WORKDIR /app
# Copy from builder
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
COPY --from=builder /app /app
ARG APP_VERSION=dev
RUN printf "%s" "${APP_VERSION}" > /app/version.txt
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=2s --retries=5 \
	CMD curl -fsS http://localhost:8000/health || exit 1
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]