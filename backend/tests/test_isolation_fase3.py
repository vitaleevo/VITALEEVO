import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_isolation.db"
os.environ["SECRET_KEY"] = "test-secret-key-change-me-1234567890"
os.environ["FIRST_ADMIN_PASSWORD"] = "AdminTeste123!"

import pathlib
import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    try:
        pathlib.Path("./test_isolation.db").unlink()
    except: pass
    with TestClient(app) as c:
        yield c


def register_and_login(client, email, password="Teste1234!"):
    r = client.post("/api/v1/auth/register", json={"email": email, "password": password, "first_name": "Test", "last_name": "User", "phone": "+244900000000"})
    # 201 ou 409 se já existe
    assert r.status_code in (201, 409), r.text
    r = client.post("/api/v1/auth/login", json={"email": email, "password": password})
    assert r.status_code == 200, r.text
    return r.json()["access"]


def test_isolamento_entre_contas(client):
    token_a = register_and_login(client, "alice_fase3@vitaleevo.ao")
    token_b = register_and_login(client, "bob_fase3@vitaleevo.ao")
    ha = {"Authorization": f"Bearer {token_a}"}
    hb = {"Authorization": f"Bearer {token_b}"}

    # 1. Moradas
    r = client.post("/api/v1/commerce/addresses", json={"label": "Casa", "name": "Alice", "phone": "+244923000001", "city": "Luanda", "address": "Rua Alice 123, Luanda", "is_default": True}, headers=ha)
    assert r.status_code == 201, r.text
    addr_id_a = r.json()["id"]
    r = client.post("/api/v1/commerce/addresses", json={"label": "Casa", "name": "Bob", "phone": "+244923000002", "city": "Luanda", "address": "Rua Bob 456, Luanda"}, headers=hb)
    assert r.status_code == 201
    addr_id_b = r.json()["id"]
    # A não vê morada de B
    r = client.get("/api/v1/commerce/addresses", headers=ha)
    assert r.status_code == 200
    assert addr_id_a in [x["id"] for x in r.json()]
    assert addr_id_b not in [x["id"] for x in r.json()]
    # A tenta ler morada de B diretamente -> 404 mascarado
    r = client.patch(f"/api/v1/commerce/addresses/{addr_id_b}", json={"city": "Benguela"}, headers=ha)
    assert r.status_code == 404
    r = client.delete(f"/api/v1/commerce/addresses/{addr_id_b}", headers=ha)
    assert r.status_code == 404

    # 2. Wishlist (precisa produto ativo)
    # Usa produto seed "portatil-hp-250-g8"
    r = client.post("/api/v1/commerce/wishlist/toggle", json={"product": "portatil-hp-250-g8"}, headers=ha)
    assert r.status_code == 200, r.text
    r = client.get("/api/v1/commerce/wishlist", headers=ha)
    assert r.status_code == 200
    assert len(r.json()) == 1
    r = client.get("/api/v1/commerce/wishlist", headers=hb)
    assert r.status_code == 200
    assert len(r.json()) == 0
    # Bob não pode deletar favorito de Alice
    fav_id_a = client.get("/api/v1/commerce/wishlist", headers=ha).json()[0]["id"]
    r = client.delete(f"/api/v1/commerce/wishlist/{fav_id_a}", headers=hb)
    assert r.status_code == 404

    # 3. Carrinho
    r = client.post("/api/v1/commerce/cart", json={"product_slug": "portatil-hp-250-g8", "quantity": 2}, headers=ha)
    assert r.status_code == 201, r.text
    cart_id_a = r.json()["id"]
    r = client.get("/api/v1/commerce/cart", headers=ha)
    assert len(r.json()) == 1
    r = client.get("/api/v1/commerce/cart", headers=hb)
    assert len(r.json()) == 0
    # Bob tenta alterar quantidade de Alice -> 404
    r = client.patch(f"/api/v1/commerce/cart/{cart_id_a}/update_quantity", json={"quantity": 5}, headers=hb)
    assert r.status_code == 404

    # 4. Cotações
    r = client.post("/api/v1/quotes/", json={"items": [{"slug": "portatil-hp-250-g8", "quantity": 1}], "company": "Empresa Alice", "message": "Preciso proposta"}, headers=ha)
    assert r.status_code == 201
    # Mine de Alice tem empresa/mensagem, Bob não vê
    r = client.get("/api/v1/quotes/mine", headers=ha)
    assert r.status_code == 200
    assert len(r.json()) == 1
    assert r.json()[0]["company"] == "Empresa Alice"
    assert "message" in r.json()[0]
    r = client.get("/api/v1/quotes/mine", headers=hb)
    assert len(r.json()) == 0

    # 5. Pedidos
    r = client.post("/api/v1/commerce/orders", json={"customer_name": "Alice", "customer_email": "alice_fase3@vitaleevo.ao", "customer_phone": "+244923000001", "items": [{"slug": "portatil-hp-250-g8", "quantity": 1}], "shipping_address": {"name": "Alice", "address": "Rua Alice 123"}}, headers=ha)
    assert r.status_code == 201, r.text
    order_id_a = r.json()["id"]
    r = client.get("/api/v1/commerce/orders/mine", headers=ha)
    assert any(o["id"] == order_id_a for o in r.json())
    r = client.get("/api/v1/commerce/orders/mine", headers=hb)
    assert not any(o["id"] == order_id_a for o in r.json())
    # Bob tenta ler pedido de Alice direto -> 404 mascarado
    r = client.get(f"/api/v1/commerce/orders/{order_id_a}", headers=hb)
    assert r.status_code == 404

    # 6. Notificações (criadas automaticamente em pedidos/cotações)
    r = client.get("/api/v1/commerce/notifications", headers=ha)
    assert r.status_code == 200
    # Bob não vê notificações de Alice
    notif_ids_a = [n["id"] for n in r.json()]
    if notif_ids_a:
        r = client.post(f"/api/v1/commerce/notifications/{notif_ids_a[0]}/mark_read", headers=hb)
        assert r.status_code == 404
