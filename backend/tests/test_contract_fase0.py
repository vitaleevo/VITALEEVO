import os
os.environ["DATABASE_URL"] = "sqlite+aiosqlite:///./test_contract.db"
os.environ["FIRST_ADMIN_PASSWORD"] = "AdminTeste123!"
os.environ["SECRET_KEY"] = "test-secret-key-change-me-1234567890"

import pytest
from fastapi.testclient import TestClient

from app.main import app


@pytest.fixture(scope="module")
def client():
    # Garante DB limpo
    import pathlib
    try:
        pathlib.Path("./test_contract.db").unlink()
    except: pass
    with TestClient(app) as c:
        yield c


def get_admin_token(client):
    r = client.post("/api/v1/auth/login", json={"email": "admin@vitaleevo.ao", "password": "AdminTeste123!"})
    assert r.status_code == 200, r.text
    return r.json()["access"]


def test_blog_contract_campos_persistidos(client):
    token = get_admin_token(client)
    h = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Contrato Blog VitalEvo - Teste Completo",
        "slug": "contrato-blog-teste-completo",
        "category": "tecnologia",
        "excerpt": "Resumo para contrato",
        "content": "<p>Conteúdo rico com <strong>HTML</strong></p>",
        "image": "https://images.unsplash.com/photo-123?w=800",
        "status": "published",
        "is_featured": True,
        "read_time": "8",
    }
    r = client.post("/api/v1/blog/articles/", json=payload, headers=h)
    assert r.status_code == 201, r.text
    data = r.json()
    # Cada campo salvo deve ser devolvido
    for k in ["title", "slug", "category", "excerpt", "content", "image", "status", "is_featured", "read_time"]:
        assert str(data.get(k)) == str(payload[k]), f"campo {k} divergente: {data.get(k)!r} != {payload[k]!r}"
    # Verifica que persiste após nova leitura (simula reinício - leitura direta)
    slug = data["slug"]
    r2 = client.get(f"/api/v1/blog/articles/{slug}/")
    # Público vê apenas published, mas sem auth deve ver
    # Como criamos como published, deve aparecer
    assert r2.status_code == 200, r2.text
    data2 = r2.json()
    assert data2["title"] == payload["title"]
    # Verifica listagem pública
    r3 = client.get("/api/v1/blog/articles/?page_size=100")
    assert r3.status_code == 200
    assert any(x["slug"] == slug for x in r3.json()["results"])


def test_portfolio_contract_todos_campos(client):
    token = get_admin_token(client)
    h = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": "Projeto Contrato Completo",
        "slug": "projeto-contrato-completo",
        "client": "Cliente VitalEvo Teste",
        "year": 2026,
        "category": "redes",
        "image": "https://images.unsplash.com/photo-456?w=800",
        "images": "https://images.unsplash.com/photo-1?w=800, https://images.unsplash.com/photo-2?w=800",
        "order": 5,
        "status": "published",
        "is_featured": True,
        "description": "Resumo curto",
        "full_description": "<p>Estudo de caso completo</p>",
        "challenge": "Desafio do cliente",
        "solution": "Solução proposta",
        "results": "Resultado A, Resultado B, Resultado C",
        "tags": "React, FastAPI, Postgres",
        "seo_title": "SEO Projeto",
        "seo_description": "Descrição SEO",
    }
    r = client.post("/api/v1/portfolio/projects/", json=payload, headers=h)
    assert r.status_code == 201, r.text
    data = r.json()
    # Verifica campos críticos
    assert data["title"] == payload["title"]
    assert data["client"] == payload["client"]
    assert data["year"] == payload["year"]
    assert data["category"] == payload["category"]
    assert data.get("order", data.get("display_order")) == payload["order"]
    assert data.get("display_order", data.get("order")) == payload["order"]
    assert data["description"] == payload["description"]
    assert data["full_description"] == payload["full_description"]
    assert data["challenge"] == payload["challenge"]
    assert data["solution"] == payload["solution"]
    # results e tags vêm como lista
    assert "Resultado A" in str(data["results"])
    assert "React" in str(data["tags"])
    assert data["seo_title"] == payload["seo_title"]
    # Persiste após leitura
    slug = data["slug"]
    r2 = client.get(f"/api/v1/portfolio/projects/{slug}/")
    assert r2.status_code == 200, r2.text
    data2 = r2.json()
    assert data2["client"] == payload["client"]
    assert data2["year"] == 2026
    # Listagem pública deve incluir
    r3 = client.get("/api/v1/portfolio/projects/?page_size=100")
    assert r3.status_code == 200
    assert any(x["slug"] == slug for x in r3.json()["results"])
    # Arquivamento ao invés de hard delete
    r4 = client.delete(f"/api/v1/portfolio/projects/{slug}/", headers=h)
    assert r4.status_code == 200
    assert "arquivado" in r4.json()["detail"].lower()
    # Após arquivar, público não vê
    r5 = client.get(f"/api/v1/portfolio/projects/{slug}/")
    assert r5.status_code == 404
    # Admin com token ainda pode ver via filtro status=archived
    r6 = client.get("/api/v1/portfolio/projects/?status=archived&page_size=100", headers=h)
    assert r6.status_code == 200
    assert any(x["slug"] == slug for x in r6.json()["results"])


def test_blog_arquivamento_nao_hard_delete(client):
    token = get_admin_token(client)
    h = {"Authorization": f"Bearer {token}"}
    # Cria
    r = client.post("/api/v1/blog/articles/", json={"title": "Para Arquivar", "content": "x", "status": "published"}, headers=h)
    assert r.status_code == 201
    slug = r.json()["slug"]
    # Deleta (arquiva)
    r2 = client.delete(f"/api/v1/blog/articles/{slug}/", headers=h)
    assert r2.status_code == 200
    assert "arquivado" in r2.json()["detail"].lower()
    # Público não vê
    r3 = client.get(f"/api/v1/blog/articles/{slug}/")
    assert r3.status_code == 404
    # Admin vê via filtro
    r4 = client.get("/api/v1/blog/articles/?status=archived&page_size=100", headers=h)
    assert any(x["slug"] == slug for x in r4.json()["results"])
