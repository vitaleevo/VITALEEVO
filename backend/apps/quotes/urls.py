"""Rotas das cotações (v1) — /quotes/ público e /quotes/manage/... para staff."""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import QuoteCreateView, QuotePublicView, QuoteViewSet

router = DefaultRouter()
router.register("quotes/manage", QuoteViewSet, basename="quote")

urlpatterns = [
    *router.urls,
    path("quotes/", QuoteCreateView.as_view(), name="quote-create"),
    path("quotes/<str:public_id>/", QuotePublicView.as_view(), name="quote-public"),
]