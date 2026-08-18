"""Testes do comércio — checkout, conta do cliente e gestão de encomendas."""
import io
import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product
from apps.commerce.models import Address, CartItem, Notification, Order, WishlistItem

pytestmark = pytest.mark.django_db


@pytest.fixture
def store_category():
    return Category.objects.create(name="Informática", slug="informatica", type="store")


@pytest.fixture
def product(store_category):
    return Product.objects.create(
        name="Impressora", slug="impressora", description="D",
        price="50000.00", image="https://exemplo.ao/i.jpg",
        category=store_category, stock=10, status="published",
    )


@pytest.fixture
def regular_user(django_user_model):
    return django_user_model.objects.create_user(email="cliente@teste.ao", password="SenhaForte123!")


@pytest.fixture
def user_client(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


class TestCheckout:
    def test_guest_order_creates_and_decrements_stock(self, client, product):
        response = client.post(
            "/api/v1/commerce/orders/",
            {
                "items": [{"slug": "impressora", "quantity": 2}],
                "guest_email": "comprador@teste.ao",
                "guest_name": "Comprador",
                "shipping_address": {"city": "Luanda", "address": "Rua X", "phone": "+244 923 000 000"},
                "payment_method": "transferência",
            },
            format="json",
        )
        assert response.status_code == 201
        data = response.json()
        assert data["order_number"].startswith("VE-")
        assert str(data["subtotal"]) == "100000.00"
        assert str(data["shipping"]) == "1000.00"
        assert str(data["total"]) == "101000.00"
        assert data["items"][0]["name"] == "Impressora"
        product.refresh_from_db()
        assert product.stock == 8

    def test_order_requires_stock(self, client, product):
        response = client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 99}], "shipping_address": {}},
            format="json",
        )
        assert response.status_code == 400

    def test_order_retrieve_requires_token(self, client, product):
        created = client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "guest_email": "g@t.ao", "shipping_address": {}},
            format="json",
        ).json()
        order = Order.objects.get(order_number=created["order_number"])
        assert client.get(f"/api/v1/commerce/orders/{order.id}/").status_code == 403
        assert client.get(f"/api/v1/commerce/orders/{order.id}/?access_token={order.access_token}").status_code == 200


class TestCustomerAccount:
    def test_address_crud_and_default(self, user_client, regular_user):
        response = user_client.post(
            "/api/v1/commerce/addresses/",
            {"label": "Casa", "name": "Cliente", "phone": "+244 923 000 000", "city": "Luanda", "address": "Rua X", "is_default": True},
            format="json",
        )
        assert response.status_code == 201
        address_id = response.json()["id"]
        second = user_client.post(
            "/api/v1/commerce/addresses/",
            {"label": "Trabalho", "name": "Cliente", "phone": "+244 923 000 000", "city": "Benguela", "address": "Av Y", "is_default": True},
            format="json",
        )
        assert second.status_code == 201
        assert Address.objects.filter(user=regular_user, is_default=True).count() == 1

    def test_anon_cannot_manage_addresses(self, client):
        assert client.post("/api/v1/commerce/addresses/", {}, format="json").status_code == 401

    def test_wishlist_toggle(self, user_client, product):
        response = user_client.post("/api/v1/commerce/wishlist/toggle/", {"product": "impressora"}, format="json")
        assert response.status_code == 200 and response.json()["favorited"] is True
        assert user_client.get("/api/v1/commerce/wishlist/").json()[0]["product"] == "impressora"
        response = user_client.post("/api/v1/commerce/wishlist/toggle/", {"product": "impressora"}, format="json")
        assert response.json()["favorited"] is False

    def test_cart_add_and_count(self, user_client, product):
        user_client.post("/api/v1/commerce/cart/", {"product_slug": "impressora", "quantity": 3}, format="json")
        user_client.post("/api/v1/commerce/cart/", {"product_slug": "impressora", "quantity": 2}, format="json")
        assert user_client.get("/api/v1/commerce/cart/count/").json()["count"] == 5
        assert len(user_client.get("/api/v1/commerce/cart/").json()) == 1

    def test_order_creates_notification(self, user_client, product, regular_user):
        user_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": {}},
            format="json",
        )
        assert Notification.objects.filter(user=regular_user, type="order").count() == 1
        assert user_client.get("/api/v1/commerce/notifications/unread_count/").json()["count"] == 1


class TestAdminOrders:
    def test_staff_lists_and_stats(self, admin_client, product):
        admin_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "guest_email": "g@t.ao", "shipping_address": {}},
            format="json",
        )
        assert admin_client.get("/api/v1/commerce/orders/manage/stats/").json()["total_orders"] == 1
        assert admin_client.get("/api/v1/commerce/orders/manage/").status_code == 200

    def test_status_update_notifies_user(self, admin_client, user_client, product, regular_user):
        order = user_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": {}},
            format="json",
        ).json()
        response = admin_client.post(
            f"/api/v1/commerce/orders/manage/{order['id']}/update_status/",
            {"status": "shipped"},
            format="json",
        )
        assert response.status_code == 200
        assert Notification.objects.filter(user=regular_user, title__icontains="Enviado").exists()

    def test_anon_cannot_manage_orders(self, client, product):
        assert client.get("/api/v1/commerce/orders/manage/").status_code == 401


class TestMediaUpload:
    def test_upload_requires_staff(self, client):
        response = client.post(
            "/api/v1/media/upload/",
            {"file": SimpleUploadedFile("a.png", b"png", content_type="image/png")},
            format="multipart",
        )
        assert response.status_code in {401, 403}

    def test_upload_rejects_bad_type(self, admin_client):
        response = admin_client.post(
            "/api/v1/media/upload/",
            {"file": SimpleUploadedFile("a.txt", b"texto", content_type="text/plain")},
            format="multipart",
        )
        assert response.status_code == 400

    def test_upload_returns_url(self, admin_client):
        response = admin_client.post(
            "/api/v1/media/upload/",
            {"file": SimpleUploadedFile("a.png", b"\x89PNG\r\n\x1a\n", content_type="image/png")},
            format="multipart",
        )
        assert response.status_code == 200
        assert "/media/uploads/" in response.json()["url"]