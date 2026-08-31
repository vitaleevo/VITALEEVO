"""Endpoints utilitários do core."""

import io
import logging
from datetime import timedelta
from pathlib import Path
import uuid

import django_rq
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import connection
from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from rq import Worker
from rest_framework import serializers, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .permissions import CanUploadMedia, IsStaff

User = get_user_model()
health_logger = logging.getLogger("vitaleevo.health")

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/gif": ".gif",
    "image/avif": ".avif",
}
ALLOWED_IMAGE_EXTENSIONS = {
    "image/jpeg": {".jpg", ".jpeg"},
    "image/png": {".png"},
    "image/webp": {".webp"},
    "image/gif": {".gif"},
    "image/avif": {".avif"},
}
MAX_UPLOAD_BYTES = 15 * 1024 * 1024
HEALTHY_WORKER_STATES = {"started", "idle", "busy"}


def detect_image_content_type(header: bytes) -> str | None:
    if header.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if header.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if header.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(header) >= 12 and header[:4] == b"RIFF" and header[8:12] == b"WEBP":
        return "image/webp"
    if len(header) >= 12 and header[4:8] == b"ftyp" and header[8:12] in {b"avif", b"avis"}:
        return "image/avif"
    return None


class UploadSerializer(serializers.Serializer):
    file = serializers.FileField()

    def validate_file(self, value):
        if value.size > MAX_UPLOAD_BYTES:
            raise serializers.ValidationError("Ficheiro excede 15 MB.")
        header = value.read(32)
        value.seek(0)
        detected_type = detect_image_content_type(header)
        if detected_type is None:
            raise serializers.ValidationError("Conteúdo inválido (use JPG, PNG, WebP, GIF ou AVIF).")
        extension = Path(value.name).suffix.lower()
        if extension not in ALLOWED_IMAGE_EXTENSIONS[detected_type]:
            raise serializers.ValidationError("A extensão não corresponde ao conteúdo do ficheiro.")
        value.detected_content_type = detected_type
        return value


@api_view(["GET"])
@permission_classes([AllowAny])
def health_live(request):
    """Liveness: confirma apenas que o processo Django responde."""
    return Response({"status": "ok"})


@api_view(["GET"])
@permission_classes([AllowAny])
def health_ready(request):
    """Readiness: confirma PostgreSQL e Redis antes de receber tráfego."""
    dependencies = {"db": False, "redis": False}
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        dependencies["db"] = True
    except Exception:  # noqa: BLE001 — readiness converte falhas em 503
        health_logger.warning("dependency_unavailable", extra={"dependency": "db"}, exc_info=True)

    try:
        dependencies["redis"] = bool(django_rq.get_connection("default").ping())
    except Exception:  # noqa: BLE001 — readiness converte falhas em 503
        health_logger.warning("dependency_unavailable", extra={"dependency": "redis"}, exc_info=True)

    is_ready = all(dependencies.values())
    return Response(
        {"status": "ok" if is_ready else "unavailable", "dependencies": dependencies},
        status=status.HTTP_200_OK if is_ready else status.HTTP_503_SERVICE_UNAVAILABLE,
    )


@api_view(["GET"])
@permission_classes([AllowAny])
def health_worker(request):
    """Confirma que existe um worker RQ com heartbeat recente."""
    try:
        connection = django_rq.get_connection("default")
        now = timezone.now()
        workers = Worker.all(connection=connection)
        active = [
            worker
            for worker in workers
            if worker.last_heartbeat
            and worker.get_state() in HEALTHY_WORKER_STATES
            and now - worker.last_heartbeat
            <= timedelta(seconds=max(int(worker.worker_ttl or 0), 90) + 30)
        ]
    except Exception:  # noqa: BLE001 — healthcheck converte falhas em 503
        health_logger.warning("dependency_unavailable", extra={"dependency": "rq_worker"}, exc_info=True)
        active = []
    return Response(
        {"status": "ok" if active else "unavailable", "active_workers": len(active)},
        status=status.HTTP_200_OK if active else status.HTTP_503_SERVICE_UNAVAILABLE,
    )


def _make_thumbnail(data: bytes, max_size: tuple[int, int] = (400, 400)) -> bytes | None:
    try:
        from PIL import Image
        with Image.open(io.BytesIO(data)) as im:
            if im.mode in ("RGBA", "LA", "P"):
                bg = Image.new("RGB", im.size, (255, 255, 255))
                if im.mode == "P":
                    im = im.convert("RGBA")
                bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
                im = bg
            elif im.mode != "RGB":
                im = im.convert("RGB")
            thumb = im.copy()
            thumb.thumbnail(max_size, Image.LANCZOS)
            out = io.BytesIO()
            thumb.save(out, format="JPEG", quality=82, optimize=True)
            return out.getvalue()
    except Exception:
        return None


