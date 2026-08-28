"""Testes do blog — leitura pública e gestão editorial por staff."""
import pytest

from apps.blog.models import Article

pytestmark = pytest.mark.django_db


@pytest.fixture
def blog_category():
    from apps.catalog.models import Category

    return Category.objects.create(name="Tecnologia", slug="tecnologia", type="blog")


@pytest.fixture
def article(blog_category):
    return Article.objects.create(
        title="Como escolher um portátil",
        slug="como-escolher-portatil",
        category=blog_category,
        excerpt="Guia prático.",
        content="<p>Conteúdo</p>",
        image="https://exemplo.ao/a.jpg",
        author="VitalEvo",
        read_time="5 min",
        status="published",
        is_published=True,
    )


@pytest.fixture
def draft_article(blog_category):
    return Article.objects.create(
        title="Rascunho", slug="rascunho", content="<p>D</p>", status="draft"
    )


class TestBlogPublic:
    def test_list_only_shows_published(self, client, article, draft_article):
        response = client.get("/api/v1/blog/articles/")
        assert response.status_code == 200
        slugs = [a["slug"] for a in response.json()["results"]]
        assert slugs == ["como-escolher-portatil"]

    def test_retrieve_by_slug(self, client, article):
        response = client.get(f"/api/v1/blog/articles/{article.slug}/")
        assert response.status_code == 200
        assert response.json()["category"] == "tecnologia"
        assert response.json()["author"] == "VitalEvo"

    def test_draft_not_public(self, client, draft_article):
        response = client.get(f"/api/v1/blog/articles/{draft_article.slug}/")
        assert response.status_code == 404


class TestBlogStaff:
    def test_anon_cannot_create(self, client):
        assert client.post("/api/v1/blog/articles/", {}, format="json").status_code == 401

    def test_staff_can_create(self, admin_client, blog_category):
        response = admin_client.post(
            "/api/v1/blog/articles/",
            {
                "title": "Novo artigo",
                "slug": "novo-artigo",
                "category": "tecnologia",
                "content": "<p>Texto</p>",
                "status": "published",
            },
            format="json",
        )
        assert response.status_code == 201

    def test_duplicate_slug_returns_400(self, admin_client, article):
        response = admin_client.post(
            "/api/v1/blog/articles/",
            {"title": "X", "slug": "como-escolher-portatil", "content": "<p>X</p>"},
            format="json",
        )
        assert response.status_code == 400