"""Dados reais de produtos iniciais: imagens locais, descrições e especificações.

As imagens vivem em public/images/products/ (versionadas no repositório) e são
servidas pelo frontend — caminhos relativos funcionam em qualquer ambiente.
"""
from django.db import migrations


def seed_products(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    Category = apps.get_model("catalog", "Category")
    Brand = apps.get_model("catalog", "Brand")

    def get_category(name, parent=None):
        category, _ = Category.objects.get_or_create(
            name=name,
            parent=parent,
            defaults={"slug": name.lower().replace("&", "e").replace(" ", "-")},
        )
        return category

    def get_brand(name):
        brand, _ = Brand.objects.get_or_create(
            name=name,
            defaults={"slug": name.lower()},
        )
        return brand

    computadores = get_category("Computadores")
    laptops = get_category("Portáteis", computadores)
    redes = get_category("Redes & Conectividade")
    switches = get_category("Switches", redes)
    hp = get_brand("HP")
    tplink = get_brand("TP-Link")

    products = [
        {
            "sku": "HP-PB-440",
            "create": {
                "name": "Portátil HP ProBook 440 G10",
                "price": "1250000.00",
                "stock": 12,
            },
            "content": {
                "slug": "portatil-hp-probook-440-g10",
                "description": (
                    "Portátil empresarial de 14 polegadas com o desempenho e a "
                    "segurança que o seu negócio exige. Equipado com processador "
                    "Intel Core de 13.ª geração, ecrã FHD anti-reflexo e chassis "
                    "reforçado em alumínio, o ProBook 440 G10 é a escolha ideal "
                    "para profissionais que trabalham em movimento."
                ),
                "full_description": (
                    "O HP ProBook 440 G10 combina design profissional em alumínio "
                    "com desempenho fiável para o dia-a-dia empresarial. Inclui "
                    "teclado retroiluminado, leitor de impressões digitais para "
                    "início de sessão seguro, bateria de longa duração e porta "
                    "USB-C para carregamento rápido. Perfeito para produtividade, "
                    "reuniões online e gestão de escritório em qualquer lugar."
                ),
                "specs": [
                    {"label": "Ecrã", "value": "14\" FHD (1920×1080) anti-reflexo"},
                    {"label": "Processador", "value": "Intel Core i5 13.ª geração"},
                    {"label": "Memória", "value": "8 GB DDR4 (expansível a 32 GB)"},
                    {"label": "Armazenamento", "value": "SSD NVMe 256 GB"},
                    {"label": "Sistema", "value": "Windows 11 Pro"},
                    {"label": "Segurança", "value": "Leitor de impressões digitais"},
                    {"label": "Bateria", "value": "Até 12 horas (típica)"},
                ],
                "image": "/images/products/hp-probook-440-g10.jpg",
                "brand": hp,
                "category": laptops,
            },
        },
        {
            "sku": "NET-SW-24",
            "create": {
                "name": "Switch 24 Portas Gigabit",
                "price": "185000.00",
                "stock": 20,
            },
            "content": {
                "slug": "switch-24-portas-gigabit",
                "description": (
                    "Switch não gerido de 24 portas 10/100/1000 Mbps para redes "
                    "de escritório, com montagem em rack de 19\". Ligação simples "
                    "e imediata — ligar e usar, sem configuração."
                ),
                "full_description": (
                    "Expanda a sua rede com 24 portas Gigabit dedicadas. O switch "
                    "suporta auto-negociação de velocidade, deteção automática de "
                    "cabo MDI/MDIX e consumo energético reduzido com eficiência "
                    "energética Ethernet (EEE). Ideal para pequenas e médias "
                    "empresas que precisam de ligações estáveis para computadores, "
                    "câmaras IP, impressoras e pontos de acesso."
                ),
                "specs": [
                    {"label": "Portas", "value": "24 × RJ-45 10/100/1000 Mbps"},
                    {"label": "Montagem", "value": "Rack 19\" (1U)"},
                    {"label": "Gestão", "value": "Não gerido (plug & play)"},
                    {"label": "Cabos", "value": "Deteção automática MDI/MDIX"},
                    {"label": "Eficiência", "value": "IEEE 802.3az (EEE)"},
                ],
                "image": "/images/products/switch-24-portas-gigabit.jpg",
                "brand": tplink,
                "category": switches,
            },
        },
    ]

    for entry in products:
        product, created = Product.objects.get_or_create(
            sku=entry["sku"],
            defaults={**entry["create"], **entry["content"]},
        )
        if not created:
            for key, value in entry["content"].items():
                setattr(product, key, value)
            product.save()


def unseed_products(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    Product.objects.filter(sku__in=["HP-PB-440", "NET-SW-24"]).update(
        image="",
        description="",
        full_description="",
        specs=[],
    )


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0003_product_subcategory"),
    ]

    operations = [
        migrations.RunPython(seed_products, unseed_products),
    ]