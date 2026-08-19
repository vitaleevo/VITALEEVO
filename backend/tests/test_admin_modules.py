"""Testes dos novos módulos: dashboard, auditoria, broadcast, import e IA."""
import io

import pytest
from django.contrib.auth import get_user_model
from django.core import mail
from django.core.files.uploadedfile import SimpleUploadedFile
from openpyxl import Workbook

from apps.audit.models import AuditLog
from apps.catalog.models import Brand, Category, Product
from apps.cms.models import Newsletter

User = get_user_model()

API = "/api/v1"


def make_admin():
    return User.objects.create_user(email="admin@vitaleevo.ao", password="pass12345", is_staff=True, role="admin")


def make_xlsx(rows):
    wb = Workbook()
    ws = wb.active
    ws.append(["SKU", "Nome", "Preço", "Stock", "Categoria", "Subcategoria", "Marca", "Descrição"])
    for row in rows:
        ws.append(row)
    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return SimpleUploadedFile("produtos.xlsx", buffer.getvalue(), content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")


@pytest.mark.django_db
def test_dashboard_stats_staff_only(client):
    admin = make_admin()
    client.force_authenticate(admin)
    response = client.get(f"{API}/dashboard/")
    assert response.status_code == 200
    data = response.json()
    assert "revenue" in data and "orders" in data and "quotes" in data
    assert "monthly_revenue" in data and "recent" in data


@pytest.mark.django_db
def test_dashboard_requires_staff(client):
    user = User.objects.create_user(email="cliente@vitaleevo.ao", password="pass12345")
    client.force_authenticate(user)
    assert client.get(f"{API}/dashboard/").status_code == 403


@pytest.mark.django_db
def test_audit_logs_listable_by_admin(client):
    admin = make_admin()
    AuditLog.objects.create(user=admin, action="test.action", resource_type="product", resource_id="abc", details={"x": 1})
    client.force_authenticate(admin)
    response = client.get(f"{API}/audit/logs/")
    assert response.status_code == 200
    data = response.json()
    assert data["count"] == 1
    assert data["results"][0]["action"] == "test.action"


@pytest.mark.django_db
def test_newsletter_broadcast_sends_emails(client, settings):
    admin = make_admin()
    Newsletter.objects.create(email="sub@vitaleevo.ao")
    Newsletter.objects.create(email="inactive@vitaleevo.ao", is_active=False)
    settings.EMAIL_BACKEND = "django.core.mail.backends.locmem.EmailBackend"
    client.force_authenticate(admin)
    response = client.post(f"{API}/cms/newsletters/broadcast/", {"subject": "Oferta", "body": "Corpo"}, format="json")
    assert response.status_code == 200
    assert response.json()["sent"] == 1
    assert len(mail.outbox) == 1


@pytest.mark.django_db
def test_import_products_creates_and_updates(client):
    admin = make_admin()
    client.force_authenticate(admin)
    buffer = make_xlsx([["SKU-001", "Impressora A", 85000, 10, "Impressoras", "Laser", "HP", "desc"], ["SKU-001", "Impressora A2", 90000, 5, "Impressoras", "Laser", "HP", "nova desc"]])
    response = client.post(f"{API}/imports/products/", {"file": buffer}, format="multipart")
    assert response.status_code == 200
    data = response.json()
    assert data["created"] == 1 and data["updated"] == 1 and data["errors"] == []
    product = Product.objects.get(sku="SKU-001")
    assert product.name == "Impressora A2"
    assert product.price == 90000
    assert product.category.name == "Impressoras"
    assert product.subcategory.name == "Laser"
    assert product.brand.name == "HP"


@pytest.mark.django_db
def test_import_requires_catalog_import_permission(client):
    from apps.core.enums import StaffRole, get_permissions

    user = User.objects.create_user(email="oper@vitaleevo.ao", password="pass12345", is_staff=True, role=StaffRole.OPERATIONS)
    user.permissions = get_permissions(StaffRole.OPERATIONS)
    user.save()
    client.force_authenticate(user)
    buffer = make_xlsx([["X", "Produto", 100, 1, "Geral", "", "", ""]])
    response = client.post(f"{API}/imports/products/", {"file": buffer}, format="multipart")
    assert response.status_code == 403


@pytest.mark.django_db
def test_ai_chat_without_key_returns_503(client, settings):
    settings.OPENAI_API_KEY = ""
    response = client.post(f"{API}/ai/chat/", {"message": "Olá"}, format="json")
    assert response.status_code == 503


@pytest.mark.django_db
def test_quote_stats_assign_and_follow_up(client):
    from apps.quotes.models import QuoteRequest
    from apps.quotes.services import create_quote_request

    admin = make_admin()
    quote = create_quote_request(name="Ana", email="ana@x.ao", phone="923000000", items=[{"name": "Site", "quantity": 1}])
    client.force_authenticate(admin)

    stats = client.get(f"{API}/quotes/manage/stats/")
    assert stats.status_code == 200
    assert stats.json()["total"] == 1

    assign = client.post(f"{API}/quotes/manage/{quote.id}/assign/", {"assigned_to": str(admin.id)}, format="json")
    assert assign.status_code == 200
    quote.refresh_from_db()
    assert quote.assigned_to == admin

    follow = client.post(f"{API}/quotes/manage/{quote.id}/follow_up/", {"next_follow_up_at": "2026-09-01T10:00:00Z"}, format="json")
    assert follow.status_code == 200
    quote.refresh_from_db()
    assert quote.next_follow_up_at is not None


@pytest.mark.django_db
def test_import_creates_missing_category_and_brand(client):
    admin = make_admin()
    client.force_authenticate(admin)
    buffer = make_xlsx([["SKU-099", "Produto Novo", 500, 2, "Categoria Nova", "Sub Nova", "Marca Nova", "d"]])
    response = client.post(f"{API}/imports/products/", {"file": buffer}, format="multipart")
    assert response.status_code == 200
    assert response.json()["created"] == 1
    assert Category.objects.filter(name="Categoria Nova").exists()
    assert Brand.objects.filter(name="Marca Nova").exists()