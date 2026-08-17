"""Comando de seed — dados iniciais para desenvolvimento e primeira utilização.

Uso: python manage.py seed
"""
import os

from django.core.management.base import BaseCommand

from apps.catalog.models import Brand, Category, Product
from apps.cms.models import LegalDocument, Service, Setting
from apps.users.models import User

SERVICES = [
    {
        "title": "Desenvolvimento Web",
        "slug": "desenvolvimento-web",
        "subtitle": "Sites e lojas que vendem",
        "description": "Websites profissionais, rápidos e otimizados para conversão.",
        "icon": "globe",
        "features": ["Sites responsivos", "SEO técnico", "Velocidade"],
        "order": 1,
    },
    {
        "title": "Marketing Digital",
        "slug": "marketing-digital",
        "subtitle": "Leads e vendas no digital",
        "description": "Campanhas, redes sociais e funis que geram resultados.",
        "icon": "megaphone",
        "features": ["Gestão de redes", "Campanhas pagas", "Funil de vendas"],
        "order": 2,
    },
    {
        "title": "Sistemas Empresariais",
        "slug": "sistemas-empresariais",
        "subtitle": "Automatize o seu negócio",
        "description": "ERP e sistemas à medida para crescer com estrutura.",
        "icon": "bot",
        "features": ["ERP à medida", "Automação", "Relatórios"],
        "order": 3,
    },
    {
        "title": "Infraestrutura TI",
        "slug": "infraestrutura-ti",
        "subtitle": "Segurança e conectividade",
        "description": "Redes, câmeras e segurança para o seu negócio.",
        "icon": "shield",
        "features": ["Redes", "CFTV", "Controlo de acesso"],
        "order": 4,
    },
]

LEGAL_DOCUMENTS = [
    {"slug": "termos-de-uso", "title": "Termos de Uso", "content": "Termos de uso do site Vitalevo."},
    {"slug": "politica-de-privacidade", "title": "Política de Privacidade", "content": "Como tratamos os seus dados."},
]


class Command(BaseCommand):
    help = "Cria dados iniciais (superuser, catálogo, serviços, documentos legais e configuração)."

    def handle(self, *args, **options):
        self.create_superuser()
        self.create_catalog()
        self.create_services()
        self.create_legal_documents()
        self.create_site_config()
        self.stdout.write(self.style.SUCCESS("Seed concluído."))

    def create_superuser(self) -> None:
        email = os.environ.get("SEED_ADMIN_EMAIL", "admin@vitaleevo.ao")
        password = os.environ.get("SEED_ADMIN_PASSWORD", "Admin123!")
        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(f"Superuser criado: {email}")
        else:
            self.stdout.write("Superuser já existe.")

    def create_catalog(self) -> None:
        if Category.objects.exists():
            self.stdout.write("Catálogo já existe — a saltar.")
            return
        informatica = Category.objects.create(name="Informática", slug="informatica", type="store")
        redes = Category.objects.create(name="Redes e Segurança", slug="redes-seguranca", type="store")
        hp = Brand.objects.create(name="HP", slug="hp")
        Product.objects.create(
            name="Portátil HP ProBook 440 G10",
            slug="portatil-hp-probook-440-g10",
            sku="HP-PB-440",
            description="Portátil empresarial de 14\" com processador Intel i5.",
            price="1250000.00",
            image="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=70",
            category=informatica,
            brand=hp,
            stock=12,
            is_new=True,
            status="published",
        )
        Product.objects.create(
            name="Switch 24 Portas Gigabit",
            slug="switch-24-portas-gigabit",
            sku="NET-SW-24",
            description="Switch de rede para escritórios e pequenas empresas.",
            price="185000.00",
            image="https://images.unsplash.com/photo-1600267185393-e158a98703de?auto=format&fit=crop&w=800&q=70",
            category=redes,
            stock=20,
            status="published",
        )
        self.stdout.write("Catálogo criado (2 categorias, 1 marca, 2 produtos).")

    def create_services(self) -> None:
        created = 0
        for data in SERVICES:
            _, was_created = Service.objects.get_or_create(slug=data["slug"], defaults={**data, "status": "published"})
            created += was_created
        self.stdout.write(f"Serviços: {created} criados.")

    def create_legal_documents(self) -> None:
        created = 0
        for data in LEGAL_DOCUMENTS:
            _, was_created = LegalDocument.objects.get_or_create(slug=data["slug"], defaults={**data, "status": "published"})
            created += was_created
        self.stdout.write(f"Documentos legais: {created} criados.")

    def create_site_config(self) -> None:
        Setting.objects.get_or_create(
            key="site_config",
            defaults={
                "value": {
                    "siteName": "Vitalevo",
                    "siteDescription": "Agência de Tecnologia & Marketing — Luanda",
                    "contactEmail": "geral@vitalevo.ao",
                    "contactPhone": "+244 923 000 000",
                    "whatsapp": "+244 923 000 000",
                    "currency": "AOA",
                }
            },
        )
        self.stdout.write("Configuração do site criada.")