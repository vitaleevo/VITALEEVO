"""Catálogo completo VitalEvo: categorias, marcas e produtos com preços de mercado (Kz).

Reutiliza categorias/marcas existentes pelo nome e cria as que faltam.
Imagens versionadas em public/images/products/<sku>.jpg — caminhos relativos
funcionam em qualquer ambiente (dev e produção).
"""
from django.db import migrations


def get_category(Category, name, parent=None):
    existing = Category.objects.filter(name=name).first()
    if existing:
        return existing
    return Category.objects.create(
        name=name,
        slug=name.lower().replace("&", "e").replace(" ", "-").replace("/", "-"),
        parent=parent,
        type="store",
    )


def get_brand(Brand, name):
    existing = Brand.objects.filter(name=name).first()
    if existing:
        return existing
    return Brand.objects.create(name=name, slug=name.lower().replace(" ", "-"))


def seed(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    Category = apps.get_model("catalog", "Category")
    Brand = apps.get_model("catalog", "Brand")

    def cat(name, parent=None):
        return get_category(Category, name, parent)

    def br(name):
        return get_brand(Brand, name)

    computadores = cat("Computadores")
    acessorios = cat("Acessórios & Periféricos")
    redes = cat("Redes & Conectividade")
    cctv = cat("Câmaras de Vigilância")
    biometria = cat("Controlo de Acesso & Biometria")
    impressoras = cat("Impressoras")
    gravacao = cat("Gravação & Armazenamento")
    consumiveis = cat("Consumíveis")
    escritorio = cat("Escritório")
    software = cat("Software & Licenças")
    energia = cat("Energia")

    cat("Portáteis", computadores)
    cat("Desktops", computadores)
    cat("Mini PCs", computadores)
    cat("Monitores", computadores)
    cat("Teclados & Ratos", acessorios)
    cat("Headsets & Webcams", acessorios)
    cat("Docking Stations", acessorios)
    cat("Switches", redes)
    cat("Routers", redes)
    cat("Access Points", redes)
    cat("Infraestrutura de Rede", redes)
    cat("Cabos & Acessórios", redes)
    cat("Ferramentas de Rede", redes)
    cat("IP Bullet", cctv)
    cat("Dome", cctv)
    cat("PTZ", cctv)
    cat("Gravação & Armazenamento")
    cat("Discos (HDD/SSD)", gravacao)
    cat("Relógios de Ponto", biometria)
    cat("Leitores Biométricos", biometria)
    cat("Videoporteiros", biometria)
    cat("Fechaduras Inteligentes", biometria)
    cat("Jato de Tinta", impressoras)
    cat("Laser", impressoras)
    cat("Multifunções", impressoras)
    cat("Toners", consumiveis)
    cat("Tinteiros", consumiveis)
    cat("Papel", consumiveis)
    cat("Etiquetas & Rolos", consumiveis)
    cat("Material de Escritório", escritorio)
    cat("Mobiliário", escritorio)
    cat("UPS & Estabilizadores", energia)
    cat("Microsoft 365", software)

    P = []

    def add(sku, name, price, category, brand, desc, full, specs, stock=10, featured=False, is_new=False):
        P.append({
            "sku": sku, "name": name, "price": price, "category": category,
            "brand": brand, "description": desc, "full_description": full,
            "specs": specs, "stock": stock, "featured": featured, "is_new": is_new,
        })

    # ── Portáteis ──────────────────────────────────────────────────────
    add("HP-PB-440", "Portátil HP ProBook 440 G10", "1250000.00", cat("Portáteis"), br("HP"),
        "Portátil empresarial de 14\" com processador Intel Core de 13.ª geração, ecrã FHD anti-reflexo e chassis em alumínio.",
        "O HP ProBook 440 G10 combina design profissional com desempenho fiável para o dia-a-dia empresarial: teclado retroiluminado, leitor de impressões digitais, bateria de longa duração e USB-C com carregamento rápido.",
        [("Ecrã", '14" FHD (1920×1080) anti-reflexo'), ("Processador", "Intel Core i5 13.ª geração"),
         ("Memória", "8 GB DDR4 (expansível a 32 GB)"), ("Armazenamento", "SSD NVMe 256 GB"),
         ("Sistema", "Windows 11 Pro"), ("Segurança", "Leitor de impressões digitais")],
        stock=12, featured=True)
    add("HP-PAV-15", "Portátil HP Pavilion 15", "1450000.00", cat("Portáteis"), br("HP"),
        "Portátil multimedia de 15,6\" FHD com Intel Core i5, 8 GB de RAM e SSD de 512 GB.",
        "Ecrã FHD de 15,6\" com micro-bordas, som B&O e design fino em metal. Ideal para trabalho e entretenimento, com autonomia para um dia inteiro de uso.",
        [("Ecrã", '15,6" FHD'), ("Processador", "Intel Core i5 12.ª geração"), ("Memória", "8 GB DDR4"),
         ("Armazenamento", "SSD 512 GB"), ("Sistema", "Windows 11 Home")],
        stock=8, featured=True)
    add("DELL-LAT-3540", "Portátil Dell Latitude 3540", "1385000.00", cat("Portáteis"), br("Dell"),
        "Portátil empresarial Dell de 15,6\" com processador Intel Core i5 e SSD NVMe.",
        "O Latitude 3540 foi criado para produtividade profissional: construção resistente, segurança Dell Data Protection e ecrã confortável para longas jornadas de trabalho.",
        [("Ecrã", '15,6" FHD'), ("Processador", "Intel Core i5 13.ª geração"), ("Memória", "8 GB DDR4"),
         ("Armazenamento", "SSD 256 GB"), ("Sistema", "Windows 11 Pro")], stock=6)
    add("LEN-TP-E14", "Portátil Lenovo ThinkPad E14", "1295000.00", cat("Portáteis"), br("Lenovo"),
        "ThinkPad E14: fiabilidade empresarial num portátil de 14\" com teclado confortável e construção resistente.",
        "A série ThinkPad é sinónimo de durabilidade. O E14 oferece teclado de qualidade excecional, rastreabilidade de segurança e desempenho sólido para qualquer escritório.",
        [("Ecrã", '14" FHD'), ("Processador", "Intel Core i5 12.ª geração"), ("Memória", "8 GB DDR4"),
         ("Armazenamento", "SSD 256 GB"), ("Sistema", "Windows 11 Pro")], stock=6)

    # ── Desktops / Mini PCs / Monitores ────────────────────────────────
    add("DESKTOP-HP-400", "Desktop HP ProDesk 400 G9", "895000.00", cat("Desktops"), br("HP"),
        "Desktop empresarial compacto com Intel Core i5, 8 GB RAM e SSD de 256 GB.",
        "Torre SFF que poupa espaço sem sacrificar desempenho. Certificação empresarial, expansão fácil de memória e armazenamento, e gestão remota via AMT.",
        [("Processador", "Intel Core i5 13.ª geração"), ("Memória", "8 GB DDR4"), ("Armazenamento", "SSD 256 GB"),
         ("Gráficos", "Intel UHD integrados"), ("Sistema", "Windows 11 Pro")], stock=5)
    add("DESKTOP-DELL-7010", "Desktop Dell OptiPlex 7010", "865000.00", cat("Desktops"), br("Dell"),
        "Desktop Dell OptiPlex 7010 com Intel Core i5, 8 GB RAM e SSD de 256 GB.",
        "O OptiPlex é a referência em desktops empresariais: ciclo de vida longo, chassis ferramenta-necessária zero e fiabilidade comprovada.",
        [("Processador", "Intel Core i5 13.ª geração"), ("Memória", "8 GB DDR4"), ("Armazenamento", "SSD 256 GB"),
         ("Sistema", "Windows 11 Pro")], stock=5)
    add("MINIPC-HP", "Mini PC HP ProDesk 400 G9 Mini", "655000.00", cat("Mini PCs"), br("HP"),
        "Mini PC empresarial de 1 litro: desempenho de desktop em qualquer secretária.",
        "Ocupa menos espaço que uma folha A4 e pode ser montado atrás do monitor (VESA). Perfeito para receções, balcões e secretárias sem espaço.",
        [("Processador", "Intel Core i5 13.ª geração"), ("Memória", "8 GB DDR4"), ("Armazenamento", "SSD 256 GB"),
         ("Montagem", "VESA incluída"), ("Sistema", "Windows 11 Pro")], stock=4)
    add("MINIPC-BEELINK", "Mini PC Beelink SER5", "485000.00", cat("Mini PCs"), br("Beelink"),
        "Mini PC compacto com AMD Ryzen 5, 16 GB RAM e SSD de 500 GB — desempenho ao melhor preço.",
        "O SER5 é ideal para escritórios e pontos de venda: processador AMD Ryzen 5 5500U, 16 GB DDR4 e Wi-Fi 6. Inclui suporte VESA.",
        [("Processador", "AMD Ryzen 5 5500U"), ("Memória", "16 GB DDR4"), ("Armazenamento", "SSD 500 GB"),
         ("Rede", "Wi-Fi 6 + Gigabit"), ("Sistema", "Windows 11 Pro")], stock=6, is_new=True)
    add("MON-22", 'Monitor 22" FHD', "98500.00", cat("Monitores"), br("AOC"),
        'Monitor de 21,5" Full HD com moldura fina — perfeito para escritório.',
        "Painel IPS com ângulos de visão generosos, filtro de luz azul e consumo reduzido. Conectividade HDMI e VGA.",
        [("Ecrã", '21,5" IPS FHD'), ("Conectividade", "HDMI + VGA"), ("Taxa de atualização", "60 Hz")], stock=10)
    add("MON-24", 'Monitor 24" FHD 100Hz', "135000.00", cat("Monitores"), br("AOC"),
        'Monitor de 23,8" Full HD com 100 Hz e tempo de resposta rápido.',
        "Painel IPS de 24\" com 100 Hz, sombras suaves para uso prolongado e conectividade HDMI + DisplayPort.",
        [("Ecrã", '23,8" IPS FHD'), ("Taxa de atualização", "100 Hz"), ("Conectividade", "HDMI + DisplayPort")], stock=10)
    add("MON-27", 'Monitor 27" FHD', "215000.00", cat("Monitores"), br("AOC"),
        'Monitor de 27" Full HD com painel IPS — espaço e nitidez para produtividade.',
        "Grande área de trabalho com cores vivas, moldura ultrafina e suporte ergonómico com ajuste de altura.",
        [("Ecrã", '27" IPS FHD'), ("Ajuste", "Altura e inclinação"), ("Conectividade", "HDMI + DisplayPort")], stock=6)

    # ── Periféricos ────────────────────────────────────────────────────
    add("TECL-HP", "Teclado HP USB", "15500.00", cat("Teclados & Ratos"), br("HP"),
        "Teclado USB de secretária com teclado numérico e teclas silenciosas.",
        "Layout PT, teclas de perfil baixo e construção resistente a derrames ligeiros.",
        [("Ligação", "USB"), ("Layout", "PT"), ("Resistência", "Derrames ligeiros")], stock=20)
    add("KIT-TECL-RATO", "Kit Teclado + Rato HP", "22500.00", cat("Teclados & Ratos"), br("HP"),
        "Kit completo teclado USB + rato ótico com fio para o seu posto de trabalho.",
        "Solução económica e fiável: teclado de perfil baixo com rato ótico de 1000 dpi, ambos plug & play.",
        [("Teclado", "USB PT"), ("Rato", "Ótico 1000 dpi"), ("Compatibilidade", "Windows / macOS")], stock=20)
    add("RATO-HP", "Rato Óptico HP USB", "9500.00", cat("Teclados & Ratos"), br("HP"),
        "Rato ótico com fio, 1000 dpi e design ergonómico.",
        "Rato leve e confortável para uso diário, compatível com qualquer sistema com porta USB.",
        [("Ligação", "USB"), ("Resolução", "1000 dpi")], stock=25)
    add("HEADSET-EMP", "Headset Empresarial USB", "28500.00", cat("Headsets & Webcams"), br("Trust"),
        "Headset com microfone com cancelamento de ruído — ideal para reuniões e call centers.",
        "Som nítido e microfone com cancelamento de ruído, almofadas confortáveis para uso prolongado e controlo de volume no cabo.",
        [("Ligação", "USB"), ("Microfone", "Cancelamento de ruído"), ("Uso", "Call centers / reuniões")], stock=12)
    add("WEBCAM-FHD", "Webcam FHD 1080p", "35500.00", cat("Headsets & Webcams"), br("Trust"),
        "Webcam Full HD 1080p com correção de luz automática e clip universal.",
        "Imagem nítida a 30 fps, correção automática de iluminação e montagem em monitor ou tripé. Compatível com Teams, Zoom e Meet.",
        [("Resolução", "1080p @ 30 fps"), ("Ligação", "USB 2.0"), ("Compatibilidade", "Teams / Zoom / Meet")], stock=10, is_new=True)
    add("DOCK-USB-C", "Docking Station USB-C HP", "145000.00", cat("Docking Stations"), br("HP"),
        "Docking USB-C com HDMI 4K, 4× USB, Gigabit e carregamento de 65 W.",
        "Transforme um portátil num posto de trabalho completo: dois monitores, periféricos, rede com fio e carregamento incluído num só cabo.",
        [("Saída vídeo", "HDMI 4K"), ("Portas", "4× USB + Gigabit"), ("Carregamento", "65 W PD")], stock=5)

    # ── Switches ───────────────────────────────────────────────────────
    add("SW-5P", "Switch 5 Portas 10/100", "8600.00", cat("Switches"), br("TP-Link"),
        "Switch não gerido de 5 portas Fast Ethernet — ligue e use.",
        "Expansão imediata da rede doméstica ou de pequeno escritório com cinco portas 10/100 Mbps.",
        [("Portas", "5 × 10/100 Mbps"), ("Gestão", "Não gerido"), ("Formato", "Secretária")], stock=30)
    add("SW-8P", "Switch 8 Portas Gigabit", "17500.00", cat("Switches"), br("TP-Link"),
        "Switch não gerido de 8 portas Gigabit para redes rápidas.",
        "Oito portas 10/100/1000 Mbps com eficiência energética IEEE 802.3az. Ideal para escritórios e residências.",
        [("Portas", "8 × Gigabit"), ("Eficiência", "IEEE 802.3az (EEE)"), ("Formato", "Secretária")], stock=25)
    add("SW-16P", "Switch 16 Portas Gigabit", "32500.00", cat("Switches"), br("TP-Link"),
        "Switch não gerido de 16 portas Gigabit para redes de escritório.",
        "Dezasseis portas Gigabit plug & play com montagem em rack ou secretária.",
        [("Portas", "16 × Gigabit"), ("Montagem", "Rack 19\" / secretária"), ("Eficiência", "EEE")], stock=15)
    add("NET-SW-24", "Switch 24 Portas Gigabit", "185000.00", cat("Switches"), br("TP-Link"),
        "Switch não gerido de 24 portas Gigabit com montagem em rack de 19\".",
        "Expanda a sua rede com 24 portas Gigabit, auto-negociação de velocidade, deteção MDI/MDIX e consumo reduzido com EEE.",
        [("Portas", "24 × 10/100/1000 Mbps"), ("Montagem", "Rack 19\" (1U)"), ("Gestão", "Não gerido"),
         ("Eficiência", "IEEE 802.3az (EEE)")], stock=12)
    add("SW-48P", "Switch 48 Portas Gigabit", "385000.00", cat("Switches"), br("TP-Link"),
        "Switch não gerido de 48 portas Gigabit em rack de 19\".",
        "Para redes maiores: 48 portas Gigabit, chassis metálico e ventoinha silenciosa.",
        [("Portas", "48 × Gigabit"), ("Montagem", "Rack 19\" (1U)"), ("Chassis", "Metálico")], stock=6)
    add("SW-POE-8P", "Switch 8 Portas PoE+", "95000.00", cat("Switches"), br("TP-Link"),
        "Switch de 8 portas com 4 portas PoE+ — alimente câmaras IP sem cabos extra.",
        "Alimente câmaras, access points e telefones IP diretamente pelo cabo de rede com PoE+ de até 30 W por porta.",
        [("Portas", "8 × Gigabit (4 PoE+)"), ("Orçamento PoE", "Até 65 W"), ("Uso", "CCTV / AP")], stock=8)
    add("SW-POE-24P", "Switch 24 Portas PoE+", "265000.00", cat("Switches"), br("TP-Link"),
        "Switch de 24 portas Gigabit com 12 portas PoE+ para instalações de CCTV.",
        "Alimentação PoE para câmaras e access points em rack de 19\", com orçamento PoE de 150 W.",
        [("Portas", "24 × Gigabit (12 PoE+)"), ("Orçamento PoE", "150 W"), ("Montagem", "Rack 19\"")], stock=6)

    # ── Routers / Access Points ────────────────────────────────────────
    add("ROUT-MIKROTIK-HEX", "Router MikroTik hEX RB750Gr3", "88000.00", cat("Routers"), br("MikroTik"),
        "Router MikroTik hEX com 5 portas Gigabit e RouterOS — o padrão das redes em Angola.",
        "O hEX é o router de eleição para escritórios e ISPs: RouterOS com firewall, VLANs, QoS e VPN, tudo por um preço imbatível.",
        [("Portas", "5 × Gigabit"), ("Sistema", "RouterOS L4"), ("VPN", "PPTP / L2TP / OpenVPN"),
         ("VLAN", "802.1Q")], stock=15, featured=True)
    add("ROUT-MIKROTIK-4011", "Router MikroTik RB4011iGS+", "215000.00", cat("Routers"), br("MikroTik"),
        "Router de alta performance com 10 portas Gigabit e SFP+ 10G.",
        "Para redes exigentes: CPU quad-core, portas Gigabit para LAN/WAN e slot SFP+ 10 Gbps para fibra.",
        [("Portas", "10 × Gigabit + SFP+ 10G"), ("CPU", "Quad-core 1,4 GHz"), ("Sistema", "RouterOS L5")], stock=6)
    add("ROUT-TP-C6", "Router TP-Link Archer C6", "45500.00", cat("Routers"), br("TP-Link"),
        "Router AC1200 dual-band com MU-MIMO e controlo parental.",
        "Wi-Fi AC1200 (300 + 867 Mbps), 4 antenas, portas Gigabit e configuração fácil pela app Tether.",
        [("Wi-Fi", "AC1200 dual-band"), ("Portas", "4 × Gigabit"), ("MU-MIMO", "Sim")], stock=18)
    add("AP-UBIQUITI-U6", "Access Point Ubiquiti UniFi U6+", "135000.00", cat("Access Points"), br("Ubiquiti"),
        "Access Point Wi-Fi 6 para redes UniFi — cobertura e velocidade empresariais.",
        "Wi-Fi 6 (AX3000) gerido pelo UniFi Controller: roaming sem falhas, múltiplas SSIDs e painel de gestão completo.",
        [("Wi-Fi", "AX3000 (2.4 + 5 GHz)"), ("PoE", "802.3af"), ("Gestão", "UniFi Controller")], stock=10, featured=True)
    add("AP-TP-EAP", "Access Point TP-Link EAP225", "68500.00", cat("Access Points"), br("TP-Link"),
        "Access Point AC1350 com PoE e gestão Omada — Wi-Fi empresarial acessível.",
        "Cobertura estável para escritórios, hotéis e lojas; PoE passivo incluído e gestão centralizada Omada.",
        [("Wi-Fi", "AC1350 (2.4 + 5 GHz)"), ("PoE", "Incluído"), ("Gestão", "Omada")], stock=12)

    # ── Infraestrutura / Cabos / Ferramentas ───────────────────────────
    add("PATCH-PANEL-24", "Patch Panel Cat6 24 Portas", "38500.00", cat("Infraestrutura de Rede"), br("TP-Link"),
        "Patch panel 19\" 1U com 24 portas RJ45 Cat6 para organização da rede.",
        "Organize o seu rack com certificação Cat6 e identificação clara de portas.",
        [("Portas", "24 × RJ45 Cat6"), ("Montagem", "Rack 19\" 1U")], stock=8)
    add("RACK-9U", "Bastidor de Parede 9U 19\"", "95000.00", cat("Infraestrutura de Rede"), br("RackTech"),
        "Bastidor de parede 9U com porta de vidro — proteja os seus equipamentos de rede.",
        "Para instalações compactas: 9U, profundidade ajustável, ventilação e fechadura.",
        [("Capacidade", "9U"), ("Montagem", "Parede"), ("Segurança", "Fechadura")], stock=4)
    add("RACK-12U", "Bastidor de Solo 12U 19\"", "145000.00", cat("Infraestrutura de Rede"), br("RackTech"),
        "Bastidor de solo 12U com portas de vidro e rodas.",
        "Estrutura robusta para servidores, switches e patch panels com gestão de cabos integrada.",
        [("Capacidade", "12U"), ("Montagem", "Solo (rodas)"), ("Gestão de cabos", "Integrada")], stock=3)
    add("ORG-CABOS", "Organizador de Cabos 1U", "8500.00", cat("Infraestrutura de Rede"), br("RackTech"),
        "Organizador horizontal de cabos para rack 19\".",
        "Mantenha os cabos organizados e etiquetados dentro do rack.",
        [("Formato", "1U"), ("Montagem", "Rack 19\"")], stock=15)
    add("CABO-CAT6", "Cabo de Rede Cat6 (por metro)", "513.00", cat("Cabos & Acessórios"), br("TP-Link"),
        "Cabo UTP Cat6 de cobre puro — vendido ao metro.",
        "Certificado para redes Gigabit e PoE, ideal para cablagem estruturada. Compre a quantidade exata de metros que precisa.",
        [("Padrão", "Cat6 UTP"), ("Condutor", "Cobre puro"), ("Venda", "Ao metro")], stock=500)
    add("CABO-CAT6A", "Cabo de Rede Cat6A (por metro)", "950.00", cat("Cabos & Acessórios"), br("TP-Link"),
        "Cabo UTP Cat6A blindado para redes 10G — vendido ao metro.",
        "Para infraestruturas de alta performance: suporta 10 Gigabit e reduz interferências em ambientes industriais.",
        [("Padrão", "Cat6A UTP"), ("Suporte", "10 Gigabit"), ("Venda", "Ao metro")], stock=300)
    add("RJ45-CONN", "Conector RJ45 Cat6", "399.00", cat("Cabos & Acessórios"), br("TP-Link"),
        "Conector RJ45 Cat6 com pentes de inserção — por unidade.",
        "Compatível com cabo sólido e fino, com canal interno para evitar erros de crimpagem.",
        [("Padrão", "Cat6"), ("Tipo", "RJ45 macho")], stock=1000)
    add("ALICATE-CRIMP", "Alicate de Crimpagem RJ45", "45500.00", cat("Ferramentas de Rede"), br("KVM"),
        "Alicate profissional para conectores RJ45/RJ11 com cortador e descarnador.",
        "Aço temperado, ratchet de precisão e lâminas para cabo UTP/STP.",
        [("Uso", "RJ45 / RJ11"), ("Extras", "Cortador + descarnador")], stock=8)
    add("TEST-REDE", "Testador de Cabos de Rede", "28500.00", cat("Ferramentas de Rede"), br("KVM"),
        "Testador de continuidade para cabos RJ45/RJ11 com indicação por LED.",
        "Verifique pinagens, continuidade e inversões em segundos, com unidade remota.",
        [("Testes", "RJ45 / RJ11 / coaxial"), ("Indicação", "LED")], stock=8)

    # ── CCTV ───────────────────────────────────────────────────────────
    add("CAM-DAHUA-BULLET", "Câmara Dahua IP Bullet 2MP", "68500.00", cat("IP Bullet"), br("Dahua"),
        "Câmara IP bullet 2MP com visão noturna até 30 m e PoE.",
        "Vigilância exterior fiável: resolução 1080p, deteção de movimento, proteção IP67 e alimentação PoE.",
        [("Resolução", "2 MP (1080p)"), ("Visão noturna", "30 m"), ("Proteção", "IP67"), ("PoE", "Sim")],
        stock=20, featured=True)
    add("CAM-DAHUA-DOME", "Câmara Dahua IP Dome 2MP", "72500.00", cat("Dome"), br("Dahua"),
        "Câmara dome 2MP para interiores com visão noturna e PoE.",
        "Design discreto ideal para lojas e escritórios; resolução 1080p com visão noturna até 25 m.",
        [("Resolução", "2 MP (1080p)"), ("Visão noturna", "25 m"), ("Uso", "Interior"), ("PoE", "Sim")], stock=20)
    add("CAM-HIK-BULLET", "Câmara Hikvision IP Bullet 4MP", "85500.00", cat("IP Bullet"), br("Hikvision"),
        "Câmara Hikvision bullet 4MP com colorVu e visão noturna a cores.",
        "Tecnologia ColorVu: imagem a cores mesmo à noite, 4 MP de resolução e proteção IP67.",
        [("Resolução", "4 MP"), ("ColorVu", "Visão noturna a cores"), ("Proteção", "IP67"), ("PoE", "Sim")],
        stock=15, is_new=True)
    add("CAM-HIK-PTZ", "Câmara Hikvision PTZ 2MP", "285000.00", cat("PTZ"), br("Hikvision"),
        "Câmara PTZ 2MP com zoom ótico 25×, rotação 360° e tracking automático.",
        "Vigilância ativa para perímetros e espaços amplos: zoom ótico 25×, auto-tracking e presets programáveis.",
        [("Zoom", "Ótico 25×"), ("Rotação", "360°"), ("Tracking", "Automático"), ("PoE", "Sim")], stock=4)
    add("DVR-4CH", "DVR Dahua 4 Canais", "95000.00", cat("Gravação & Armazenamento"), br("Dahua"),
        "Gravador DVR 4 canais com suporte a disco SATA até 8 TB.",
        "Gravação contínua ou por movimento, acesso remoto pela app e compatível com câmaras analógicas e HD-TVI.",
        [("Canais", "4"), ("Disco", "SATA até 8 TB"), ("Acesso remoto", "App / P2P")], stock=10)
    add("DVR-8CH", "DVR Dahua 8 Canais", "155000.00", cat("Gravação & Armazenamento"), br("Dahua"),
        "Gravador DVR 8 canais com suporte a discos até 8 TB.",
        "Grave 8 câmaras em simultâneo com compressão H.265+ e acesso remoto estável.",
        [("Canais", "8"), ("Disco", "SATA até 8 TB"), ("Compressão", "H.265+")], stock=8)
    add("NVR-8CH", "NVR Dahua 8 Canais (IP)", "265000.00", cat("Gravação & Armazenamento"), br("Dahua"),
        "Gravador NVR 8 canais para câmaras IP com PoE integrado.",
        "Grave e alimente câmaras IP diretamente: 8 portas PoE, até 8 TB e resolução até 4K.",
        [("Canais", "8 IP"), ("PoE", "8 portas"), ("Resolução", "Até 4K"), ("Disco", "Até 8 TB")], stock=5)
    add("HDD-WD-1TB", "Disco WD Purple 1TB", "95000.00", cat("Discos (HDD/SSD)"), br("WD"),
        "Disco rígido Western Digital Purple 1TB — otimizado para vigilância.",
        "Desenhado para gravação contínua em DVR/NVR: 24/7, tecnologia AllFrame e resistência a vibrações.",
        [("Capacidade", "1 TB"), ("Uso", "Vigilância 24/7"), ("Formato", "3,5\" SATA")], stock=12, featured=True)
    add("HDD-WD-4TB", "Disco WD Purple 4TB", "245000.00", cat("Discos (HDD/SSD)"), br("WD"),
        "Disco rígido Western Digital Purple 4TB para sistemas de vigilância.",
        "Armazenamento generoso para múltiplas câmaras com gravação contínua e tecnologia AllFrame.",
        [("Capacidade", "4 TB"), ("Uso", "Vigilância 24/7"), ("Formato", "3,5\" SATA")], stock=6)

    # ── Biometria / Acesso ─────────────────────────────────────────────
    add("RELOGIO-ZKTECO", "Relógio de Ponto ZKTeco", "195000.00", cat("Relógios de Ponto"), br("ZKTeco"),
        "Relógio de ponto biométrico com impressão digital e cartão — o mais usado em Angola.",
        "Registo de ponto por impressão digital, cartão RFID ou PIN, com software de gestão incluído e rede TCP/IP.",
        [("Métodos", "Impressão + cartão + PIN"), ("Capacidade", "3.000 utilizadores"), ("Rede", "TCP/IP"),
         ("Software", "Incluído")], stock=8, featured=True)
    add("BIO-ZKTECO-F", "Leitor Biométrico ZKTeco", "145000.00", cat("Leitores Biométricos"), br("ZKTeco"),
        "Leitor biométrico de impressão digital para controlo de acessos.",
        "Identificação em menos de 1 segundo, controlo de portas com fecho magnético e eventos em tempo real.",
        [("Métodos", "Impressão digital"), ("Portas", "1 saída de relé"), ("Rede", "TCP/IP")], stock=8)
    add("VIDEO-PORTEIRO", "Videoporteiro 2 Fios", "115000.00", cat("Videoporteiros"), br("Hikvision"),
        "Videoporteiro com ecrã de 7\" e câmara exterior — veja quem está à porta.",
        "Placa exterior com câmara e microfone, monitor interior de 7\" e abertura de porta remota pela app.",
        [("Monitor", '7"'), ("Ligação", "2 fios"), ("App", "Abertura remota")], stock=6, is_new=True)
    add("FECHADURA-SMART", "Fechadura Inteligente", "325000.00", cat("Fechaduras Inteligentes"), br("ZKTeco"),
        "Fechadura inteligente com impressão digital, PIN, cartão e app.",
        "Acesso sem chave: impressão digital, PIN, cartão RFID, chave mecânica de emergência e registo de eventos.",
        [("Métodos", "Digital + PIN + cartão + chave"), ("Instalação", "Bocal standard"), ("App", "Registo de eventos")],
        stock=5, is_new=True)

    # ── Impressoras ────────────────────────────────────────────────────
    add("IMP-HP-D2876", "Impressora HP Deskjet 2876", "85500.00", cat("Jato de Tinta"), br("HP"),
        "Multifunções a jato de tinta: impressão, cópia e digitalização wireless.",
        "A solução acessível para casa e pequenos escritórios: impressão Wi-Fi e pela app HP Smart.",
        [("Funções", "Imprimir / Copiar / Digitalizar"), ("Rede", "Wi-Fi"), ("Velocidade", "7,5 ppm (preto)")],
        stock=10)
    add("IMP-HP-ST581", "Impressora HP Smart Tank 581", "216140.00", cat("Jato de Tinta"), br("HP"),
        "Impressora tanque de tinta com até 12.000 páginas incluídas — custo por página mínimo.",
        "O sistema de tanques de tinta com três anos de tinta incluída na embalagem. Impressão, cópia e digitalização com Wi-Fi.",
        [("Sistema", "Tanque de tinta"), ("Páginas incluídas", "Até 12.000"), ("Funções", "Imprimir / Copiar / Digitalizar"),
         ("Rede", "Wi-Fi")], stock=8, featured=True)
    add("IMP-HP-IT750", "Impressora HP Ink Tank 750", "485000.00", cat("Jato de Tinta"), br("HP"),
        "Multifunções a tanque de tinta com grande volume — para escritórios movimentados.",
        "Impressão em alta velocidade (23 ppm), tanques de alto rendimento e alimentação de papel dupla.",
        [("Sistema", "Tanque de tinta"), ("Velocidade", "23 ppm (preto)"), ("Funções", "Imprimir / Copiar / Digitalizar / Fax")],
        stock=5)
    add("IMP-HP-M404", "Impressora HP LaserJet M404DW", "419000.00", cat("Laser"), br("HP"),
        "Impressora laser monocromática rápida com duplex automático e Wi-Fi.",
        "A preta e branca empresarial: 38 ppm, duplex automático, Wi-Fi e segurança para escritório.",
        [("Tipo", "Laser monocromática"), ("Velocidade", "38 ppm"), ("Duplex", "Automático"), ("Rede", "Wi-Fi + Gigabit")],
        stock=6, featured=True)
    add("IMP-EPSON-L3250", "Impressora Epson EcoTank L3250", "265000.00", cat("Jato de Tinta"), br("Epson"),
        "Multifunções EcoTank com garrafas de tinta — milhares de páginas por recarga.",
        "Sistema de garrafas com rendimento até 7.500 páginas a preto; impressão, cópia e digitalização Wi-Fi.",
        [("Sistema", "EcoTank"), ("Rendimento", "Até 7.500 pág. (preto)"), ("Funções", "Imprimir / Copiar / Digitalizar")],
        stock=8)
    add("IMP-CANON-G3410", "Impressora Canon PIXMA G3410", "235000.00", cat("Jato de Tinta"), br("Canon"),
        "Multifunções a tanque de tinta Canon — economia sem comprometer a qualidade.",
        "Até 6.000 páginas a preto por recarga, qualidade fotográfica e impressão sem fios.",
        [("Sistema", "Tanque de tinta"), ("Rendimento", "Até 6.000 pág. (preto)"), ("Rede", "Wi-Fi")], stock=6)
    add("IMP-BROTHER-2530", "Multifunções Brother DCP-L2530DW", "315000.00", cat("Multifunções"), br("Brother"),
        "Multifunções laser com duplex automático, Wi-Fi e digitalização rápida.",
        "Laser preto e branco com 30 ppm, duplex automático e custo por página reduzido — a escolha dos escritórios.",
        [("Tipo", "Laser monocromática"), ("Funções", "Imprimir / Copiar / Digitalizar"), ("Duplex", "Automático"),
         ("Rede", "Wi-Fi + Gigabit")], stock=5)

    # ── Armazenamento ──────────────────────────────────────────────────
    add("SSD-256", "SSD 256GB SATA", "45600.00", cat("Discos (HDD/SSD)"), br("Kingston"),
        "SSD SATA de 256 GB — acelere qualquer computador.",
        "Substitua o disco rígido por um SSD e sinta a diferença: arranques em segundos e programas a abrir de imediato.",
        [("Capacidade", "256 GB"), ("Interface", "SATA III"), ("Leitura", "Até 500 MB/s")], stock=20)
    add("SSD-360", "SSD 360GB SATA", "51300.00", cat("Discos (HDD/SSD)"), br("Kingston"),
        "SSD SATA de 360 GB — desempenho equilibrado a bom preço.",
        "Capacidade extra com a mesma velocidade: ideal para sistemas e aplicações diárias.",
        [("Capacidade", "360 GB"), ("Interface", "SATA III"), ("Leitura", "Até 500 MB/s")], stock=15)
    add("SSD-480", "SSD 480GB SATA", "68500.00", cat("Discos (HDD/SSD)"), br("Kingston"),
        "SSD SATA de 480 GB — espaço e velocidade para o dia-a-dia.",
        "480 GB de armazenamento rápido para sistemas, documentos e aplicações.",
        [("Capacidade", "480 GB"), ("Interface", "SATA III"), ("Leitura", "Até 500 MB/s")], stock=12)
    add("SSD-1TB-NVME", "SSD 1TB NVMe", "145000.00", cat("Discos (HDD/SSD)"), br("Kingston"),
        "SSD NVMe de 1 TB com leituras até 3.500 MB/s.",
        "O máximo em velocidade para portáteis e desktops modernos: PCIe 3.0 x4, ideal para sistemas operativos e jogos.",
        [("Capacidade", "1 TB"), ("Interface", "NVMe PCIe 3.0"), ("Leitura", "Até 3.500 MB/s")], stock=10, is_new=True)

    # ── Consumíveis ────────────────────────────────────────────────────
    add("TONER-HP-85A", "Toner HP 85A (CF285A)", "95000.00", cat("Toners"), br("HP"),
        "Toner original HP 85A — até 1.600 páginas.",
        "Qualidade de impressão original com rendimento garantido para LaserJet M404 e P2035.",
        [("Rendimento", "1.600 páginas"), ("Compatível", "LaserJet M404 / P2035"), ("Cor", "Preto")], stock=15)
    add("TONER-BR-TN2470", "Toner Brother TN-2470", "85000.00", cat("Toners"), br("Brother"),
        "Toner original Brother TN-2470 — até 3.000 páginas.",
        "Rendimento elevado para as multifunções Brother DCP-L2530, MFC-L2710 e HL-L2350.",
        [("Rendimento", "3.000 páginas"), ("Compatível", "DCP-L2530 / MFC-L2710"), ("Cor", "Preto")], stock=12)
    add("TONER-KY-1110", "Toner Kyocera TK-1110", "48500.00", cat("Toners"), br("Kyocera"),
        "Toner original Kyocera TK-1110 — até 2.500 páginas.",
        "Para as impressoras Kyocera ECOSYS P1025 e M1025 com sistema de longo ciclo de vida.",
        [("Rendimento", "2.500 páginas"), ("Compatível", "ECOSYS P1025 / M1025"), ("Cor", "Preto")], stock=15)
    add("TINT-HP-305", "Tinteiro HP 305 (preto)", "12500.00", cat("Tinteiros"), br("HP"),
        "Tinteiro original HP 305 preto — até 120 páginas.",
        "Para as impressoras Deskjet 2710, 2876 e 4100 series.",
        [("Rendimento", "Até 120 páginas"), ("Compatível", "Deskjet 2710 / 2876 / 4100"), ("Cor", "Preto")], stock=25)
    add("TINT-EPSON-664", "Tinteiro Epson 664 (preto)", "8500.00", cat("Tinteiros"), br("Epson"),
        "Garrafa de tinta Epson 664 preto — até 4.500 páginas.",
        "Tinta original para EcoTank L3150, L3250 e L5190.",
        [("Rendimento", "Até 4.500 páginas"), ("Compatível", "EcoTank L3xxx"), ("Cor", "Preto")], stock=25)
    add("PAPEL-A4", "Resma de Papel A4 80g (500 folhas)", "9500.00", cat("Papel"), br("Navigator"),
        "Papel A4 80 g/m² de alta brancura — 500 folhas.",
        "Papel de qualidade para impressão e fotocópias com excelente lisura e opacidade.",
        [("Formato", "A4 (210×297 mm)"), ("Gramagem", "80 g/m²"), ("Folhas", "500")], stock=100)
    add("PAPEL-FOTO", "Papel Fotográfico A4 Glossy (20 folhas)", "45500.00", cat("Papel"), br("Navigator"),
        "Papel fotográfico brilhante A4 — 20 folhas de 180 g/m².",
        "Impressões com cores vivas e secagem rápida, compatível com jato de tinta.",
        [("Formato", "A4"), ("Acabamento", "Brilhante"), ("Gramagem", "180 g/m²"), ("Folhas", "20")], stock=20)
    add("ETIQ-TERM", "Etiquetas Térmicas 100×150mm (500 un)", "38500.00", cat("Etiquetas & Rolos"), br("Zebra"),
        "Etiquetas térmicas de envio 100×150 mm — 500 unidades.",
        "Para impressoras térmicas de envio: aderência forte e compatíveis com transportadoras.",
        [("Dimensão", "100×150 mm"), ("Tipo", "Térmica direta"), ("Unidades", "500")], stock=15)
    add("ROLOS-POS", "Rolos Térmicos POS 58×40 (50 un)", "25500.00", cat("Etiquetas & Rolos"), br("Zebra"),
        "Rolos de papel térmico 58×40 mm para impressoras POS — 50 unidades.",
        "Papel térmico de 8 metros por rolo, compatível com a maioria das impressoras POS.",
        [("Dimensão", "58×40 mm"), ("Tipo", "Térmico"), ("Unidades", "50")], stock=15)

    # ── Escritório ─────────────────────────────────────────────────────
    add("CANETAS-50", "Canetas Esferográficas (caixa 50)", "12500.00", cat("Material de Escritório"), br("Staedtler"),
        "Caixa com 50 canetas esferográficas azuis.",
        "Escrita suave e duradoura para secretária e salas de reuniões.",
        [("Unidades", "50"), ("Cor", "Azul"), ("Ponta", "1,0 mm")], stock=30)
    add("AGRAFADOR", "Agrafador Metálico", "8500.00", cat("Material de Escritório"), br("Staedtler"),
        "Agrafador metálico com 20 folhas de capacidade.",
        "Construção robusta com base antideslizante e carregador de 24/6.",
        [("Capacidade", "20 folhas"), ("Agrafos", "24/6 e 26/6")], stock=20)
    add("ARQUIVADOR", "Arquivador A–Z", "7500.00", cat("Material de Escritório"), br("Staedtler"),
        "Arquivador de cartão com separadores A–Z para documentos.",
        "Organize correspondência e documentos com separadores A–Z reforçados.",
        [("Separação", "A–Z"), ("Material", "Cartão reforçado")], stock=20)
    add("PASTAS-10", "Pastas Suspensas (10 unidades)", "6500.00", cat("Material de Escritório"), br("Staedtler"),
        "Pacote com 10 pastas suspensas para arquivo.",
        "Compatíveis com gavetas de arquivo standard e com etiquetas de identificação.",
        [("Unidades", "10"), ("Formato", "A4")], stock=20)
    add("FURADOR", "Furador de 2 Furos", "7500.00", cat("Material de Escritório"), br("Staedtler"),
        "Furador metálico de 2 furos com base de medição.",
        "Perfura até 12 folhas com guia de centragem ajustável.",
        [("Furos", "2"), ("Capacidade", "12 folhas")], stock=15)
    add("CALCULADORA", "Calculadora de Secretária 12 Dígitos", "18500.00", cat("Material de Escritório"), br("Casio"),
        "Calculadora Casio com 12 dígitos, impressão de arredondamento e alimentação solar.",
        "Funcionamento solar + bateria, teclas grandes e ecrã inclinado.",
        [("Dígitos", "12"), ("Alimentação", "Solar + bateria")], stock=10)
    add("QUADRO-BRANCO", "Quadro Branco 60×90 cm", "28500.00", cat("Material de Escritório"), br("Deli"),
        "Quadro branco magnético 60×90 cm com suporte de cavalete.",
        "Superfície de escrita suave, bandeja para marcadores e suporte de mesa incluído.",
        [("Dimensão", "60×90 cm"), ("Magnético", "Sim"), ("Inclui", "Cavalete + bandeja")], stock=8)
    add("CADEIRA-ESC", "Cadeira de Escritório Ergonómica", "145000.00", cat("Mobiliário"), br("Kayan"),
        "Cadeira ergonómica com apoio lombar, braços ajustáveis e rede respirável.",
        "Conforto para jornadas longas: apoio lombar, encosto em rede, braços 3D e pistão de gás.",
        [("Encosto", "Rede respirável"), ("Braços", "Ajustáveis 3D"), ("Capacidade", "120 kg")], stock=6)
    add("MESA-ESC", "Mesa de Escritório 140 cm", "385000.00", cat("Mobiliário"), br("Kayan"),
        "Mesa de escritório de 140 cm com gavetas e passagem de cabos.",
        "Tampo de madeira resistente, estrutura metálica e passador de cabos integrado.",
        [("Dimensão", "140×70 cm"), ("Gavetas", "2"), ("Material", "Madeira + metal")], stock=4)

    # ── Energia ────────────────────────────────────────────────────────
    add("UPS-600", "UPS 600VA", "125000.00", cat("UPS & Estabilizadores"), br("APC"),
        "UPS 600VA com proteção contra quedas e picos de tensão.",
        "Proteja computadores e equipamentos de rede: autonomia para encerramento seguro durante cortes de energia.",
        [("Potência", "600 VA / 360 W"), ("Tomadas", "4 com bateria"), ("Proteção", "Surge + bateria")], stock=10)
    add("UPS-1500", "UPS 1500VA", "285000.00", cat("UPS & Estabilizadores"), br("APC"),
        "UPS 1500VA linha-interativa com ecrã LCD e maior autonomia.",
        "Para servidores, caixas e equipamentos críticos: estabilização de tensão, bateria e gestão por software.",
        [("Potência", "1500 VA / 900 W"), ("Tomadas", "8 com bateria"), ("Ecrã", "LCD")], stock=6)
    add("ESTABILIZADOR", "Estabilizador 8 Tomadas", "55500.00", cat("UPS & Estabilizadores"), br("APC"),
        "Estabilizador de tensão com 8 tomadas e proteção de linha telefónica.",
        "Regule picos e quedas de tensão — essencial em Angola — com filtro de linha e proteção telefónica/RJ45.",
        [("Tomadas", "8"), ("Proteção", "Surge + RJ45"), ("Uso", "Computadores / TV")], stock=12)

    # ── Software ───────────────────────────────────────────────────────
    add("M365-BUS", "Microsoft 365 Business (1 ano)", "185000.00", cat("Microsoft 365"), br("Microsoft"),
        "Subscrição anual Microsoft 365 Business — Office completo + e-mail profissional.",
        "Word, Excel, PowerPoint, Outlook com domínio próprio, 1 TB OneDrive e Teams. Licença anual por utilizador.",
        [("Aplicações", "Office completo + Teams"), ("Armazenamento", "1 TB OneDrive"), ("Email", "Domínio próprio"),
         ("Validade", "1 ano")], stock=0, is_new=True)
    add("WIN11-PRO", "Windows 11 Pro (OEM)", "215000.00", cat("Software & Licenças"), br("Microsoft"),
        "Licença original Windows 11 Pro para equipamentos novos.",
        "Instalação limpa em equipamentos OEM, com atualizações oficiais e suporte Microsoft.",
        [("Edição", "Pro"), ("Tipo", "OEM"), ("Atualizações", "Oficiais")], stock=0)

    for p in P:
        product, created = Product.objects.get_or_create(
            sku=p["sku"],
            defaults={
                "name": p["name"], "price": p["price"], "category": p["category"],
                "brand": p["brand"], "description": p["description"],
                "full_description": p["full_description"], "specs": [{"label": a, "value": b} for a, b in p["specs"]],
                "image": f"/images/products/{p['sku']}.jpg", "stock": p["stock"],
                "is_featured": p["featured"], "is_new": p["is_new"],
                "slug": p["name"].lower().replace("(", "").replace(")", "").replace("\"", "")
                .replace("º", "o").replace("ª", "a").replace("×", "x")
                .replace(" ", "-").replace("--", "-").replace("--", "-").replace("–", "-")
                .replace("/", "-").replace("ç", "c").replace("ã", "a").replace("é", "e")
                .replace("ê", "e").replace("í", "i").replace("ó", "o").replace("ú", "u").replace("á", "a"),
            },
        )
        if not created:
            for key in ["name", "description", "full_description", "specs"]:
                setattr(product, key, p[key] if key != "specs" else [{"label": a, "value": b} for a, b in p["specs"]])
            product.image = f"/images/products/{p['sku']}.jpg"
            product.is_featured = p["featured"]
            product.is_new = p["is_new"]
            product.save()


def unseed(apps, schema_editor):
    Product = apps.get_model("catalog", "Product")
    skus = [
        "HP-PB-440", "HP-PAV-15", "DELL-LAT-3540", "LEN-TP-E14", "DESKTOP-HP-400", "DESKTOP-DELL-7010",
        "MINIPC-HP", "MINIPC-BEELINK", "MON-22", "MON-24", "MON-27", "TECL-HP", "KIT-TECL-RATO", "RATO-HP",
        "HEADSET-EMP", "WEBCAM-FHD", "DOCK-USB-C", "SW-5P", "SW-8P", "SW-16P", "NET-SW-24", "SW-48P",
        "SW-POE-8P", "SW-POE-24P", "ROUT-MIKROTIK-HEX", "ROUT-MIKROTIK-4011", "ROUT-TP-C6", "AP-UBIQUITI-U6",
        "AP-TP-EAP", "PATCH-PANEL-24", "RACK-9U", "RACK-12U", "ORG-CABOS", "CABO-CAT6", "CABO-CAT6A", "RJ45-CONN",
        "ALICATE-CRIMP", "TEST-REDE", "CAM-DAHUA-BULLET", "CAM-DAHUA-DOME", "CAM-HIK-BULLET", "CAM-HIK-PTZ",
        "DVR-4CH", "DVR-8CH", "NVR-8CH", "HDD-WD-1TB", "HDD-WD-4TB", "RELOGIO-ZKTECO", "BIO-ZKTECO-F",
        "VIDEO-PORTEIRO", "FECHADURA-SMART", "IMP-HP-D2876", "IMP-HP-ST581", "IMP-HP-IT750", "IMP-HP-M404",
        "IMP-EPSON-L3250", "IMP-CANON-G3410", "IMP-BROTHER-2530", "SSD-256", "SSD-360", "SSD-480", "SSD-1TB-NVME",
        "TONER-HP-85A", "TONER-BR-TN2470", "TONER-KY-1110", "TINT-HP-305", "TINT-EPSON-664", "PAPEL-A4",
        "PAPEL-FOTO", "ETIQ-TERM", "ROLOS-POS", "CANETAS-50", "AGRAFADOR", "ARQUIVADOR", "PASTAS-10", "FURADOR",
        "CALCULADORA", "QUADRO-BRANCO", "CADEIRA-ESC", "MESA-ESC", "UPS-600", "UPS-1500", "ESTABILIZADOR",
        "M365-BUS", "WIN11-PRO",
    ]
    Product.objects.filter(sku__in=skus).update(image="", description="", full_description="", specs=[])


class Migration(migrations.Migration):

    dependencies = [
        ("catalog", "0004_seed_products_real"),
    ]

    operations = [
        migrations.RunPython(seed, unseed),
    ]