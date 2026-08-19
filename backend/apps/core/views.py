"""Endpoints utilitários do core."""
import uuid

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.files.storage import default_storage
from django.db import connection
from django.db.models import DecimalField, Sum, Value
from django.db.models.functions import Coalesce, TruncMonth
from django.utils import timezone
from rest_framework import serializers, status, views
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .permissions import CanUploadMedia, IsStaff

User = get_user_model()

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


class DashboardStatsView(views.APIView):
    """GET /dashboard/ — estatísticas agregadas do backoffice (staff)."""

    permission_classes = [IsStaff]

    def get(self, request):
        from apps.catalog.models import Product
        from apps.cms.models import ContactMessage, Newsletter
        from apps.commerce.models import Order, OrderStatus
        from apps.quotes.models import QuoteRequest, QuoteStatus

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
        recent_orders = list(
            Order.objects.select_related("user")
            .order_by("-created_at")[:5]
            .values("order_number", "status", "total", "created_at", "guest_email")
        )
        recent_quotes = list(
            QuoteRequest.objects.order_by("-created_at")[:5].values(
                "public_id", "status", "name", "email", "phone", "created_at"
            )
        )
        recent_contacts = list(
            ContactMessage.objects.order_by("-created_at")[:5].values("name", "email", "subject", "is_read", "created_at")
        )

        return Response(
            {
                "revenue": float(revenue),
                "orders": {
                    "total": Order.objects.count(),
                    "by_status": {
                        value: Order.objects.filter(status=value).count()
                        for value in OrderStatus.values
                    },
                },
                "quotes": {
                    "total": QuoteRequest.objects.count(),
                    "by_status": {
                        value: QuoteRequest.objects.filter(status=value).count()
                        for value in QuoteStatus.values
                    },
                    "overdue_follow_ups": QuoteRequest.objects.filter(
                        status=QuoteStatus.NEW, next_follow_up_at__lt=timezone.now()
                    ).count(),
                },
                "contacts": {
                    "total": ContactMessage.objects.count(),
                    "unread": ContactMessage.objects.filter(is_read=False).count(),
                },
                "newsletter_subscribers": Newsletter.objects.filter(is_active=True).count(),
                "users": {"total": User.objects.count(), "staff": User.objects.filter(is_staff=True).count()},
                "products": {
                    "total": Product.objects.count(),
                    "active": Product.objects.filter(is_active=True).count(),
                    "low_stock": Product.objects.filter(is_active=True, stock__lte=5).count(),
                },
                "monthly_revenue": [
                    {"month": row["month"].strftime("%Y-%m") if row["month"] else "", "total": float(row["total"])}
                    for row in monthly_revenue
                ],
                "recent": {"orders": recent_orders, "quotes": recent_quotes, "contacts": recent_contacts},
            }
        )
