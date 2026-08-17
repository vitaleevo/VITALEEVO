"""Endpoints das cotações — criação pública; gestão com quotes:read / quotes:manage."""
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.core.permissions import HasCapability

from .models import QuoteRequest
from .serializers import (
    QuoteCreateSerializer,
    QuoteProposalSerializer,
    QuoteReadSerializer,
    QuoteStatusSerializer,
)
from .services import create_quote_request, update_quote_status


class QuoteCreateView(CreateAPIView):
    """POST /quotes/ — formulário público (sem autenticação)."""

    permission_classes = [AllowAny]
    serializer_class = QuoteCreateSerializer
    throttle_scope = "quotes"

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        items = data.pop("items", [])

        quote = create_quote_request(
            **data,
            items=[
                {"name": i["name"], "sku": i.get("sku", ""), "image": i.get("image", ""), "quantity": i["quantity"]}
                for i in items
            ],
            actor=request.user if request.user.is_authenticated else None,
            ip_address=request.META.get("REMOTE_ADDR"),
        )
        return Response({"public_id": quote.public_id, "status": quote.status}, status=status.HTTP_201_CREATED)


class QuoteViewSet(viewsets.ModelViewSet):
    """Backoffice — leitura com quotes:read, gestão com quotes:manage."""

    queryset = QuoteRequest.objects.select_related("assigned_to").prefetch_related("items").all()
    serializer_class = QuoteReadSerializer
    search_fields = ["public_id", "name", "email", "phone", "company"]
    filterset_fields = ["status", "source"]
    ordering_fields = ["created_at", "next_follow_up_at"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [HasCapability("quotes:read")]
        return [HasCapability("quotes:manage")]

    @action(detail=True, methods=["post"])
    def status(self, request, pk=None):
        """POST /quotes/{id}/status/ — muda o estado com nota opcional."""
        serializer = QuoteStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quote = update_quote_status(
            self.get_object(),
            status=serializer.validated_data["status"],
            actor=request.user,
            note=serializer.validated_data.get("note", ""),
        )
        return Response(QuoteReadSerializer(quote).data)

    @action(detail=True, methods=["post"])
    def proposal(self, request, pk=None):
        """POST /quotes/{id}/proposal/ — regista total e nota da proposta."""
        serializer = QuoteProposalSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        quote = self.get_object()
        for field, value in serializer.validated_data.items():
            setattr(quote, field, value)
        quote.save()
        return Response(QuoteReadSerializer(quote).data)