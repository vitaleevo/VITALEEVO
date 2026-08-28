"""Rotas do comércio (v1) — moradas, wishlist, notificações, carrinho e encomendas."""
from rest_framework.routers import DefaultRouter

from .views import (
    AddressViewSet,
    CartViewSet,
    NotificationViewSet,
    OrderAdminViewSet,
    OrderViewSet,
    WishlistViewSet,
)

router = DefaultRouter()
router.register("commerce/orders/manage", OrderAdminViewSet, basename="order-manage")
router.register("commerce/orders", OrderViewSet, basename="order")
router.register("commerce/addresses", AddressViewSet, basename="address")
router.register("commerce/wishlist", WishlistViewSet, basename="wishlist")
router.register("commerce/notifications", NotificationViewSet, basename="notification")
router.register("commerce/cart", CartViewSet, basename="cart")

urlpatterns = router.urls