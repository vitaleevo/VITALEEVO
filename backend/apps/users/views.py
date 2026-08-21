"""Endpoints de autenticação, perfil e gestão de utilizadores (staff)."""
from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.urls import reverse
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

from apps.core.permissions import HasCapability

from .models import User
from .serializers import (
    AdminResetPasswordSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)


class RegisterView(generics.CreateAPIView):
    """POST /auth/register/ — cria conta de cliente e devolve o perfil."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "auth"


class MeView(generics.RetrieveUpdateAPIView):
    """GET /auth/me/ — perfil; PATCH /auth/me/ — atualizar nome/telefone."""

    permission_classes = [permissions.IsAuthenticated]
    http_method_names = ["get", "patch", "head", "options"]

    def get_serializer_class(self):
        if self.request.method in {"PATCH", "PUT"}:
            from .serializers import ProfileUpdateSerializer

            return ProfileUpdateSerializer
        return UserSerializer

    def get_object(self):
        return self.request.user


class ChangePasswordView(generics.GenericAPIView):
    """POST /auth/change-password/ — muda a password com confirmação da atual."""

    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ChangePasswordSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data["new_password"])
        request.user.save(update_fields=["password"])
        return Response({"detail": "Password atualizada."})


class PasswordResetRequestView(generics.GenericAPIView):
    """POST /auth/password-reset/ — envia e-mail com link assinado (stateless)."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_scope = "auth"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email=email, is_active=True).first()
        if user:
            token = default_token_generator.make_token(user)
            link = f"{settings.SITE_URL}/recuperar-senha?token={token}&email={user.email}"
            try:
                send_mail(
                    subject="Reposição de password — VitalEvo",
                    message=f"Olá {user.first_name or 'utilizador'},\n\n"
                            f"Recebemos um pedido para repor a sua password. Aceda ao link:\n{link}\n\n"
                            "Se não foi você, ignore este e-mail.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                )
            except Exception:
                pass
        return Response({"detail": "Se o e-mail existir, enviámos um link de reposição."})


class PasswordResetConfirmView(generics.GenericAPIView):
    """POST /auth/password-reset/confirm/ — token assinado + nova password."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = User.objects.filter(email=serializer.validated_data.get("email", "").strip().lower(), is_active=True).first()
        if not user:
            return Response({"detail": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"detail": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password reposta. Já pode iniciar sessão."})


class AdminUserViewSet(viewsets.ModelViewSet):
    """Gestão de utilizadores (staff) — lista, criar, editar, repor password."""

    queryset = User.objects.all().order_by("-created_at")
    lookup_field = "id"
    search_fields = ["email", "first_name", "last_name", "phone"]
    filterset_fields = ["role", "is_active"]
    http_method_names = ["get", "post", "patch", "delete"]

    def get_permissions(self):
        return [HasCapability("users:manage")]

    def get_serializer_class(self):
        if self.action == "create":
            return AdminUserCreateSerializer
        return AdminUserUpdateSerializer

    def get_serializer(self, *args, **kwargs):
        serializer_class = self.get_serializer_class()
        kwargs.setdefault("context", self.get_serializer_context())
        return serializer_class(*args, **kwargs)

    @action(detail=True, methods=["post"])
    def reset_password(self, request, id=None):
        user = self.get_object()
        serializer = AdminResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        return Response({"detail": "Password reposta."})