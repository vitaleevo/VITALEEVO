"""Endpoints utilitários do core."""
import uuid

from django.core.files.storage import default_storage
from django.db import connection
from rest_framework import serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .permissions import CanUploadMedia

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/svg+xml": ".svg",
    "image/avif": ".avif",
}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if value.content_type not in ALLOWED_IMAGE_TYPES:
            raise serializers.ValidationError("Formato não suportado (use JPG, PNG, WebP, GIF, SVG ou AVIF).")
        if value.size > MAX_UPLOAD_BYTES:
            raise serializers.ValidationError("Ficheiro excede 8 MB.")
        return value


@api_view(["GET"])
@permission_classes([AllowAny])
def health(request):
    """Health check — usado pelo Railway para validar a disponibilidade."""
    db_ok = True
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception:  # noqa: BLE001 — health check deve responder sempre
        db_ok = False

    return Response({"status": "ok" if db_ok else "degraded", "db": db_ok})


@api_view(["POST"])
@permission_classes([CanUploadMedia])
def upload_image(request):
    """POST /media/upload/ — multipart 'file' → {url} (armazenamento local)."""
    serializer = UploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    uploaded = serializer.validated_data["file"]
    ext = ALLOWED_IMAGE_TYPES[uploaded.content_type]
    filename = f"uploads/{uuid.uuid4().hex}{ext}"
    stored = default_storage.save(filename, uploaded)
    url = f"{request.scheme}://{request.get_host()}/media/{stored}"
    return Response({"url": url})