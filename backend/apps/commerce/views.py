"""Endpoints do comércio: checkout, conta, pagamentos e reconciliação."""
from django.db.models import DecimalField, Sum
from django.db.models.functions import Coalesce
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.core.permissions import HasCapability, user_has_capability

from .models import Address, CartItem, Notification, Order, Payment, PaymentEvent, WishlistItem
from .payments import confirm_manual_payment, initiate_payment, process_opg_webhook, process_rps_webhook
from .serializers import (
    AddressSerializer,
    CartItemSerializer,
    CheckoutPreviewSerializer,
    NotificationSerializer,
    OrderAdminSerializer,
    OrderCreateSerializer,
    OrderReadSerializer,
    OrderStatusSerializer,
    PaymentAdminSerializer,
    PaymentEventSerializer,
    PaymentInitSerializer,
    PaymentReadSerializer,
    WishlistItemSerializer,
    WishlistWriteSerializer,
)
from .services import expire_order_if_needed, preview_order, update_order_status


class AddressViewSet(viewsets.ModelViewSet):
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
    """Carrinho persistido para utilizadores autenticados, limitado ao stock disponível."""

    permission_classes = [IsAuthenticated]

    def list(self, request):
        items = CartItem.objects.filter(user=request.user).select_related("product")
        return Response(CartItemSerializer(items, many=True).data)

    def create(self, request):
        serializer = CartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.validated_data["product"]
        quantity = serializer.validated_data.get("quantity", 1)
        item = CartItem.objects.filter(user=request.user, product=product).first()
        target_quantity = quantity + (item.quantity if item else 0)
        if target_quantity > product.available_stock:
            return Response(
                {"quantity": [f"Stock insuficiente. Disponível: {product.available_stock}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if item:
            item.quantity = target_quantity
            item.save(update_fields=["quantity", "updated_at"])
        else:
            item = CartItem.objects.create(user=request.user, product=product, quantity=quantity)
        return Response(CartItemSerializer(item).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"])
    def count(self, request):
        count = CartItem.objects.filter(user=request.user).aggregate(total=Coalesce(Sum("quantity"), 0))["total"]
        return Response({"count": count})

    @action(detail=True, methods=["patch"])
    def update_quantity(self, request, pk=None):
        item = CartItem.objects.select_related("product").get(user=request.user, pk=pk)
        quantity = request.data.get("quantity")
        if not isinstance(quantity, int) or quantity < 1 or quantity > 999:
            return Response({"detail": "Quantidade inválida"}, status=status.HTTP_400_BAD_REQUEST)
        if quantity > item.product.available_stock:
            return Response(
                {"quantity": [f"Stock insuficiente. Disponível: {item.product.available_stock}."]},
                status=status.HTTP_400_BAD_REQUEST,
            )
        item.quantity = quantity
        item.save(update_fields=["quantity", "updated_at"])
        return Response(CartItemSerializer(item).data)

    def destroy(self, request, pk=None):
        CartItem.objects.filter(user=request.user, pk=pk).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=["post"])
    def clear(self, request):
        CartItem.objects.filter(user=request.user).delete()
        return Response({"ok": True})


class OrderViewSet(viewsets.ViewSet):
    """Checkout público e leitura segura por utilizador/token de capacidade."""

    permission_classes = [AllowAny]

    @staticmethod
    def _can_access(request, order: Order, token: str = "") -> bool:
        user_owns = request.user.is_authenticated and order.user_id == request.user.id
        guest_owns = bool(
            request.user.is_authenticated
            and order.guest_email
            and order.guest_email.lower() == getattr(request.user, "email", "").lower()
        )
        return user_owns or guest_owns or (bool(token) and order.access_token == token) or user_has_capability(request.user, "orders:read")

    @action(detail=False, methods=["post"], url_path="preview")
    def preview(self, request):
        serializer = CheckoutPreviewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(preview_order(serializer.validated_data["items"]))

    def create(self, request):
        serializer = OrderCreateSerializer(data=request.data, context={"request": request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        data = OrderReadSerializer(order).data
        data["access_token"] = order.access_token
        return Response(data, status=status.HTTP_201_CREATED)

    def retrieve(self, request, pk=None):
        try:
            order = Order.objects.select_related("user").prefetch_related("items", "payments").get(pk=pk)
        except (Order.DoesNotExist, ValueError):
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        order = expire_order_if_needed(order)
        token = request.query_params.get("access_token", "")
        if not self._can_access(request, order, token):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        serializer = OrderAdminSerializer if user_has_capability(request.user, "orders:read") else OrderReadSerializer
        return Response(serializer(order).data)

    @action(detail=False, methods=["get"], permission_classes=[IsAuthenticated])
    def mine(self, request):
        orders = Order.objects.filter(user=request.user).prefetch_related("items", "payments").order_by("-created_at")
        return Response(OrderReadSerializer(orders, many=True).data)

    @action(detail=False, methods=["get"], url_path="by-number")
    def by_number(self, request):
        number = request.query_params.get("order_number", "")
        token = request.query_params.get("access_token", "")
        order = Order.objects.filter(order_number__iexact=number).prefetch_related("items", "payments").first()
        if not order:
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        order = expire_order_if_needed(order)
        if not self._can_access(request, order, token):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        return Response(OrderReadSerializer(order).data)

    @action(detail=True, methods=["post"], url_path="payment")
    def payment(self, request, pk=None):
        serializer = PaymentInitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            order = Order.objects.prefetch_related("payments", "items").get(pk=pk)
        except (Order.DoesNotExist, ValueError):
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        token = serializer.validated_data.get("access_token", "")
        if not self._can_access(request, order, token):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        payment = initiate_payment(order, serializer.validated_data["provider"])
        return Response(PaymentReadSerializer(payment).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk)
        except (Order.DoesNotExist, ValueError):
            return Response({"detail": "Encomenda não encontrada"}, status=status.HTTP_404_NOT_FOUND)
        token = str(request.data.get("access_token") or "")
        if not self._can_access(request, order, token):
            return Response({"detail": "Acesso não autorizado"}, status=status.HTTP_403_FORBIDDEN)
        order = update_order_status(order, "cancelled", actor=request.user if request.user.is_authenticated else None)
        return Response(OrderReadSerializer(order).data)


class OrderAdminViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = OrderAdminSerializer
    permission_classes = [HasCapability("orders:read")]
    filterset_fields = ["status"]
    search_fields = ["order_number", "guest_email", "guest_name", "items__name"]
    ordering_fields = ["created_at", "total", "status"]

    def get_queryset(self):
        return Order.objects.select_related("user").prefetch_related("items", "payments").order_by("-created_at")

    def get_permissions(self):
        if self.action == "update_status":
            return [HasCapability("orders:manage")]
        return [HasCapability("orders:read")]

    @action(detail=False, methods=["get"])
    def stats(self, request):
        total = Order.objects.count()
        pending = Order.objects.filter(status="pending").count()
        revenue = Order.objects.filter(status__in=["paid", "processing", "shipped", "delivered"]).aggregate(
            total=Coalesce(Sum("total"), 0, output_field=DecimalField())
        )["total"]
        return Response({"total_orders": total, "pending_orders": pending, "revenue": revenue})

    @action(detail=True, methods=["post"], permission_classes=[HasCapability("orders:manage")])
    def update_status(self, request, pk=None):
        serializer = OrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = update_order_status(self.get_object(), serializer.validated_data["status"], actor=request.user)
        return Response(OrderAdminSerializer(order).data)


class PaymentAdminViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentAdminSerializer
    filterset_fields = ["provider", "status"]
    ordering_fields = ["created_at", "amount", "status"]

    def get_permissions(self):
        capability = "orders:manage" if self.action == "confirm_manual" else "orders:read"
        return [HasCapability(capability)]

    def get_queryset(self):
        return Payment.objects.select_related("order").prefetch_related("events").order_by("-created_at")

    @action(detail=True, methods=["post"])
    def confirm_manual(self, request, pk=None):
        payment = confirm_manual_payment(self.get_object(), actor=request.user)
        return Response(PaymentAdminSerializer(payment).data)


class PaymentEventAdminViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = PaymentEventSerializer
    filterset_fields = ["provider", "reconciliation_status", "signature_valid"]
    ordering_fields = ["created_at", "processed_at", "amount"]

    def get_permissions(self):
        return [HasCapability("orders:read")]

    def get_queryset(self):
        return PaymentEvent.objects.select_related("payment", "payment__order").order_by("-created_at")


class ProxyPayRPSWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        event = process_rps_webhook(request.body, request.headers.get("X-Signature", ""))
        return Response(PaymentEventSerializer(event).data, status=status.HTTP_200_OK)


class ProxyPayOPGWebhookView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

    def post(self, request):
        event = process_opg_webhook(request.data if isinstance(request.data, dict) else {})
        return Response(PaymentEventSerializer(event).data, status=status.HTTP_200_OK)
