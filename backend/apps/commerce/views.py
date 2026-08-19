"""Endpoints do comércio — conta do cliente (autenticado) e gestão de encomendas."""
from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import HasCapability

from .models import Address, CartItem, Notification, Order, WishlistItem
from .serializers import (
    AddressSerializer,
    CartItemSerializer,
    NotificationSerializer,
    OrderAdminSerializer,
    OrderCreateSerializer,
    OrderReadSerializer,
    OrderStatusSerializer,
    WishlistItemSerializer,
    WishlistWriteSerializer,
)
from .services import update_order_status


class AddressViewSet(viewsets.ModelViewSet):
    """Moradas do utilizador autenticado."""

    serializer_class = AddressSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_queryset(self):
        return Address.objects.filter(user=self.request.user).order_by("-is_default", "-created_at")

    def perform_create(self, serializer):
        address = serializer.save(user=self.request.user)
        if address.is_default:
            self.get_queryset().exclude(id=address.id).update(is_default=False)

    def perform_update(self, serializer):
        address = serializer.save()
        if address.is_default:
            self.get_queryset().exclude(id=address.id).update(is_default=False)

    @action(detail=True, methods=["post"])
    def set_default(self, request, pk=None):
        self.get_queryset().update(is_default=False)
        address = self.get_object()
        address.is_default = True
        address.save(update_fields=["is_default"])
        return Response({"is_default": True})


class WishlistViewSet(viewsets.ViewSet):
    """Wishlist do utilizador autenticado."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = WishlistItem.objects.filter(user=request.user).select_related("product")
        return Response(WishlistItemSerializer(items, many=True).data)

    def create(self, request):
        serializer = WishlistWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        item, _ = WishlistItem.objects.get_or_create(user=request.user, product=serializer.validated_data["product"])
        return Response(WishlistItemSerializer(item).data, status=status.HTTP_201_CREATED)

    def destroy(self, request, pk=None):
        WishlistItem.objects.filter(user=request.user, pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def toggle(self, request):
        serializer = WishlistWriteSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        item = WishlistItem.objects.filter(user=request.user, product=product).first()
        if item:
            item.delete()
            return Response({"favorited": False})
        WishlistItem.objects.create(user=request.user, product=product)
        return Response({"favorited": True})

    @action(detail=False, methods=["get"])
    def is_favorited(self, request):
        product_slug = request.query_params.get("product")
        if not product_slug:
            return Response({"favorited": False})
        favorited = WishlistItem.objects.filter(user=request.user, product__slug=product_slug).exists()
        return Response({"favorited": favorited})


class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    """Notificações do utilizador autenticado."""

    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-created_at")

    @action(detail=False, methods=["get"])
    def unread_count(self, request):
        return Response({"count": self.get_queryset().filter(is_read=False).count()})

    @action(detail=True, methods=["post"])
    def mark_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save(update_fields=["is_read"])
        return Response({"ok": True})

    @action(detail=False, methods=["post"])
    def mark_all_read(self, request):
        self.get_queryset().filter(is_read=False).update(is_read=True)
        return Response({"ok": True})


class CartViewSet(viewsets.ViewSet):
    """Carrinho do utilizador autenticado (persistido)."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = CartItem.objects.filter(user=request.user).select_related("product")
        return Response(CartItemSerializer(items, many=True).data)

    def create(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        item, created = CartItem.objects.get_or_create(user=request.user, product=product, defaults={"quantity": quantity})
        if not created:
            item.quantity = min(item.quantity + quantity, 999)
            item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def count(self, request):
        count = CartItem.objects.filter(user=request.user).aggregate(total=Coalesce(Sum("quantity"), 0))["total"]
        return Response({"count": count})

    @action(detail=True, methods=["patch"])
    def update_quantity(self, request, pk=None):
        item = CartItem.objects.get(user=request.user, pk=pk)
        quantity = request.data.get("quantity")
        if not isinstance(quantity, int) or quantity < 1 or quantity > 999:
            return Response({"detail": "Quantidade inválida"}, status=status.HTTP_400_BAD_REQUEST)
        item.quantity = quantity
        item.save(update_fields=["quantity"])
        return Response(CartItemSerializer(item).data)

    def destroy(self, request, pk=None):
        CartItem.objects.filter(user=request.user, pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({"ok": True})


class OrderViewSet(viewsets.ViewSet):
    """Encomendas — checkout público; leitura do cliente; gestão staff."""

    permission_classes = [AllowAny]

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderReadSerializer(order).data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.select_related("user").prefetch_related("items").get(pk=pk)
        except (Order.DoesNotExist, ValueError):
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        token = request.query_params.get("access_token", "")
        user_owns = request.user.is_authenticated and order.user == request.user
        guest_owns = bool(order.guest_email and order.guest_email.lower() == getattr(request.user, "email", "").lower())
        if not (user_owns or guest_owns or order.access_token == token or request.user.is_staff):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        serializer = OrderAdminSerializer if request.user.is_staff else OrderReadSerializer
        return Response(serializer(order).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items").order_by("-created_at")
        return Response(OrderReadSerializer(orders, many=True).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def by_number(self, request):
        number = request.query_params.get("order_number", "")
        token = request.query_params.get("access_token", "")
        order = Order.objects.filter(order_number__iexact=number).prefetch_related("items").first()
        if not order:
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        user_owns = order.user == request.user
        guest_owns = bool(order.guest_email and order.guest_email.lower() == request.user.email.lower())
        if not (user_owns or guest_owns or order.access_token == token or request.user.is_staff):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrderReadSerializer(order).data)


class OrderAdminViewSet(viewsets.ReadOnlyModelViewSet):
    """Gestão de encomendas (staff) — lista paginada, estatísticas e estado."""

    serializer_class = OrderAdminSerializer
    permission_classes = [HasCapability("orders:read")]
    filterset_fields = ["status"]
    search_fields = ["order_number", "guest_email", "guest_name", "items__name"]
    ordering_fields = ["created_at", "total", "status"]

    def get_queryset(self):
        return Order.objects.select_related("user").prefetch_related("items").order_by("-created_at")

    def get_permissions(self):
        if self.action == "update_status":
            return [HasCapability("orders:manage")]
        return [HasCapability("orders:read")]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total = Order.objects.count()
        pending = Order.objects.filter(status="pending").count()
        revenue = Order.objects.exclude(status="cancelled").aggregate(total=Coalesce(Sum("total"), 0, output_field=DecimalField()))["total"]
        return Response({"total_orders": total, "pending_orders": pending, "revenue": revenue})

    @action(detail=True, methods=["post"], permission_classes=[HasCapability("orders:manage")])
    def update_status(self, request, pk=None):
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = self.get_object()
        update_order_status(order, serializer.validated_data["status"], actor=request.user)
        return Response(OrderAdminSerializer(order).data)