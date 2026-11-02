"""Testes do comércio — pricing, reserva, pagamento, reconciliação e conta."""
import hashlib
import hmac
import io
import json
from decimal import Decimal

import pytest
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import override_settings
from rest_framework.test import APIClient

from apps.catalog.models import Category, InventoryMovement, Product
from apps.commerce.models import (
    Address,
    CartItem,
    Notification,
    Order,
    Payment,
    PaymentEvent,
    PaymentProvider,
    PaymentStatus,
    WishlistItem,
)

pytestmark = pytest.mark.django_db


@pytest.fixture
def store_category():
    return Category.objects.create(name="Informática", slug="informatica", type="store")


@pytest.fixture
def product(store_category):
    return Product.objects.create(
        name="Impressora",
        slug="impressora",
        description="D",
        price="50000.00",
        image="https://exemplo.ao/i.jpg",
        category=store_category,
        stock=10,
        status="published",
    )


@pytest.fixture
def regular_user(django_user_model):
    return django_user_model.objects.create_user(email="cliente@teste.ao", password="SenhaForte123!")


@pytest.fixture
def user_client(regular_user):
    client = APIClient()
    client.force_authenticate(user=regular_user)
    return client


def address_payload():
    return {"name": "Comprador", "phone": "+244 923 000 000", "city": "Luanda", "address": "Rua X"}


def create_guest_order(client, quantity=1, payment_method="bank_transfer"):
    return client.post(
        "/api/v1/commerce/orders/",
        {
            "items": [{"slug": "impressora", "quantity": quantity}],
            "guest_email": "comprador@teste.ao",
            "guest_name": "Comprador",
            "shipping_address": address_payload(),
            "payment_method": payment_method,
        },
        format="json",
    )


class TestCheckoutPricingAndStock:
    def test_preview_uses_server_price_stock_shipping_and_vat(self, client, product):
        response = client.post(
            "/api/v1/commerce/orders/preview/",
            {"items": [{"slug": "impressora", "quantity": 2}]},
            format="json",
        )
        assert response.status_code == 200
        data = response.json()
        assert data["currency"] == "AOA"
        assert Decimal(str(data["subtotal"])) == Decimal("100000.00")
        assert Decimal(str(data["shipping"])) == Decimal("1000.00")
        assert Decimal(str(data["tax_rate"])) == Decimal("14.00")
        assert Decimal(str(data["tax_amount"])) == Decimal("12403.51")
        assert Decimal(str(data["total"])) == Decimal("101000.00")
        assert data["prices_include_tax"] is True
        assert data["items"][0]["available_stock"] == 10
        assert data["items"][0]["max_quantity"] == 10

    def test_guest_order_reserves_without_decrementing_physical_stock(self, client, product):
        response = create_guest_order(client, quantity=2)
        assert response.status_code == 201
        data = response.json()
        assert data["order_number"].startswith("VE-")
        assert data["access_token"]
        assert str(data["subtotal"]) == "100000.00"
        assert str(data["tax_amount"]) == "12403.51"
        assert str(data["total"]) == "101000.00"
        product.refresh_from_db()
        assert product.stock == 10
        assert product.reserved_stock == 2
        assert product.available_stock == 8
        movement = InventoryMovement.objects.get(product=product, type="reserved")
        assert movement.quantity == -2

    def test_second_order_cannot_consume_reserved_units(self, client, product):
        assert create_guest_order(client, quantity=8).status_code == 201
        response = create_guest_order(client, quantity=3)
        assert response.status_code == 400
        product.refresh_from_db()
        assert product.stock == 10
        assert product.reserved_stock == 8
        assert product.available_stock == 2

    def test_guest_checkout_requires_identity_and_shipping_fields(self, client, product):
        response = client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": {}},
            format="json",
        )
        assert response.status_code == 400
        assert "guest_email" in response.json() or "shipping_address" in response.json()

    def test_cancel_releases_reservation_without_changing_physical_stock(self, client, product):
        created = create_guest_order(client, quantity=2).json()
        order = Order.objects.get(order_number=created["order_number"])
        response = client.post(
            f"/api/v1/commerce/orders/{order.id}/cancel/",
            {"access_token": created["access_token"]},
            format="json",
        )
        assert response.status_code == 200
        product.refresh_from_db()
        assert product.stock == 10
        assert product.reserved_stock == 0
        assert InventoryMovement.objects.filter(product=product, type="released", quantity=2).count() == 1

    def test_order_retrieve_and_by_number_accept_guest_token(self, client, product):
        created = create_guest_order(client).json()
        order = Order.objects.get(order_number=created["order_number"])
        assert client.get(f"/api/v1/commerce/orders/{order.id}/").status_code == 403
        assert client.get(f"/api/v1/commerce/orders/{order.id}/?access_token={created['access_token']}").status_code == 200
        by_number = client.get(
            f"/api/v1/commerce/orders/by-number/?order_number={order.order_number}&access_token={created['access_token']}"
        )
        assert by_number.status_code == 200


