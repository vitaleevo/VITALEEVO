"""Serializers do domínio utilizadores — validação estrita em validate_*."""
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from apps.core.enums import StaffRole
from apps.core.validators import normalize_email, validate_phone

from .models import User


class RegisterSerializer(serializers.Serializer):
    """Registo público de um novo cliente (utilizador normal)."""

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    first_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)

    def validate_email(self, value: str) -> str:
        normalized = normalize_email(value)
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("Já existe uma conta com este e-mail.")
        return normalized

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate_phone(self, value: str) -> str:
        return validate_phone(value) if value else value

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        return User.objects.create_user(password=password, **validated_data)


class UserSerializer(serializers.ModelSerializer):
    """Perfil público/privado do utilizador — inclui capacidades para o frontend."""

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "permissions",
            "is_staff",
            "created_at",
        ]
        read_only_fields = fields


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """Atualização do próprio perfil (cliente ou staff)."""

    email = serializers.EmailField(read_only=True)
    role = serializers.CharField(read_only=True)
    is_staff = serializers.BooleanField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    permissions = serializers.JSONField(read_only=True)

    class Meta:
        model = User
        fields = UserSerializer.Meta.fields
        read_only_fields = ["id", "email", "role", "permissions", "is_staff", "created_at"]

    def validate_phone(self, value: str) -> str:
        return validate_phone(value) if value else value


class ChangePasswordSerializer(serializers.Serializer):
    """Mudança de password com confirmação da atual."""

    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=8)

    def validate_new_password(self, value: str) -> str:
        validate_password(value)
        return value

    def validate(self, attrs):
        user = self.context["request"].user
        if not user.check_password(attrs["old_password"]):
            raise serializers.ValidationError({"old_password": "Password atual incorreta."})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """Pedido de reposição — envia e-mail com link assinado (stateless)."""

    email = serializers.EmailField()


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Reposição com token assinado + nova password."""

    email = serializers.EmailField()
    token = serializers.CharField()
    password = serializers.CharField(min_length=8)

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value


class AdminUserCreateSerializer(serializers.Serializer):
    """Criação de utilizador (staff) — cliente ou staff com cargo."""

    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, write_only=True)
    first_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    last_name = serializers.CharField(max_length=80, required=False, allow_blank=True)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    role = serializers.ChoiceField(choices=StaffRole.choices, default=StaffRole.USER)

    def validate_email(self, value: str) -> str:
        normalized = normalize_email(value)
        if User.objects.filter(email=normalized).exists():
            raise serializers.ValidationError("Já existe uma conta com este e-mail.")
        return normalized

    def create(self, validated_data: dict) -> User:
        password = validated_data.pop("password")
        role = validated_data.get("role", StaffRole.USER)
        validated_data["is_staff"] = role != StaffRole.USER
        return User.objects.create_user(password=password, **validated_data)


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Atualização de um utilizador por staff — nome, telefone, cargo, ativo."""

    email = serializers.EmailField(read_only=True)
    role = serializers.ChoiceField(choices=StaffRole.choices)
    permissions = serializers.JSONField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "phone",
            "role",
            "permissions",
            "is_active",
            "is_staff",
            "created_at",
        ]
        read_only_fields = ["id", "email", "permissions", "created_at", "is_staff"]

    def validate_phone(self, value: str) -> str:
        return validate_phone(value) if value else value

    def update(self, instance, validated_data):
        user = super().update(instance, validated_data)
        user.is_staff = user.role != StaffRole.USER
        user.save(update_fields=["is_staff"])
        return user


class AdminResetPasswordSerializer(serializers.Serializer):
    """Nova password definida por um staff para outro utilizador."""

    password = serializers.CharField(min_length=8)

    def validate_password(self, value: str) -> str:
        validate_password(value)
        return value