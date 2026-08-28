"""Matriz de autorização dos perfis cliente e backoffice."""

import pytest
from django.contrib.auth import get_user_model
from django.test import Client as DjangoClient

from apps.catalog.models import Category, Product
from apps.cms.models import Service, Setting
from apps.core.enums import StaffRole, get_permissions

User = get_user_model()
API = "/api/v1"


def make_user(role: str):
    return User.objects.create_user(
        email=f"{role}@roles.ao",
        password="SenhaForte123!",
        role=role,
    )


def results(response):
    payload = response.json()
    return payload.get("results", payload) if isinstance(payload, dict) else payload


@pytest.mark.django_db
@pytest.mark.parametrize(
    ("role", "expected"),
    [
        (StaffRole.USER, []),
        (StaffRole.COMMERCIAL, ["quotes:read", "quotes:manage", "contacts:manage", "media:upload"]),
        (StaffRole.CONTENT, ["content:manage", "content:import", "media:upload"]),
        (
            StaffRole.OPERATIONS,
            [
                "catalog:read",
                "catalog:manage",
                "stock:manage",
                "quotes:read",
                "orders:read",
                "orders:manage",
                "media:upload",
            ],
        ),
        (StaffRole.ADMIN, get_permissions(StaffRole.ADMIN)),
    ],
)
def test_role_permission_matrix_is_applied_on_save(role, expected):
    user = make_user(role)
    assert user.permissions == expected
    assert user.is_staff is (role != StaffRole.USER)


@pytest.mark.django_db
def test_client_cannot_open_backoffice(client):
    client.force_authenticate(make_user(StaffRole.USER))
    assert client.get(f"{API}/dashboard/").status_code == 403
    assert client.get(f"{API}/quotes/manage/").status_code == 403
    assert client.get(f"{API}/cms/contacts/").status_code == 403


@pytest.mark.django_db
def test_commercial_dashboard_and_modules_are_scoped(client):
    client.force_authenticate(make_user(StaffRole.COMMERCIAL))

    dashboard = client.get(f"{API}/dashboard/")
    assert dashboard.status_code == 200
    assert {"quotes", "contacts", "newsletter_subscribers"} <= dashboard.json().keys()
    assert not ({"orders", "products", "users", "revenue"} & dashboard.json().keys())
    assert client.get(f"{API}/quotes/manage/").status_code == 200
    assert client.get(f"{API}/cms/contacts/").status_code == 200
    assert client.post(
        f"{API}/cms/services/",
        {"title": "Bloqueado", "slug": "bloqueado", "description": "x"},
        format="json",
    ).status_code == 403


@pytest.mark.django_db
def test_content_can_manage_cms_but_not_commercial_or_catalog(client):
    client.force_authenticate(make_user(StaffRole.CONTENT))

    created = client.post(
        f"{API}/cms/services/",
        {"title": "Novo serviço", "slug": "novo-servico", "description": "Descrição", "status": "draft"},
        format="json",
    )
    assert created.status_code == 201
    assert client.get(f"{API}/cms/services/").status_code == 200
    assert client.get(f"{API}/quotes/manage/").status_code == 403
    assert client.get(f"{API}/cms/contacts/").status_code == 403
    assert client.post(f"{API}/catalog/categories/", {"name": "X", "slug": "x"}, format="json").status_code == 403


@pytest.mark.django_db
def test_operations_can_manage_catalog_and_only_read_quotes(client):
    client.force_authenticate(make_user(StaffRole.OPERATIONS))

    category = client.post(
        f"{API}/catalog/categories/",
        {"name": "Equipamento", "slug": "equipamento", "type": "store"},
        format="json",
    )
    assert category.status_code == 201
    assert client.get(f"{API}/quotes/manage/").status_code == 200
    assert client.post(f"{API}/quotes/manage/", {}, format="json").status_code == 403
    assert client.get(f"{API}/commerce/orders/manage/").status_code == 200
    assert client.get(f"{API}/cms/contacts/").status_code == 403


@pytest.mark.django_db
def test_unrelated_staff_cannot_see_drafts_or_private_settings(client):
    Service.objects.create(title="Rascunho", slug="rascunho", description="privado", status="draft")
    Setting.objects.create(key="site_config", value={"public": True})
    Setting.objects.create(key="resend_api_key", value={"secret": True})
    client.force_authenticate(make_user(StaffRole.COMMERCIAL))

    services = client.get(f"{API}/cms/services/")
    settings = client.get(f"{API}/cms/settings/")
    assert services.status_code == 200
    assert all(item["slug"] != "rascunho" for item in results(services))
    assert [item["key"] for item in results(settings)] == ["site_config"]


@pytest.mark.django_db
def test_unrelated_staff_cannot_see_draft_products(client):
    category = Category.objects.create(name="Loja", slug="loja", type="store")
    Product.objects.create(
        name="Privado",
        slug="privado",
        sku="PRIVADO",
        description="draft",
        price=100,
        image="https://example.com/product.jpg",
        category=category,
        status="draft",
    )
    client.force_authenticate(make_user(StaffRole.CONTENT))
    response = client.get(f"{API}/catalog/products/")
    assert response.status_code == 200
    assert all(item["slug"] != "privado" for item in results(response))


@pytest.mark.django_db
def test_super_admin_has_api_and_django_admin_access(client):
    admin = User.objects.create_superuser(email="superadmin@roles.ao", password="SenhaForte123!")
    client.force_authenticate(admin)
    dashboard = client.get(f"{API}/dashboard/")
    assert dashboard.status_code == 200
    assert {"orders", "quotes", "contacts", "products", "users"} <= dashboard.json().keys()

    django_client = DjangoClient()
    assert django_client.login(username=admin.email, password="SenhaForte123!")
    assert django_client.get("/admin/").status_code == 200