class TestPaymentsAndReconciliation:
    def test_bank_transfer_payment_can_be_confirmed_by_staff(self, client, admin_client, product):
        created = create_guest_order(client, quantity=2).json()
        order = Order.objects.get(order_number=created["order_number"])
        init = client.post(
            f"/api/v1/commerce/orders/{order.id}/payment/",
            {"provider": "bank_transfer", "access_token": created["access_token"]},
            format="json",
        )
        assert init.status_code == 201
        assert init.json()["status"] == "awaiting"
        payment = Payment.objects.get(id=init.json()["id"])

        confirmed = admin_client.post(
            f"/api/v1/commerce/payments/manage/{payment.id}/confirm_manual/",
            {},
            format="json",
        )
        assert confirmed.status_code == 200
        payment.refresh_from_db()
        order.refresh_from_db()
        product.refresh_from_db()
        assert payment.status == PaymentStatus.PAID
        assert order.status == "paid"
        assert order.paid_at is not None
        assert product.stock == 8
        assert product.reserved_stock == 0
        assert InventoryMovement.objects.filter(product=product, type="fulfilled", quantity=-2).count() == 1

    @override_settings(PROXYPAY_RPS_API_KEY="test-hmac-key")
    def test_rps_webhook_is_signed_idempotent_and_reconciles(self, client, product):
        created = create_guest_order(client, quantity=1).json()
        order = Order.objects.get(order_number=created["order_number"])
        payment = Payment.objects.create(
            order=order,
            provider=PaymentProvider.PROXYPAY_RPS,
            status=PaymentStatus.AWAITING,
            amount=order.total,
            provider_payment_id="904800000",
            reference_number="904800000",
        )
        payload = {
            "id": 160100011938,
            "reference_id": 904800000,
            "amount": str(order.total),
            "entity_id": 411,
            "datetime": "2026-11-01T20:00:00Z",
        }
        raw = json.dumps(payload, separators=(",", ":")).encode("utf-8")
        signature = hmac.new(b"test-hmac-key", raw, hashlib.sha256).hexdigest()

        first = client.generic(
            "POST",
            "/api/v1/commerce/payments/webhook/proxypay-rps/",
            data=raw,
            content_type="application/json",
            HTTP_X_SIGNATURE=signature,
        )
        assert first.status_code == 200
        assert first.json()["reconciliation_status"] == "matched"
        assert PaymentEvent.objects.count() == 1

        second = client.generic(
            "POST",
            "/api/v1/commerce/payments/webhook/proxypay-rps/",
            data=raw,
            content_type="application/json",
            HTTP_X_SIGNATURE=signature,
        )
        assert second.status_code == 200
        assert PaymentEvent.objects.count() == 1
        payment.refresh_from_db()
        order.refresh_from_db()
        product.refresh_from_db()
        assert payment.status == "paid"
        assert order.status == "paid"
        assert product.stock == 9
        assert product.reserved_stock == 0

    @override_settings(PROXYPAY_RPS_API_KEY="test-hmac-key")
    def test_rps_webhook_rejects_bad_signature(self, client, product):
        raw = b'{"id":1,"reference_id":2,"amount":"100.00"}'
        response = client.generic(
            "POST",
            "/api/v1/commerce/payments/webhook/proxypay-rps/",
            data=raw,
            content_type="application/json",
            HTTP_X_SIGNATURE="bad",
        )
        assert response.status_code == 400
        assert PaymentEvent.objects.count() == 0

    def test_unconfigured_proxypay_does_not_invent_reference(self, client, product):
        created = create_guest_order(client, payment_method="proxypay_rps").json()
        order = Order.objects.get(order_number=created["order_number"])
        response = client.post(
            f"/api/v1/commerce/orders/{order.id}/payment/",
            {"provider": "proxypay_rps", "access_token": created["access_token"]},
            format="json",
        )
        assert response.status_code == 503
        assert Payment.objects.filter(order=order, provider="proxypay_rps", status="failed").exists()


