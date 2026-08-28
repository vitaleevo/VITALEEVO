"""Permissões DRF por capacidade — SOLID: cada endpoint declara o que exige."""
from rest_framework.permissions import BasePermission

def user_has_capability(user, capability: str) -> bool:
    """Verificação segura para utilizadores autenticados e AnonymousUser."""
    if not user or not getattr(user, "is_authenticated", False) or not getattr(user, "is_staff", False):
        return False
    if getattr(user, "is_superuser", False) or getattr(user, "role", None) == "admin":
        return True
    checker = getattr(user, "has_capability", None)
    return bool(checker and checker(capability))


class HasCapability(BasePermission):
    """Requer que o utilizador staff possua uma capacidade (ex.: 'quotes:manage')."""

    def __init__(self, capability: str | None = None):
        self.capability = capability
        super().__init__()

    def has_permission(self, request, view):
        if self.capability is None:
            return bool(request.user and request.user.is_authenticated and request.user.is_staff)
        return user_has_capability(request.user, self.capability)


class IsStaff(BasePermission):
    """Requer autenticação com cargo de staff (admin/comercial/conteúdo/operações)."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class HasAnyCapability(BasePermission):
    """Requer que o utilizador possua pelo menos uma das capacidades listadas."""

    def __init__(self, *capabilities: str):
        self.capabilities = capabilities
        super().__init__()

    def has_permission(self, request, view):
        return any(user_has_capability(request.user, capability) for capability in self.capabilities)


class CanUploadMedia(HasCapability):
    """Requer capacidade media:upload — usado em views de função (@api_view)."""

    def __init__(self):
        super().__init__("media:upload")
