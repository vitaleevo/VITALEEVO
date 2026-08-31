"""Fase 3 isolamento — prova que 2 contas não cruzam dados."""
import pytest
from rest_framework.test import APIClient

from apps.catalog.models import Category, Product

pytestmark = pytest.mark.django_db


@pytest.fixture
def category():
    return Category.objects.create(name="Isolamento", slug="isolamento", type="store")


@pytest.fixture
def product(category):
    return Product.objects.create(
        name="Prod Isolamento", slug="prod-isolamento", description="D",
        price="10000.00", image="https://exemplo.ao/p.jpg",
        category=category, stock=10, status="published",
    )


@pytest.fixture
def alice(django_user_model):
    return django_user_model.objects.create_user(email="alice@vitaleevo.ao", password="Teste1234!")


@pytest.fixture
def bob(django_user_model):
    return django_user_model.objects.create_user(email="bob@vitaleevo.ao", password="Teste1234!")


@pytest.fixture
def client_alice(alice):
    c = APIClient()
    c.force_authenticate(user=alice)
    return c


@pytest.fixture
def client_bob(bob):
    c = APIClient()
    c.force_authenticate(user=bob)
    return c


def _ids_from_response(resp):
    data = resp.json()
    if isinstance(data, dict) and "results" in data:
        return [x["id"] for x in data["results"]]
    if isinstance(data, list):
        return [x["id"] for x in data]
    return []

def test_moradas_isoladas(client_alice, client_bob):
    r = client_alice.post("/api/v1/commerce/addresses/", {"label": "Casa", "name": "Alice", "phone": "+244923000001", "city": "Luanda", "address": "Rua Alice 123, Luanda", "is_default": True}, format="json")
    assert r.status_code == 201
    alice_addr = r.json()["id"]
    r = client_bob.post("/api/v1/commerce/addresses/", {"label": "Casa", "name": "Bob", "phone": "+244923000002", "city": "Luanda", "address": "Rua Bob 456, Luanda"}, format="json")
    assert r.status_code == 201
    bob_addr = r.json()["id"]
    # Alice não vê de Bob
    ids_alice = _ids_from_response(client_alice.get("/api/v1/commerce/addresses/"))
    assert alice_addr in ids_alice and bob_addr not in ids_alice
    # Alice tenta patch de Bob → 404
    assert client_alice.patch(f"/api/v1/commerce/addresses/{bob_addr}/", {"city": "Benguela"}, format="json").status_code == 404
    assert client_alice.delete(f"/api/v1/commerce/addresses/{bob_addr}/").status_code == 404


def test_wishlist_isolado(client_alice, client_bob, product):
    r = client_alice.post("/api/v1/commerce/wishlist/toggle/", {"product": "prod-isolamento"}, format="json")
    assert r.status_code == 200 and r.json()["favorited"] is True
    assert len(client_alice.get("/api/v1/commerce/wishlist/").json()) == 1
    assert len(client_bob.get("/api/v1/commerce/wishlist/").json()) == 0
    # Bob não pode deletar favorito de Alice
    fav_id = client_alice.get("/api/v1/commerce/wishlist/").json()[0]["id"]
    assert client_bob.delete(f"/api/v1/commerce/wishlist/{fav_id}/").status_code in (404, 204)
    # confirma ainda existe para Alice
    assert len(client_alice.get("/api/v1/commerce/wishlist/").json()) == 1


def test_carrinho_isolado(client_alice, client_bob, product):
    r = client_alice.post("/api/v1/commerce/cart/", {"product_slug": "prod-isolamento", "quantity": 2}, format="json")
    assert r.status_code == 201
    cart_id = r.json()["id"]
    assert len(client_alice.get("/api/v1/commerce/cart/").json()) == 1
    assert len(client_bob.get("/api/v1/commerce/cart/").json()) == 0
    # Bob tenta alterar quantidade de Alice
    assert client_bob.patch(f"/api/v1/commerce/cart/{cart_id}/update_quantity/", {"quantity": 5}, format="json").status_code in (404, 400)


def test_pedidos_isolados(client_alice, client_bob, product):
    r = client_alice.post("/api/v1/commerce/orders/", {"items": [{"slug": "prod-isolamento", "quantity": 1}], "shipping_address": {}}, format="json")
    assert r.status_code == 201
    order_id = r.json()["id"]
    order_number = r.json()["order_number"]
    # Bob não vê via retrieve
    assert client_bob.get(f"/api/v1/commerce/orders/{order_id}/").status_code == 403
    # Bob mine não lista
    assert order_id not in [x["id"] for x in client_bob.get("/api/v1/commerce/orders/mine/").json()]
    # Alice vê
    assert client_alice.get(f"/api/v1/commerce/orders/{order_id}/").status_code == 200
    # Cotação isolada
    r = client_alice.post("/api/v1/quotes/", {"name": "Alice", "email": "alice@vitaleevo.ao", "phone": "+244923000001", "items": [{"product": "prod-isolamento", "quantity": 1}]}, format="json")
    assert r.status_code == 201
    public_id = r.json()["public_id"]
    token = r.json()["access_token"]
    # Bob autenticado não lista quotes de Alice via manage sem permissão (401) e via public sem token não vê dados sensíveis
    # Verifica que status público com token errado falha (400 validação ou 404 não encontrado — ambos bloqueiam)
    assert client_bob.post("/api/v1/quotes/status/", {"public_id": public_id, "access_token": "wrong"}, format="json").status_code in (400, 404)
    # Com token correto vê mas sem PII (email)
    r2 = client_bob.post("/api/v1/quotes/status/", {"public_id": public_id, "access_token": token}, format="json")
    assert r2.status_code == 200
    assert "email" not in r2.json()
