FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependências primeiro (cache eficiente do Docker).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8080

# Ponto de entrada único: SERVICE_ROLE define o processo.
#   web    → migra, estáticos e gunicorn (API) — escuta em PORT (Railway: 8080)
#   worker → consome a fila RQ (e-mails, tarefas em background)
#   seed   → carga inicial idempotente (opcional)
CMD ["sh", "-c", "if [ \"$SERVICE_ROLE\" = \"worker\" ]; then exec python manage.py rqworker default; elif [ \"$SERVICE_ROLE\" = \"seed\" ]; then exec python manage.py seed; else python manage.py migrate --noinput && python manage.py collectstatic --noinput && exec gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8080} --workers 2 --timeout 60; fi"]