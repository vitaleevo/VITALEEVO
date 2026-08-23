"""Endpoints do catálogo — leitura pública na loja, gestão com capacidade catalog:manage."""
from django.db.models import Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from apps.core.permissions import HasCapability, user_has_capability

from .models import Brand, Category, InventoryMovement, Product
from .serializers import (
    BrandSerializer,
    CategorySerializer,
    InventoryMovementSerializer,
    ProductAdminSerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    StockAdjustSerializer,
)
from .services import adjust_stock


class CategoryViewSet(viewsets.ModelViewSet):
    """Categorias — públicas para leitura; gestão com catalog:manage."""

    queryset = Category.objects.filter(is_active=True)
    serializer_class = CategorySerializer
    lookup_field = "slug"
    filterset_fields = ["type"]
    search_fields = ["name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("catalog:manage")]


class BrandViewSet(viewsets.ModelViewSet):
    """Marcas — públicas para leitura; gestão com catalog:manage."""

    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    lookup_field = "slug"
    search_fields = ["name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("catalog:manage")]


class ProductViewSet(viewsets.ModelViewSet):
    """Produtos — loja pública (só publicados); gestão completa com catalog:manage."""

    lookup_field = "slug"
    search_fields = ["name", "sku", "description"]
    filterset_fields = ["category__slug", "subcategory__slug", "brand__slug", "is_new", "is_featured", "status"]
    ordering_fields = ["price", "name", "created_at", "-price", "-created_at"]

    def get_queryset(self):
        qs = Product.objects.select_related("category", "subcategory", "brand")
        if self.action in {"list", "retrieve"} and not user_has_capability(self.request.user, "catalog:read"):
            qs = qs.filter(is_active=True, status="published")
        return qs

    def get_serializer_class(self):
        if self.action in {"list"}:
            if user_has_capability(self.request.user, "catalog:read"):
                return ProductAdminSerializer
            return ProductListSerializer
        if self.action in {"retrieve"}:
            if user_has_capability(self.request.user, "catalog:read"):
                return ProductAdminSerializer
            return ProductDetailSerializer
        return ProductAdminSerializer

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return [HasCapability("catalog:manage")]

    def perform_create(self, serializer):
        product = serializer.save()
        from .services import publish_product  # import local para evitar ciclo

        if product.status == "published":
            publish_product(product, self.request.user)

    @action(detail=True, methods=["post"], permission_classes=[HasCapability("stock:manage")])
    def adjust_stock(self, request, slug=None):
        """POST /products/{slug}/adjust_stock/ — delta relativo com nota."""
        serializer = StockAdjustSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = self.get_object()
        new_stock = adjust_stock(
            product=product,
            quantity=serializer.validated_data["quantity"],
            actor=request.user,
            movement_type="adjustment",
            note=serializer.validated_data["note"],
        )
        return Response({"stock": new_stock}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def movements(self, request, slug=None):
        """GET /products/{slug}/movements/ — histórico de stock (staff)."""
        product = self.get_object()
        queryset = product.movements.select_related("actor").order_by("-created_at")[:50]
        return Response(InventoryMovementSerializer(queryset, many=True).data)
