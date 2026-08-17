"""Endpoints do CMS — leitura pública no site; gestão com content:manage / settings:manage."""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView, ListCreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.permissions import HasCapability

from .models import ContactMessage, LegalDocument, Newsletter, Service, Setting, SitePage
from .serializers import (
    ContactMessageSerializer,
    LegalDocumentSerializer,
    NewsletterSerializer,
    ServiceAdminSerializer,
    ServiceSerializer,
    SettingSerializer,
    SitePageSerializer,
)
from .services import publish_page, upsert_page_with_blocks


class ServiceViewSet(viewsets.ModelViewSet):
    """Serviços — públicos (publicados); gestão com content:manage."""

    lookup_field = "slug"
    search_fields = ["title", "subtitle", "description"]
    ordering_fields = ["order", "created_at"]

    def get_queryset(self):
        qs = Service.objects.all()
        if self.action in {"list", "retrieve"} and not self.request.user.is_staff:
            return qs.filter(is_active=True, status="published")
        return qs

    def get_serializer_class(self):
        if self.action in {"list", "retrieve"} and not self.request.user.is_staff:
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
        if self.action in {"list", "retrieve"} and not self.request.user.is_staff:
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
        if self.action in {"list", "retrieve"} and not self.request.user.is_staff:
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
        data = request.data
        page = upsert_page_with_blocks(
            slug=data.get("slug"),
            actor=request.user,
            data={
                "title": data.get("title", ""),
                "seo_title": data.get("seo_title", ""),
                "seo_description": data.get("seo_description", ""),
                "og_image": data.get("og_image", ""),
                "status": data.get("status", "draft"),
            },
            blocks=data.get("blocks", []),
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


class NewsletterViewSet(viewsets.ModelViewSet):
    """Newsletter — subscrição pública; gestão com contacts:manage."""

    queryset = Newsletter.objects.all()
    serializer_class = NewsletterSerializer

    def get_permissions(self):
        if self.action == "create":
            return [AllowAny()]
        return [HasCapability("contacts:manage")]

    def get_serializer_class(self):
        return NewsletterSerializer


class SettingViewSet(viewsets.ModelViewSet):
    """Configurações do site (ex.: site_config) — leitura pública, gestão com settings:manage."""

    queryset = Setting.objects.all()
    serializer_class = SettingSerializer
    lookup_field = "key"

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("settings:manage")]