@api_view(["POST"])
@permission_classes([CanUploadMedia])
def upload_image(request):
    """POST /media/upload/ — multipart 'file' → {url, filename, size, thumb_url}."""
    serializer = UploadSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    uploaded = serializer.validated_data["file"]
    content_type = uploaded.detected_content_type
    ext = ALLOWED_IMAGE_TYPES[content_type]
    filename = f"uploads/{uuid.uuid4().hex}{ext}"
    # Guarda original via storage (S3 em prod, local em dev)
    stored = default_storage.save(filename, uploaded)
    url = request.build_absolute_uri(default_storage.url(stored))
    # Miniatura 400x400 para catálogo (thumb_uploads/...)
    thumb_url = url
    try:
        uploaded.seek(0)
        data = uploaded.read()
        thumb_data = _make_thumbnail(data)
        if thumb_data:
            thumb_name = f"uploads/thumb_{Path(filename).name.rsplit('.',1)[0]}.jpg"
            from django.core.files.base import ContentFile
            thumb_stored = default_storage.save(thumb_name, ContentFile(thumb_data))
            thumb_url = request.build_absolute_uri(default_storage.url(thumb_stored))
    except Exception:
        pass
    return Response({
        "url": url,
        "thumb_url": thumb_url,
        "filename": stored,
        "size": uploaded.size,
        "content_type": content_type,
    })


class DashboardStatsView(views.APIView):
    """GET /dashboard/ — estatísticas agregadas do backoffice (staff)."""

    permission_classes = [IsStaff]

    def get(self, request):
        from apps.catalog.models import Product
        from apps.cms.models import ContactMessage, Newsletter
        from apps.commerce.models import Order, OrderStatus
        from apps.quotes.models import QuoteRequest, QuoteStatus

        user = request.user
        can_orders = user.has_capability("orders:read") or user.has_capability("orders:manage")
        can_quotes = user.has_capability("quotes:read") or user.has_capability("quotes:manage")
        can_contacts = user.has_capability("contacts:manage")
        can_users = user.has_capability("users:manage")
        can_catalog = user.has_capability("catalog:read") or user.has_capability("catalog:manage")

        payload = {"recent": {}}

        if can_orders:
            revenue = (
                Order.objects.exclude(status=OrderStatus.CANCELLED)
                .aggregate(total=Coalesce(Sum("total"), 0, output_field=DecimalField()))
                ["total"]
            )
            six_months_ago = timezone.now() - timezone.timedelta(days=180)
            monthly_revenue = list(
                Order.objects.exclude(status=OrderStatus.CANCELLED)
                .filter(created_at__gte=six_months_ago)
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(total=Coalesce(Sum("total"), 0, output_field=DecimalField()))
                .order_by("month")
                .values("month", "total")
            )
            payload.update({
                "revenue": float(revenue),
                "orders": {
                    "total": Order.objects.count(),
                    "by_status": {
                        value: Order.objects.filter(status=value).count()
                        for value in OrderStatus.values
                    },
                },
                "monthly_revenue": [
                    {"month": row["month"].strftime("%Y-%m") if row["month"] else "", "total": float(row["total"])}
                    for row in monthly_revenue
                ],
            })
            payload["recent"]["orders"] = list(
                Order.objects.order_by("-created_at")[:5].values(
                    "order_number", "status", "total", "created_at", "guest_email"
                )
            )

        if can_quotes:
            payload["quotes"] = {
                "total": QuoteRequest.objects.count(),
                "by_status": {
                    value: QuoteRequest.objects.filter(status=value).count()
                    for value in QuoteStatus.values
                },
                "overdue_follow_ups": QuoteRequest.objects.filter(
                    status=QuoteStatus.NEW, next_follow_up_at__lt=timezone.now()
                ).count(),
            }
            payload["recent"]["quotes"] = list(
                QuoteRequest.objects.order_by("-created_at")[:5].values(
                    "public_id", "status", "name", "email", "phone", "created_at"
                )
            )

        if can_contacts:
            payload.update({
                "contacts": {
                    "total": ContactMessage.objects.count(),
                    "unread": ContactMessage.objects.filter(is_read=False).count(),
                },
                "newsletter_subscribers": Newsletter.objects.filter(is_active=True).count(),
            })
            payload["recent"]["contacts"] = list(
                ContactMessage.objects.order_by("-created_at")[:5].values(
                    "name", "email", "subject", "is_read", "created_at"
                )
            )

        if can_users:
            payload["users"] = {
                "total": User.objects.count(),
                "staff": User.objects.filter(is_staff=True).count(),
            }

        if can_catalog:
            payload["products"] = {
                "total": Product.objects.count(),
                "active": Product.objects.filter(is_active=True).count(),
                "low_stock": Product.objects.filter(is_active=True, stock__lte=5).count(),
            }

        return Response(payload)
