"""Endpoints do CMS — leitura pública no site; gestão com content:manage / settings:manage."""
from django.core.cache import cache
from django.db import transaction
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListCreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.permissions import HasCapability, user_has_capability

from .models import ContactMessage, LegalDocument, Newsletter, NewsletterBroadcast, Service, Setting, SitePage
from .serializers import (
    ContactMessageSerializer,
    LegalDocumentSerializer,
    NewsletterSerializer,
    NewsletterBroadcastRequestSerializer,
    NewsletterBroadcastSerializer,
    NewsletterUnsubscribeSerializer,
    ServiceAdminSerializer,
    ServiceSerializer,
    SettingSerializer,
    SitePageSerializer,
    SitePageUpsertSerializer,
)
from .services import (
    enqueue_contact_notification,
    enqueue_newsletter_broadcast,
    enqueue_newsletter_welcome,
    publish_page,
    unsubscribe_with_token,
    upsert_page_with_blocks,
)

PUBLIC_SETTING_KEYS = {"site_config"}


class ServiceViewSet(viewsets.ModelViewSet):
    """Serviços — públicos (publicados); gestão com content:manage."""

    lookup_field = "slug"
    search_fields = ["title", "subtitle", "description"]
    ordering_fields = ["order", "created_at"]

    def get_queryset(self):
        qs = Service.objects.all()
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return qs.filter(is_active=True, status="published")
        return qs

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return ServiceSerializer
        return ServiceAdminSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("content:manage")]


class LegalDocumentViewSet(viewsets.ModelViewSet):
    """Documentos legais — públicos (publicados); gestão com content:manage."""

    lookup_field = "slug"
    search_fields = ["title"]
    serializer_class = LegalDocumentSerializer

    def get_queryset(self):
        qs = LegalDocument.objects.all()
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return qs.filter(status="published")
        return qs

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("content:manage")]


class SitePageViewSet(viewsets.ModelViewSet):
    """Páginas do site com blocos — pública por slug; gestão com content:manage."""

    lookup_field = "slug"
    serializer_class = SitePageSerializer

    def get_queryset(self):
        qs = SitePage.objects.prefetch_related("blocks").all()
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "content:manage"):
            return qs.filter(status="published")
        return qs

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("content:manage")]

    @action(detail=True, methods=["post"])
    def publish(self, request, slug=None):
        """POST /pages/{slug}/publish/ — publica a página (content:manage)."""
        page = publish_page(self.get_object(), request.user)
        return Response(SitePageSerializer(page).data)

    @action(detail=False, methods=["post"])
    def upsert(self, request):
        """POST /pages/upsert/ — cria/atualiza página com blocos (content:manage)."""
        serializer = SitePageUpsertSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        validated = serializer.validated_data
        blocks = validated.pop("blocks", [])
        slug = validated.pop("slug")
        page = upsert_page_with_blocks(
            slug=slug,
            actor=request.user,
            data=validated,
            blocks=blocks,
        )
        return Response(SitePageSerializer(page).data)


class ContactMessageViewSet(viewsets.ModelViewSet):
    """Mensagens de contacto — criação pública; leitura com contacts:manage."""

    queryset = ContactMessage.objects.all()
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [HasCapability("contacts:manage")]

    def get_serializer_class(self):
        return ContactMessageSerializer

    def perform_create(self, serializer):
        contact = serializer.save()
        transaction.on_commit(lambda: enqueue_contact_notification(str(contact.id)))


class NewsletterViewSet(viewsets.ModelViewSet):
    """Newsletter — subscrição pública; gestão com contacts:manage."""

    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer

    def get_permissions(self):
        if self.action in {"create", "unsubscribe"}:
            return [AllowAny()]
        return [HasCapability("contacts:manage")]

    def get_serializer_class(self):
        return NewsletterSerializer

    def perform_create(self, serializer):
        subscriber = serializer.save()
        transaction.on_commit(lambda: enqueue_newsletter_welcome(subscriber.email))

    @action(detail=False, methods=["post"], permission_classes=[AllowAny])
    def unsubscribe(self, request):
        """POST /cms/newsletters/unsubscribe/ — desativa por token assinado."""
        serializer = NewsletterUnsubscribeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        if not unsubscribe_with_token(serializer.validated_data["token"]):
            return Response({"detail": "Link inválido."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"unsubscribed": True})

    @action(detail=False, methods=["post"])
    def broadcast(self, request):
        """POST /cms/newsletters/broadcast/ — agenda envio RQ e devolve o estado."""
        from apps.audit.helpers import log_audit

        serializer = NewsletterBroadcastRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        recipients = Newsletter.objects.filter(is_active=True).count()
        broadcast = NewsletterBroadcast.objects.create(
            **serializer.validated_data,
            requested_by=request.user,
            total_recipients=recipients,
        )
        log_audit(
            user=request.user,
            action="newsletter.broadcast.queued",
            resource_type="newsletter_broadcast",
            resource_id=str(broadcast.id),
            details={"recipients": recipients, "subject": broadcast.subject},
        )
        transaction.on_commit(lambda: enqueue_newsletter_broadcast(broadcast))
        return Response(
            NewsletterBroadcastSerializer(broadcast).data,
            status=status.HTTP_202_ACCEPTED,
        )


class NewsletterBroadcastViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NewsletterBroadcastSerializer
    queryset = NewsletterBroadcast.objects.order_by("-created_at")

    def get_permissions(self):
        return [HasCapability("contacts:manage")]


@method_decorator(cache_page(10), name="list")
@method_decorator(cache_page(10), name="retrieve")
class SettingViewSet(viewsets.ModelViewSet):
    """Configurações do site (ex.: site_config) — leitura pública, gestão com settings:manage."""

    serializer_class = SettingSerializer
    lookup_field = "key"

    def get_queryset(self):
        queryset = Setting.objects.order_by("key")
        user = self.request.user
        if not user_has_capability(user, "settings:manage"):
            return queryset.filter(key__in=PUBLIC_SETTING_KEYS)
        return queryset

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]

    def perform_create(self, serializer):
        cache.clear()
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        cache.clear()
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        cache.clear()
        return super().perform_destroy(instance)
        return [HasCapability("settings:manage")]
