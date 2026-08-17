"""Healthcheck antecipado — responde antes da validação de ALLOWED_HOSTS.

O probe da Railway envia Host header interno (IP/nome privado) que não está em
ALLOWED_HOSTS; sem isto o healthcheck receberia 400 e o deploy falhava.
"""
from django.http import JsonResponse


class HealthCheckMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/api/v1/health/":
            return JsonResponse({"status": "ok"})
        return self.get_response(request)