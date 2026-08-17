FROM python:3.14-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Dependências primeiro (cache eficiente do Docker).
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

EXPOSE 8000

# Ponto de entrada único: SERVICE_ROLE define o processo.
#   web    → migra, estáticos e gunicorn (API)
#   worker → consome a fila RQ (e-mails, tarefas em background)
#   seed   → carga inicial idempotente (opcional)
CMD ["sh", "-c", "if [ \"$SERVICE_ROLE\" = \"worker\" ]; then exec python manage.py rqworker default; elif [ \"$SERVICE_ROLE\" = \"seed\" ]; then exec python manage.py seed; else exec python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 2 --timeout 60; fi"]