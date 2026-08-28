"""Rotas do CMS (v1) — serviços, documentos legais, páginas, contactos, newsletter e configurações."""
from rest_framework.routers import DefaultRouter

from .views import (
    ContactMessageViewSet,
    LegalDocumentViewSet,
    NewsletterViewSet,
    NewsletterBroadcastViewSet,
    ServiceViewSet,
    SettingViewSet,
    SitePageViewSet,
)

router = DefaultRouter()
router.register("cms/services", ServiceViewSet, basename="service")
router.register("cms/legal", LegalDocumentViewSet, basename="legal-document")
router.register("cms/pages", SitePageViewSet, basename="site-page")
router.register("cms/contacts", ContactMessageViewSet, basename="contact-message")
router.register("cms/newsletters", NewsletterViewSet, basename="newsletter")
router.register("cms/newsletter-broadcasts", NewsletterBroadcastViewSet, basename="newsletter-broadcast")
router.register("cms/settings", SettingViewSet, basename="setting")

urlpatterns = router.urls
