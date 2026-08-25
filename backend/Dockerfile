FROM python:3.14-slim AS builder

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

COPY requirements.txt .
RUN python -m venv /opt/venv \
    && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.14-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PORT=8080

WORKDIR /app

RUN groupadd --system vitaleevo \
    && useradd --system --gid vitaleevo --home-dir /app vitaleevo

COPY --from=builder /opt/venv /opt/venv
COPY --chown=vitaleevo:vitaleevo . .

RUN SECRET_KEY=build-only-secret-key-change-me-1234567890 \
    DJANGO_SETTINGS_MODULE=config.settings.development \
    python manage.py collectstatic --noinput

USER vitaleevo

EXPOSE 8080

CMD ["sh", "-c", "exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT} --workers ${WEB_CONCURRENCY:-2} --timeout 60 --access-logfile - --error-logfile -"]
