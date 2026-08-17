"""Testes do CMS — serviços públicos, páginas com blocos e mensagens de contacto."""
import pytest

from apps.cms.models import LegalDocument, Service, SiteBlock, SitePage

pytestmark = pytest.mark.django_db


@pytest.fixture
def service():
    return Service.objects.create(
        title="Desenvolvimento Web", slug="desenvolvimento-web",
        subtitle="Sites", description="Descrição", icon="globe", order=1,
        status="published",
    )


@pytest.fixture
def draft_service():
    return Service.objects.create(
        title="Rascunho", slug="rascunho", description="D", order=2, status="draft",
    )


class TestCmsPublic:
    def test_services_only_published(self, client, service, draft_service):
        response = client.get("/api/v1/cms/services/")
        assert response.status_code == 200
        slugs = [s["slug"] for s in response.json()["results"]]
        assert slugs == ["desenvolvimento-web"]

    def test_service_detail(self, client, service):
        response = client.get("/api/v1/cms/services/desenvolvimento-web/")
        assert response.status_code == 200
        assert response.json()["icon"] == "globe"

    def test_legal_document_public(self, client):
        LegalDocument.objects.create(slug="termos", title="Termos", content="C", status="published")
        response = client.get("/api/v1/cms/legal/termos/")
        assert response.status_code == 200

    def test_page_with_blocks(self, client):
        page = SitePage.objects.create(slug="home", title="Home", status="published")
        SiteBlock.objects.create(page=page, type="hero", content="{}", order=0)
        response = client.get("/api/v1/cms/pages/home/")
        assert response.status_code == 200
        assert len(response.json()["blocks"]) == 1

    def test_contact_message_public(self, client):
        response = client.post(
            "/api/v1/cms/contacts/",
            {"name": "Ana", "email": "ana@x.ao", "subject": "Olá", "message": "Teste"},
            format="json",
        )
        assert response.status_code == 201


class TestCmsStaff:
    def test_anon_cannot_create_service(self, client):
        assert client.post("/api/v1/cms/services/", {}, format="json").status_code == 401

    def test_duplicate_service_slug_returns_400(self, admin_client, service):
        response = admin_client.post(
            "/api/v1/cms/services/",
            {"title": "Duplicado", "slug": "desenvolvimento-web", "description": "D"},
            format="json",
        )
        assert response.status_code == 400

    def test_upsert_page_with_blocks(self, admin_client):
        response = admin_client.post(
            "/api/v1/cms/pages/upsert/",
            {
                "slug": "home", "title": "Home",
                "blocks": [{"type": "hero", "content": "{}"}, {"type": "cta", "content": "{}"}],
            },
            format="json",
        )
        assert response.status_code == 200
        assert len(response.json()["blocks"]) == 2

    def test_publish_page(self, admin_client):
        page = SitePage.objects.create(slug="sobre", title="Sobre", status="draft")
        response = admin_client.post(f"/api/v1/cms/pages/{page.slug}/publish/", {}, format="json")
        assert response.status_code == 200
        page.refresh_from_db()
        assert page.status == "published"