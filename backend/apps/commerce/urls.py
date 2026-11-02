"""Rotas do comércio v1."""
from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CartViewSet,
    NotificationViewSet,
    OrderAdminViewSet,
    OrderViewSet,
    PaymentAdminViewSet,
    PaymentEventAdminViewSet,
    ProxyPayOPGWebhookView,
    ProxyPayRPSWebhookView,
    WishlistViewSet,
)

router = DefaultRouter()
router.register("commerce/orders/manage", OrderAdminViewSet, basename="order-manage")
router.register("commerce/orders", OrderViewSet, basename="order")
router.register("commerce/payments/manage/events", PaymentEventAdminViewSet, basename="payment-event-manage")
router.register("commerce/payments/manage", PaymentAdminViewSet, basename="payment-manage")
router.register("commerce/addresses", AddressViewSet, basename="address")
router.register("commerce/wishlist", WishlistViewSet, basename="wishlist")
router.register("commerce/notifications", NotificationViewSet, basename="notification")
router.register("commerce/cart", CartViewSet, basename="cart")

urlpatterns = [
    path("commerce/payments/webhook/proxypay-rps/", ProxyPayRPSWebhookView.as_view(), name="proxypay-rps-webhook"),
    path("commerce/payments/webhook/proxypay-opg/", ProxyPayOPGWebhookView.as_view(), name="proxypay-opg-webhook"),
    *router.urls,
]
