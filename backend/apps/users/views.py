"""Endpoints de autenticação, perfil e gestão de utilizadores (staff)."""
import logging

from django.conf import settings
from django.contrib.auth.tokens import default_token_generator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from apps.core.permissions import HasCapability

from .models import User
from .serializers import (
    AdminResetPasswordSerializer,
    AdminUserCreateSerializer,
    AdminUserUpdateSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    PasswordResetConfirmSerializer,
    PasswordResetRequestSerializer,
    RegisterSerializer,
    UserSerializer,
)

logger = logging.getLogger(__name__)


def revoke_user_refresh_tokens(user: User) -> None:
    """Impede novas sessões a partir de refresh tokens já emitidos."""
    for token in OutstandingToken.objects.filter(user=user):
        BlacklistedToken.objects.get_or_create(token=token)


class LoginView(TokenObtainPairView):
    throttle_scope = "auth_login"


class RefreshView(TokenRefreshView):
    throttle_scope = "auth_refresh"


class RegisterView(generics.CreateAPIView):
    """POST /auth/register/ — cria conta de cliente e devolve o perfil."""

    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    throttle_scope = "auth_register"


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
        revoke_user_refresh_tokens(request.user)
        return Response({"detail": "Password atualizada."})


class LogoutView(generics.GenericAPIView):
    """POST /auth/logout/ — revoga o refresh token apresentado."""

    permission_classes = [permissions.AllowAny]
    serializer_class = LogoutSerializer
    throttle_scope = "auth_logout"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            RefreshToken(serializer.validated_data["refresh"]).blacklist()
        except TokenError:
            return Response({"detail": "Sessão inválida ou já terminada."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(generics.GenericAPIView):
    """POST /auth/password-reset/ — envia e-mail com link assinado (stateless)."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetRequestSerializer
    throttle_scope = "auth_password_reset"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data["email"].strip().lower()
        user = User.objects.filter(email=email, is_active=True).first()
        if user:
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            link = f"{settings.SITE_URL}/recuperar-senha?uid={uid}&token={token}"
            try:
                send_mail(
                    subject="Reposição de password — VitalEvo",
                    message=f"Olá {user.first_name or 'utilizador'},\n\n"
                            f"Recebemos um pedido para repor a sua password. Aceda ao link:\n{link}\n\n"
                            "Se não foi você, ignore este e-mail.",
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[user.email],
                )
            except Exception:  # noqa: BLE001 — resposta pública não revela existência da conta
                logger.exception(
                    "Falha ao enviar e-mail de reposição de password",
                    extra={"user_id": str(user.id)},
                )
        return Response({"detail": "Se o e-mail existir, enviámos um link de reposição."})


class PasswordResetConfirmView(generics.GenericAPIView):
    """POST /auth/password-reset/confirm/ — token assinado + nova password."""

    permission_classes = [permissions.AllowAny]
    serializer_class = PasswordResetConfirmSerializer
    throttle_scope = "auth_password_reset_confirm"

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        try:
            user_id = force_str(urlsafe_base64_decode(serializer.validated_data["uid"]))
        except (ValueError, TypeError, UnicodeDecodeError):
            user_id = None
        user = User.objects.filter(id=user_id, is_active=True).first() if user_id else None
        if not user:
            return Response({"detail": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        if not default_token_generator.check_token(user, serializer.validated_data["token"]):
            return Response({"detail": "Link inválido ou expirado."}, status=status.HTTP_400_BAD_REQUEST)
        user.set_password(serializer.validated_data["password"])
        user.save(update_fields=["password"])
        revoke_user_refresh_tokens(user)
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
        revoke_user_refresh_tokens(user)
        return Response({"detail": "Password reposta."})