class TestCustomerAccount:
    def test_address_crud_and_default(self, user_client, regular_user):
        response = user_client.post(
            "/api/v1/commerce/addresses/",
            {"label": "Casa", "name": "Cliente", "phone": "+244 923 000 000", "city": "Luanda", "address": "Rua X", "is_default": True},
            format="json",
        )
        assert response.status_code == 201
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
        assert user_client.get("/api/v1/commerce/wishlist/").json()[0]["product"]["slug"] == "impressora"
        response = user_client.post("/api/v1/commerce/wishlist/toggle/", {"product": "impressora"}, format="json")
        assert response.json()["favorited"] is False

    def test_cart_add_count_and_stock_limit(self, user_client, product):
        user_client.post("/api/v1/commerce/cart/", {"product_slug": "impressora", "quantity": 3}, format="json")
        user_client.post("/api/v1/commerce/cart/", {"product_slug": "impressora", "quantity": 2}, format="json")
        assert user_client.get("/api/v1/commerce/cart/count/").json()["count"] == 5
        assert len(user_client.get("/api/v1/commerce/cart/").json()) == 1
        too_much = user_client.post("/api/v1/commerce/cart/", {"product_slug": "impressora", "quantity": 6}, format="json")
        assert too_much.status_code == 400

    def test_order_creates_notification(self, user_client, product, regular_user):
        user_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": address_payload()},
            format="json",
        )
        assert Notification.objects.filter(user=regular_user, type="order").count() == 1
        assert user_client.get("/api/v1/commerce/notifications/unread_count/").json()["count"] == 1


class TestAdminOrders:
    def test_staff_lists_and_stats_only_counts_paid_revenue(self, admin_client, product):
        created = admin_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": address_payload()},
            format="json",
        )
        assert created.status_code == 201
        stats = admin_client.get("/api/v1/commerce/orders/manage/stats/").json()
        assert stats["total_orders"] == 1
        assert str(stats["revenue"]) in {"0", "0.0", "0.00"}
        assert admin_client.get("/api/v1/commerce/orders/manage/").status_code == 200

    def test_status_machine_requires_payment_before_shipping(self, admin_client, product):
        order_data = admin_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 1}], "shipping_address": address_payload()},
            format="json",
        ).json()
        url = f"/api/v1/commerce/orders/manage/{order_data['id']}/update_status/"
        assert admin_client.post(url, {"status": "shipped"}, format="json").status_code == 400
        assert admin_client.post(url, {"status": "paid"}, format="json").status_code == 200
        assert admin_client.post(url, {"status": "processing"}, format="json").status_code == 200
        assert admin_client.post(url, {"status": "shipped"}, format="json").status_code == 200

    def test_cancel_releases_stock_only_once(self, admin_client, product):
        order_data = admin_client.post(
            "/api/v1/commerce/orders/",
            {"items": [{"slug": "impressora", "quantity": 2}], "shipping_address": address_payload()},
            format="json",
        ).json()
        product.refresh_from_db()
        assert product.stock == 10 and product.reserved_stock == 2

        url = f"/api/v1/commerce/orders/manage/{order_data['id']}/update_status/"
        assert admin_client.post(url, {"status": "cancelled"}, format="json").status_code == 200
        product.refresh_from_db()
        assert product.stock == 10 and product.reserved_stock == 0
        assert InventoryMovement.objects.filter(product=product, type="released", quantity=2).count() == 1
        assert admin_client.post(url, {"status": "cancelled"}, format="json").status_code == 200
        product.refresh_from_db()
        assert product.stock == 10 and product.reserved_stock == 0

    def test_anon_cannot_manage_orders_or_payments(self, client):
        assert client.get("/api/v1/commerce/orders/manage/").status_code == 401
        assert client.get("/api/v1/commerce/payments/manage/").status_code == 401
        assert client.get("/api/v1/commerce/payments/manage/events/").status_code == 401


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
