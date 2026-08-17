"""Testes do catálogo — leitura pública, gestão por staff e ajuste de stock."""
import pytest
from rest_framework.test import APIClient

from apps.catalog.models import Brand, Category, Product

pytestmark = pytest.mark.django_db


@pytest.fixture
def category():
    return Category.objects.create(name="Informática", slug="informatica", type="store")


@pytest.fixture
def brand():
    return Brand.objects.create(name="HP", slug="hp")


@pytest.fixture
def product(category, brand):
    return Product.objects.create(
        name="Portátil HP", slug="portatil-hp", sku="HP-001",
        description="Descrição", price="850000.00", image="https://exemplo.ao/img.jpg",
        category=category, brand=brand, stock=5, status="published",
    )


@pytest.fixture
def draft_product(category, brand):
    return Product.objects.create(
        name="Rascunho", slug="rascunho", description="D",
        price="100.00", image="https://exemplo.ao/d.jpg",
        category=category, brand=brand, stock=0, status="draft",
    )


class TestCatalogPublic:
    def test_list_only_shows_published(self, client, product, draft_product):
        response = client.get("/api/v1/catalog/products/")
        assert response.status_code == 200
        slugs = [p["slug"] for p in response.json()["results"]]
        assert slugs == ["portatil-hp"]

    def test_retrieve_by_slug(self, client, product):
        response = client.get("/api/v1/catalog/products/portatil-hp/")
        assert response.status_code == 200
        assert response.json()["category"] == "informatica"

    def test_categories_public(self, client, category):
        response = client.get("/api/v1/catalog/categories/")
        assert response.status_code == 200
        assert len(response.json()["results"]) == 1


class TestCatalogStaff:
    def test_anon_cannot_create(self, client):
        assert client.post("/api/v1/catalog/products/", {}, format="json").status_code == 401

    def test_staff_can_create(self, admin_client, category, brand):
        response = admin_client.post(
            "/api/v1/catalog/products/",
            {
                "name": "Novo", "slug": "novo", "description": "D", "price": "10.00",
                "image": "https://exemplo.ao/n.jpg", "category": "informatica", "brand": "hp",
            },
            format="json",
        )
        assert response.status_code == 201

    def test_staff_can_adjust_stock(self, admin_client, product):
        response = admin_client.post(
            f"/api/v1/catalog/products/{product.slug}/adjust_stock/",
            {"quantity": 3, "note": "Entrada"},
            format="json",
        )
        assert response.status_code == 200
        product.refresh_from_db()
        assert product.stock == 8

    def test_anon_cannot_adjust_stock(self, client, product):
        response = client.post(
            f"/api/v1/catalog/products/{product.slug}/adjust_stock/",
            {"quantity": 1, "note": "x"},
            format="json",
        )
        assert response.status_code in {401, 403}

    def test_duplicate_slug_returns_400(self, admin_client, product, category, brand):
        response = admin_client.post(
            "/api/v1/catalog/products/",
            {
                "name": "Duplicado", "slug": "portatil-hp", "description": "D",
                "price": "10.00", "image": "https://exemplo.ao/x.jpg", "category": "informatica",
            },
            format="json",
        )
        assert response.status_code == 400