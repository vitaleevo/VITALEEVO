"""Comando de seed — dados iniciais para desenvolvimento e primeira utilização.

Uso: python manage.py seed
"""
import os

from django.contrib.auth.password_validation import validate_password
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


# Árvore do catálogo da loja — espelha convex/catalogSeed.ts (referência da estrutura).
STORE_CATEGORIES = [
    {"name": "Computadores", "slug": "computadores", "order": 1, "children": [
        {"name": "Portáteis", "slug": "portateis"},
        {"name": "Desktops", "slug": "desktops"},
        {"name": "All-in-One", "slug": "all-in-one"},
    ]},
    {"name": "Impressoras", "slug": "impressoras", "order": 2, "children": [
        {"name": "Térmicas / POS", "slug": "termicas-pos"},
        {"name": "Multifunções", "slug": "multifuncoes"},
        {"name": "Matriciais", "slug": "matriciais"},
        {"name": "Consumíveis", "slug": "consumiveis"},
    ]},
    {"name": "Servidores", "slug": "servidores", "order": 3},
    {"name": "Software & Licenças", "slug": "software-licencas", "order": 4, "children": [
        {"name": "Antivírus", "slug": "antivirus"},
        {"name": "Windows Server", "slug": "windows-server"},
        {"name": "Windows 11 Pro", "slug": "windows-11-pro"},
    ]},
    {"name": "Câmaras de Vigilância", "slug": "camaras-vigilancia", "order": 5, "children": [
        {"name": "IP Bullet", "slug": "ip-bullet"},
        {"name": "Analógicas", "slug": "analogicas"},
        {"name": "Dome", "slug": "dome"},
        {"name": "PTZ", "slug": "ptz"},
    ]},
    {"name": "Redes & Conectividade", "slug": "redes-conectividade", "order": 6, "children": [
        {"name": "Switches", "slug": "switches"},
        {"name": "Routers", "slug": "routers"},
        {"name": "Access Points", "slug": "access-points"},
        {"name": "Cabos & Acessórios", "slug": "cabos-acessorios"},
    ]},
    {"name": "Gravação & Armazenamento", "slug": "gravacao-armazenamento", "order": 7, "children": [
        {"name": "NVR", "slug": "nvr"},
        {"name": "DVR", "slug": "dvr"},
        {"name": "Discos (HDD/SSD)", "slug": "discos"},
    ]},
    {"name": "Acessórios & Periféricos", "slug": "acessorios-perifericos", "order": 8, "children": [
        {"name": "Pendrives", "slug": "pendrives"},
        {"name": "Teclados & Ratos", "slug": "teclados-ratos"},
        {"name": "Outros Acessórios", "slug": "outros-acessorios"},
    ]},
    {"name": "Controlo de Acesso & Biometria", "slug": "controlo-acesso-biometria", "order": 9, "children": [
        {"name": "Relógios de Ponto", "slug": "relogios-ponto"},
        {"name": "Controladores de Acesso", "slug": "controladores-acesso"},
    ]},
    {"name": "Smartphones", "slug": "smartphones", "order": 10},
]

SAMPLE_PRODUCTS = [
    {
        "name": "Portátil HP ProBook 440 G10",
        "slug": "portatil-hp-probook-440-g10",
        "sku": "HP-PB-440",
        "description": "Portátil empresarial de 14\" com processador Intel i5.",
        "price": "1250000.00",
        "image": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=70",
        "category_slug": "computadores",
        "subcategory_slug": "portateis",
        "brand": "HP",
        "stock": 12,
        "is_new": True,
    },
    {
        "name": "Switch 24 Portas Gigabit",
        "slug": "switch-24-portas-gigabit",
        "sku": "NET-SW-24",
        "description": "Switch de rede para escritórios e pequenas empresas.",
        "price": "185000.00",
        "image": "https://images.unsplash.com/photo-1600267185393-e158a98703de?auto=format&fit=crop&w=800&q=70",
        "category_slug": "redes-conectividade",
        "subcategory_slug": "switches",
        "brand": "TP-Link",
        "stock": 20,
    },
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
        email = os.environ.get("SEED_ADMIN_EMAIL", "").strip().lower()
        password = os.environ.get("SEED_ADMIN_PASSWORD", "")
        if not email or not password:
            self.stdout.write(
                self.style.WARNING(
                    "Superuser não criado: defina SEED_ADMIN_EMAIL e "
                    "SEED_ADMIN_PASSWORD explicitamente."
                )
            )
            return
        if User.objects.filter(email=email).exists():
            self.stdout.write("Superuser já existe; password preservada.")
            return
        validate_password(password)
        User.objects.create_superuser(email=email, password=password)
        self.stdout.write(f"Superuser criado: {email}")

    def create_catalog(self) -> None:
        created_categories = 0
        for cat in STORE_CATEGORIES:
            parent, was_created = Category.objects.get_or_create(
                slug=cat["slug"],
                defaults={"name": cat["name"], "type": "store", "order": cat["order"]},
            )
            created_categories += was_created
            for child in cat.get("children", []):
                _, child_created = Category.objects.get_or_create(
                    slug=child["slug"],
                    defaults={"name": child["name"], "type": "store", "parent": parent, "order": cat["order"] * 10},
                )
                created_categories += child_created

        brand_map = {}
        upserted_products = 0
        for data in SAMPLE_PRODUCTS:
            brand_name = data.pop("brand")
            brand, _ = Brand.objects.get_or_create(slug=brand_name.lower().replace(" ", "-"), defaults={"name": brand_name})
            brand_map[brand_name] = brand
            category = Category.objects.get(slug=data.pop("category_slug"))
            subcategory = Category.objects.get(slug=data.pop("subcategory_slug"))
            _, was_created = Product.objects.update_or_create(
                slug=data["slug"],
                defaults={**data, "category": category, "subcategory": subcategory, "brand": brand, "status": "published"},
            )
            upserted_products += 1 if not was_created else 1
        self.stdout.write(f"Catálogo criado: {created_categories} categorias, {upserted_products} produtos.")

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
                    "siteDescription": "Tecnologia & Marketing — Luanda",
                    "contactEmail": "geral@vitalevo.ao",
                    "contactPhone": "+244 923 000 000",
                    "whatsapp": "+244 923 000 000",
                    "currency": "AOA",
                    "address": "Luanda, Angola",
                    "socialLinks": {"facebook": "", "instagram": "", "linkedin": ""},
                    "businessConfig": {"shippingFee": 1000, "freeShippingThreshold": 200000, "maintenanceMode": False},
                }
            },
        )
        self.stdout.write("Configuração do site criada.")
