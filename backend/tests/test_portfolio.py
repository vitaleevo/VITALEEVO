"""Testes do portfólio — leitura pública e gestão por staff."""
import pytest

from apps.portfolio.models import Project

pytestmark = pytest.mark.django_db


@pytest.fixture
def portfolio_category():
    from apps.catalog.models import Category

    return Category.objects.create(name="Infraestrutura", slug="infraestrutura", type="portfolio")


@pytest.fixture
def project(portfolio_category):
    return Project.objects.create(
        title="Rede da Fábrica",
        slug="rede-da-fabrica",
        category=portfolio_category,
        tags=["redes", "switches"],
        image="https://exemplo.ao/p.jpg",
        client="Fábrica ABC",
        year="2025",
        full_description="Descrição completa",
        challenge="Desafio",
        solution="Solução",
        results=["-40% paragens"],
        status="published",
    )


class TestPortfolioPublic:
    def test_list_shows_published(self, client, project):
        response = client.get("/api/v1/portfolio/projects/")
        assert response.status_code == 200
        assert response.json()["results"][0]["slug"] == "rede-da-fabrica"

    def test_retrieve_by_slug(self, client, project):
        response = client.get(f"/api/v1/portfolio/projects/{project.slug}/")
        assert response.status_code == 200
        assert response.json()["client"] == "Fábrica ABC"

    def test_draft_not_public(self, client, portfolio_category):
        draft = Project.objects.create(title="R", slug="rascunho-p", category=portfolio_category, status="draft")
        assert client.get(f"/api/v1/portfolio/projects/{draft.slug}/").status_code == 404


class TestPortfolioStaff:
    def test_anon_cannot_create(self, client):
        assert client.post("/api/v1/portfolio/projects/", {}, format="json").status_code == 401

    def test_staff_can_create(self, admin_client, portfolio_category):
        response = admin_client.post(
            "/api/v1/portfolio/projects/",
            {
                "title": "Novo projeto",
                "slug": "novo-projeto",
                "category": "infraestrutura",
                "tags": ["x"],
                "status": "published",
            },
            format="json",
        )
        assert response.status_code == 201

    def test_category_filter(self, client, project):
        response = client.get("/api/v1/portfolio/projects/?category__slug=infraestrutura")
        assert response.status_code == 200
        assert len(response.json()["results"]) == 1