"""Endpoints do catálogo — leitura pública na loja, gestão com capacidade catalog:manage."""
import hashlib

from django.core.cache import cache
from django.db.models import Max, Q
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_control, cache_page
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


@method_decorator(cache_control(max_age=10, stale_while_revalidate=30, public=True), name="list")
@method_decorator(cache_page(10), name="list")
@method_decorator(cache_page(10), name="retrieve")
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

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        etag = hashlib.md5(f"{qs.count()}-{qs.aggregate(Max('updated_at'))['updated_at__max']}".encode()).hexdigest()
        if request.headers.get("If-None-Match") == f'W/"{etag}"':
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        response = super().list(request, *args, **kwargs)
        response["ETag"] = f'W/"{etag}"'
        return response

    def perform_create(self, serializer):
        cache.clear()
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        cache.clear()
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        cache.clear()
        return super().perform_destroy(instance)


@method_decorator(cache_control(max_age=10, stale_while_revalidate=30, public=True), name="list")
@method_decorator(cache_page(10), name="list")
@method_decorator(cache_page(10), name="retrieve")
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

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        etag = hashlib.md5(f"{qs.count()}-{qs.aggregate(Max('updated_at'))['updated_at__max']}".encode()).hexdigest()
        if request.headers.get("If-None-Match") == f'W/"{etag}"':
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        response = super().list(request, *args, **kwargs)
        response["ETag"] = f'W/"{etag}"'
        return response

    def perform_create(self, serializer):
        cache.clear()
        return super().perform_create(serializer)

    def perform_update(self, serializer):
        cache.clear()
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        cache.clear()
        return super().perform_destroy(instance)


@method_decorator(cache_control(max_age=10, stale_while_revalidate=30, public=True), name="list")
@method_decorator(cache_page(10), name="list")
@method_decorator(cache_page(10), name="retrieve")
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

    def list(self, request, *args, **kwargs):
        qs = self.filter_queryset(self.get_queryset())
        etag = hashlib.md5(f"{qs.count()}-{qs.aggregate(Max('updated_at'))['updated_at__max']}".encode()).hexdigest()
        if request.headers.get("If-None-Match") == f'W/"{etag}"':
            return Response(status=status.HTTP_304_NOT_MODIFIED)
        response = super().list(request, *args, **kwargs)
        response["ETag"] = f'W/"{etag}"'
        return response

    def perform_create(self, serializer):
        cache.clear()
        product = serializer.save()
        from .services import publish_product  # import local para evitar ciclo

        if product.status == "published":
            publish_product(product, self.request.user)

    def perform_update(self, serializer):
        cache.clear()
        return super().perform_update(serializer)

    def perform_destroy(self, instance):
        cache.clear()
        return super().perform_destroy(instance)

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
        cache.clear()
        return Response({"stock": new_stock}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def movements(self, request, slug=None):
        """GET /products/{slug}/movements/ — histórico de stock (staff)."""
        product = self.get_object()
        queryset = product.movements.select_related("actor").order_by("-created_at")[:50]
        return Response(InventoryMovementSerializer(queryset, many=True).data)
