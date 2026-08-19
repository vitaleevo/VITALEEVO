"""Endpoints das cotações — criação pública; gestão com quotes:read / quotes:manage."""
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from apps.audit.helpers import log_audit
from apps.core.permissions import HasCapability

from .models import QuoteRequest, QuoteStatus
from .serializers import (
    QuoteCreateSerializer,
    QuoteProposalSerializer,
    QuoteReadSerializer,
    QuoteStatusSerializer,
)
from .services import create_quote_request, update_quote_status

User = get_user_model()


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

    @action(detail=False, methods=["get"])
    def stats(self, request):
        """GET /quotes/manage/stats/ — totais para o dashboard do backoffice."""
        total = QuoteRequest.objects.count()
        by_status = {
            value: QuoteRequest.objects.filter(status=value).count()
            for value in QuoteStatus.values
        }
        overdue = (
            QuoteRequest.objects.filter(status=QuoteStatus.NEW, next_follow_up_at__lt=timezone.now()).count()
        )
        return Response({"total": total, "by_status": by_status, "overdue_follow_ups": overdue})

    @action(detail=True, methods=["post"])
    def assign(self, request, pk=None):
        """POST /quotes/{id}/assign/ — atribui um utilizador staff à cotação (ou limpa com assigned_to=null)."""
        quote = self.get_object()
        assigned_to = request.data.get("assigned_to")
        user = None
        if assigned_to:
            try:
                user = User.objects.get(id=assigned_to)
            except (User.DoesNotExist, ValueError):
                return Response({"detail": "Utilizador não encontrado."}, status=status.HTTP_400_BAD_REQUEST)
        quote.assigned_to = user
        quote.save(update_fields=["assigned_to", "updated_at"])
        log_audit(
            user=request.user,
            action="quote.assign",
            resource_type="quote",
            resource_id=str(quote.id),
            details={"assigned_to": str(user.id) if user else None},
        )
        return Response(QuoteReadSerializer(quote).data)

    @action(detail=True, methods=["post"])
    def follow_up(self, request, pk=None):
        """POST /quotes/{id}/follow_up/ — agenda o próximo contacto (next_follow_up_at ISO 8601)."""
        quote = self.get_object()
        value = request.data.get("next_follow_up_at")
        if not value:
            return Response({"detail": "next_follow_up_at é obrigatório."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            parsed = timezone.datetime.fromisoformat(str(value).replace("Z", "+00:00"))
        except ValueError:
            return Response({"detail": "Data inválida (use ISO 8601)."}, status=status.HTTP_400_BAD_REQUEST)
        quote.next_follow_up_at = parsed
        quote.save(update_fields=["next_follow_up_at", "updated_at"])
        log_audit(
            user=request.user,
            action="quote.follow_up",
            resource_type="quote",
            resource_id=str(quote.id),
            details={"next_follow_up_at": str(parsed)},
        )
        return Response(QuoteReadSerializer(quote).data)