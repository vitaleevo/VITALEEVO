"""Fixtures partilhadas por todos os testes (DRY — uma única definição)."""
import pytest
from rest_framework.test import APIClient


@pytest.fixture
def client():
    """APIClient do DRF (JSON correto, JWT) — substitui o test Client do Django."""
    return APIClient()


@pytest.fixture
def admin_user(django_user_model):
    return django_user_model.objects.create_superuser(
        email="admin@teste.ao", password="SenhaForte123!"
    )


@pytest.fixture
def admin_client(admin_user):
    client = APIClient()
    client.force_authenticate(user=admin_user)
    return client