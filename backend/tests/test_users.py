"""Testes de conta — perfil, password e gestão de utilizadores por staff."""
import pytest
from django.core.management import call_command
from django.core.management.base import CommandError
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework.test import APIClient
from rest_framework_simplejwt.token_blacklist.models import BlacklistedToken, OutstandingToken
from rest_framework_simplejwt.tokens import RefreshToken

from apps.users.models import User

pytestmark = pytest.mark.django_db


@pytest.fixture
def regular_user(django_user_model):
    return django_user_model.objects.create_user(email="cliente@teste.ao", password="SenhaForte123!")


@pytest.fixture
def user_client(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


class TestProfile:
    def test_me_returns_profile_with_permissions(self, user_client, regular_user):
        response = user_client.get("/api/v1/auth/me/")
        assert response.status_code == 200
        assert response.json()["email"] == "cliente@teste.ao"
        assert response.json()["permissions"] == []

    def test_update_profile(self, user_client):
        response = user_client.patch(
            "/api/v1/auth/me/", {"first_name": "Ana", "phone": "+244 923 000 000"}, format="json"
        )
        assert response.status_code == 200
        assert response.json()["first_name"] == "Ana"

    def test_change_password(self, user_client, regular_user):
        response = user_client.post(
            "/api/v1/auth/change-password/",
            {"old_password": "SenhaForte123!", "new_password": "NovaSenhaForte456!"},
            format="json",
        )
        assert response.status_code == 200
        regular_user.refresh_from_db()
        assert regular_user.check_password("NovaSenhaForte456!")

    def test_change_password_wrong_old(self, user_client):
        response = user_client.post(
            "/api/v1/auth/change-password/",
            {"old_password": "errada", "new_password": "NovaSenhaForte456!"},
            format="json",
        )
        assert response.status_code == 400


class TestPasswordReset:
    def test_request_reset_always_ok(self, client, regular_user, mailoutbox):
        response = client.post("/api/v1/auth/password-reset/", {"email": "cliente@teste.ao"}, format="json")
        assert response.status_code == 200
        assert len(mailoutbox) == 1
        assert "/recuperar-senha?uid=" in mailoutbox[0].body
        assert "&token=" in mailoutbox[0].body
        assert "email=cliente" not in mailoutbox[0].body

    def test_request_reset_unknown_email_no_email(self, client, mailoutbox):
        response = client.post("/api/v1/auth/password-reset/", {"email": "naoexiste@teste.ao"}, format="json")
        assert response.status_code == 200
        assert len(mailoutbox) == 0

    def test_confirm_reset_with_valid_token(self, client, regular_user, mailoutbox):
        client.post("/api/v1/auth/password-reset/", {"email": "cliente@teste.ao"}, format="json")
        from django.contrib.auth.tokens import default_token_generator

        token = default_token_generator.make_token(regular_user)
        uid = urlsafe_base64_encode(force_bytes(regular_user.pk))
        response = client.post(
            "/api/v1/auth/password-reset/confirm/",
            {"uid": uid, "token": token, "password": "NovaSenhaForte456!"},
            format="json",
        )
        assert response.status_code == 200
        regular_user.refresh_from_db()
        assert regular_user.check_password("NovaSenhaForte456!")

    def test_confirm_reset_invalid_token(self, client, regular_user):
        response = client.post(
            "/api/v1/auth/password-reset/confirm/",
            {"uid": "invalido", "token": "token-invalido", "password": "NovaSenhaForte456!"},
            format="json",
        )
        assert response.status_code == 400


class TestAdminUsers:
    def test_anon_cannot_list_users(self, client):
        assert client.get("/api/v1/auth/users/").status_code == 401

    def test_staff_can_create_and_edit(self, admin_client):
        response = admin_client.post(
            "/api/v1/auth/users/",
            {"email": "staff@teste.ao", "password": "SenhaForte123!", "role": "commercial", "first_name": "Pedro"},
            format="json",
        )
        assert response.status_code == 201
        user = User.objects.get(email="staff@teste.ao")
        assert user.is_staff is True
        assert "quotes:manage" in user.permissions

        response = admin_client.patch(f"/api/v1/auth/users/{user.id}/", {"role": "content", "permissions": ["content:manage", "media:upload"]}, format="json")
        assert response.status_code == 200
        user.refresh_from_db()
        assert "content:manage" in user.permissions
        assert "media:upload" in user.permissions

    def test_super_admin_can_create_user_with_custom_permissions(self, admin_client):
        response = admin_client.post(
            "/api/v1/auth/users/",
            {
                "email": "custom_staff@teste.ao",
                "password": "SenhaForte123!",
                "role": "operations",
                "first_name": "Maria",
                "permissions": ["catalog:manage", "media:upload", "orders:manage"],
            },
            format="json",
        )
        assert response.status_code == 201
        user = User.objects.get(email="custom_staff@teste.ao")
        assert user.is_staff is True
        assert set(user.permissions) == {"catalog:manage", "media:upload", "orders:manage"}

    def test_staff_can_reset_password(self, admin_client, regular_user):
        response = admin_client.post(
            f"/api/v1/auth/users/{regular_user.id}/reset_password/",
            {"password": "NovaSenhaForte456!"},
            format="json",
        )
        assert response.status_code == 200
        regular_user.refresh_from_db()
        assert regular_user.check_password("NovaSenhaForte456!")


class TestMediaUpload:
    def test_anon_cannot_upload(self, client):
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test.png", b"\x89PNG\r\n\x1a\n", content_type="image/png")
        response = client.post("/api/v1/media/upload/", {"file": file}, format="multipart")
        assert response.status_code == 401

    def test_staff_with_media_upload_can_upload(self, admin_client):
        from django.core.files.uploadedfile import SimpleUploadedFile
        file = SimpleUploadedFile("test.png", b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR", content_type="image/png")
        response = admin_client.post("/api/v1/media/upload/", {"file": file}, format="multipart")
        assert response.status_code == 200
        assert "url" in response.json()
        assert response.json()["size"] == len(b"\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR")

    def test_svg_is_rejected(self, admin_client):
        from django.core.files.uploadedfile import SimpleUploadedFile

        file = SimpleUploadedFile(
            "attack.svg",
            b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>',
            content_type="image/svg+xml",
        )
        response = admin_client.post("/api/v1/media/upload/", {"file": file}, format="multipart")
        assert response.status_code == 400

    def test_spoofed_png_is_rejected(self, admin_client):
        from django.core.files.uploadedfile import SimpleUploadedFile

        file = SimpleUploadedFile("attack.png", b"not-a-real-image", content_type="image/png")
        response = admin_client.post("/api/v1/media/upload/", {"file": file}, format="multipart")
        assert response.status_code == 400


class TestEnsureAdminCommand:
    def test_requires_explicit_email(self):
        with pytest.raises(CommandError):
            call_command("ensure_admin")

    def test_creates_admin_and_preserves_password_without_rotation(self):
        call_command("ensure_admin", email="secure-admin@teste.ao", password="SenhaForte123!")
        user = User.objects.get(email="secure-admin@teste.ao")
        assert user.is_superuser is True
        assert user.check_password("SenhaForte123!")

        call_command("ensure_admin", email=user.email, password="OutraSenha456!")
        user.refresh_from_db()
        assert user.check_password("SenhaForte123!")

    def test_rotates_existing_password_only_when_requested(self):
        user = User.objects.create_user(email="rotate-admin@teste.ao", password="SenhaForte123!")
        RefreshToken.for_user(user)
        call_command(
            "ensure_admin",
            email=user.email,
            password="OutraSenha456!",
            rotate_password=True,
        )
        user.refresh_from_db()
        assert user.is_superuser is True
        assert user.check_password("OutraSenha456!")
        outstanding = OutstandingToken.objects.get(user=user)
        assert BlacklistedToken.objects.filter(token=outstanding).exists()
