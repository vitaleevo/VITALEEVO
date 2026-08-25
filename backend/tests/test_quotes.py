"""Testes das cotações — criação pública, itens e fluxo de estado por staff."""
import pytest

from apps.catalog.models import Category, Product
from apps.quotes.models import QuoteRequest, QuoteStatus

pytestmark = pytest.mark.django_db


@pytest.fixture
def product():
    category = Category.objects.create(name="Informática", slug="informatica", type="store")
    return Product.objects.create(
        name="Portátil", slug="portatil", description="D", price="850000.00",
        image="https://exemplo.ao/p.jpg", category=category, stock=5, status="published",
    )


class TestQuotesPublic:
    def test_create_quote_with_items(self, client, product):
        response = client.post(
            "/api/v1/quotes/",
            {
                "name": "João", "email": "joao@empresa.ao", "phone": "+244 923 000 000",
                "company": "Empresa Lda", "message": "Preciso de 10 unidades",
                "items": [{"product": "portatil", "quantity": 10}],
            },
            format="json",
        )
        assert response.status_code == 201
        assert response.json()["public_id"].startswith("VL-")
        assert len(response.json()["access_token"]) >= 32
        quote = QuoteRequest.objects.get(public_id=response.json()["public_id"])
        assert response.json()["access_token"] not in quote.public_access_token_hash
        assert quote.items.count() == 1
        assert quote.items.first().name == "Portátil"

        status_response = client.post(
            "/api/v1/quotes/status/",
            {
                "public_id": response.json()["public_id"],
                "access_token": response.json()["access_token"],
            },
            format="json",
        )
        assert status_response.status_code == 200
        assert status_response.json()["item_count"] == 1
        assert "email" not in status_response.json()
        assert "phone" not in status_response.json()
        assert "proposal_note" not in status_response.json()

    def test_public_status_rejects_invalid_capability_token(self, client):
        quote = QuoteRequest.objects.create(
            public_id="VL-PRIVATE1",
            public_access_token_hash="0" * 64,
            name="João",
            email="joao@empresa.ao",
            phone="+244 923 000 000",
        )
        response = client.post(
            "/api/v1/quotes/status/",
            {"public_id": quote.public_id, "access_token": "x" * 43},
            format="json",
        )
        assert response.status_code == 404

    def test_legacy_public_get_is_not_available(self, client):
        response = client.get("/api/v1/quotes/VL-ABC123/")
        assert response.status_code == 404

    def test_create_quote_requires_phone_valid(self, client):
        response = client.post(
            "/api/v1/quotes/",
            {"name": "João", "email": "joao@empresa.ao", "phone": "abc"},
            format="json",
        )
        assert response.status_code == 400

    def test_anonymous_cannot_list_quotes(self, client):
        assert client.get("/api/v1/quotes/manage/").status_code == 401


class TestQuotesStaff:
    def test_staff_can_list(self, admin_client, client, product):
        client.post(
            "/api/v1/quotes/",
            {"name": "João", "email": "joao@empresa.ao", "phone": "+244 923 000 000",
             "items": [{"product": "portatil", "quantity": 2}]},
            format="json",
        )
        response = admin_client.get("/api/v1/quotes/manage/")
        assert response.status_code == 200
        assert response.json()["count"] == 1

    def test_staff_can_update_status(self, admin_client):
        quote = QuoteRequest.objects.create(
            public_id="VL-ABC123", name="João", email="j@e.ao", phone="+244 923 000 000"
        )
        response = admin_client.post(
            f"/api/v1/quotes/manage/{quote.id}/status/",
            {"status": QuoteStatus.ACCEPTED},
            format="json",
        )
        assert response.status_code == 200
        quote.refresh_from_db()
        assert quote.status == QuoteStatus.ACCEPTED
        assert quote.accepted_at is not None

    def test_staff_can_register_proposal(self, admin_client):
        quote = QuoteRequest.objects.create(
            public_id="VL-DEF456", name="João", email="j@e.ao", phone="+244 923 000 000"
        )
        response = admin_client.post(
            f"/api/v1/quotes/manage/{quote.id}/proposal/",
            {"quoted_total": "8500000.00", "proposal_note": "Proposta enviada"},
            format="json",
        )
        assert response.status_code == 200
        quote.refresh_from_db()
        assert str(quote.quoted_total) == "8500000.00"
