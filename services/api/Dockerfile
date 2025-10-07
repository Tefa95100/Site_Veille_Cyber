FROM python:3.12-slim

RUN apt-get update \
	&& apt-get install -y --no-install-recommends curl \
	&& rm -rf /var/lib/apt/lists/*
ARG APP_VERSION=dev
ENV APP_VERSION=${APP_VERSION}
WORKDIR /app
RUN printf "%s" "${APP_VERSION}" > /app/version.txt
COPY requirements.txt .
RUN python -m pip install --upgrade pip \
	&& pip install -r requirements.txt
COPY . .
EXPOSE 8000
HEALTHCHECK --interval=10s --timeout=2s --retries=5 \
	CMD curl -fsS http://localhost:8000/health || exit 1
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]