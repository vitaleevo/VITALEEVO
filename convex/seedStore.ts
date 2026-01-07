import { mutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * Script robusto para povoar a loja com produtos IT categorizados e imagens únicas.
 */
export const seedStore = mutation({
    args: {},
    handler: async (ctx) => {
        const results = {
            categoriesCreated: 0,
            productsUpserted: 0
        };

        const STORE_CATEGORIES = [
            { name: "Laptops", slug: "laptops", order: 1, description: "Portáteis de alto desempenho para trabalho e lazer." },
            { name: "Computadores", slug: "computadores", order: 2, description: "Desktops, All-in-Ones e Estações de Trabalho." },
            { name: "Impressoras", slug: "impressoras", order: 3, description: "Impressoras Laser, Jato de Tinta e Multifuncionais." },
            { name: "Consumíveis", slug: "consumiveis", order: 4, description: "Toners, Tinteiros e Papel de alta qualidade." },
            { name: "Biometria", slug: "biometria", order: 5, description: "Sistemas de controlo de acesso e reconhecimento facial." },
            { name: "Periféricos", slug: "perifericos", order: 6, description: "Teclados, Ratos, Monitores e Acessórios." },
            { name: "Redes", slug: "redes", order: 7, description: "Routers, Switches e infraestrutura de rede." },
            { name: "Armazenamento", slug: "armazenamento", order: 8, description: "Discos Externos, SSDs e NAS." },
        ];

        // 1. Seed Categories
        for (const cat of STORE_CATEGORIES) {
            const existing = await ctx.db.query("categories")
                .withIndex("by_slug", q => q.eq("slug", cat.slug))
                .filter(q => q.eq(q.field("type"), "store"))
                .first();

            if (!existing) {
                await ctx.db.insert("categories", {
                    ...cat,
                    type: "store",
                    isActive: true
                });
                results.categoriesCreated++;
            }
        }

        const PRODUCTS_DATA = [
            // LAPTOPS
            {
                name: "MacBook Pro M3 Max 14\"",
                slug: "macbook-pro-m3-max-14",
                category: "Laptops",
                brand: "Apple",
                price: 2500000,
                oldPrice: 2800000,
                stock: 5,
                image: "https://images.unsplash.com/photo-1517336712461-70133df499c0?auto=format&fit=crop&q=80&w=800",
                description: "O portátil mais potente para profissionais criativos.",
                isFeatured: true,
                isNew: true,
                specs: [{ label: "Chip", value: "M3 Max" }, { label: "RAM", value: "36GB" }, { label: "SSD", value: "1TB" }]
            },
            {
                name: "Dell XPS 13 Plus",
                slug: "dell-xps-13-plus",
                category: "Laptops",
                brand: "Dell",
                price: 1200000,
                oldPrice: 1400000,
                stock: 8,
                image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&q=80&w=800",
                description: "Design minimalista com performance máxima.",
                isFeatured: false,
                isNew: true,
                specs: [{ label: "CPU", value: "Intel i7" }, { label: "RAM", value: "16GB" }, { label: "SSD", value: "512GB" }]
            },
            {
                name: "HP EliteBook 840 G10",
                slug: "hp-elitebook-840-g10",
                category: "Laptops",
                brand: "HP",
                price: 950000,
                stock: 12,
                image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&q=80&w=800",
                description: "Segurança e produtividade para empresas.",
                isFeatured: true,
                isNew: false,
                specs: [{ label: "CPU", value: "Intel i5" }, { label: "RAM", value: "16GB" }, { label: "SSD", value: "256GB" }]
            },
            {
                name: "Lenovo ThinkPad X1 Carbon",
                slug: "lenovo-thinkpad-x1-carbon",
                category: "Laptops",
                brand: "Lenovo",
                price: 1350000,
                stock: 4,
                image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&q=80&w=800",
                description: "O padrão ouro dos portáteis empresariais.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "CPU", value: "Intel i7" }, { label: "RAM", value: "16GB" }, { label: "Peso", value: "1.1kg" }]
            },

            // COMPUTADORES (DESKTOPS)
            {
                name: "iMac 24\" M3 Blue",
                slug: "imac-24-m3-blue",
                category: "Computadores",
                brand: "Apple",
                price: 1800000,
                stock: 3,
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
                description: "Tudo-em-um colorido e ultra-rápido.",
                isFeatured: true,
                isNew: true,
                specs: [{ label: "Ecrã", value: "4.5K Retina" }, { label: "Chip", value: "M3" }, { label: "RAM", value: "8GB" }]
            },
            {
                name: "Workstation HP Z2 G9",
                slug: "hp-z2-g9-workstation",
                category: "Computadores",
                brand: "HP",
                price: 1600000,
                stock: 2,
                image: "https://images.unsplash.com/photo-1593640495253-23196b27a81f?auto=format&fit=crop&q=80&w=800",
                description: "Potência brutal para engenharia e design.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "CPU", value: "Intel Xeon" }, { label: "GPU", value: "RTX A2000" }, { label: "RAM", value: "32GB" }]
            },

            // IMPRESSORAS
            {
                name: "HP LaserJet Pro M404n",
                slug: "hp-laserjet-pro-m404n",
                category: "Impressoras",
                brand: "HP",
                price: 350000,
                stock: 15,
                image: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800",
                description: "Impressão laser monocromática rápida e segura.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "Tipo", value: "Laser Mono" }, { label: "Velocidade", value: "38 ppm" }]
            },
            {
                name: "Epson EcoTank L3250",
                slug: "epson-ecotank-l3250",
                category: "Impressoras",
                brand: "Epson",
                price: 280000,
                oldPrice: 320000,
                stock: 20,
                image: "https://images.unsplash.com/photo-1582234372722-50d7ccc30e5a?auto=format&fit=crop&q=80&w=800",
                description: "Impressão a cores com custo ultra-baixo por página.",
                isFeatured: true,
                isNew: false,
                specs: [{ label: "Tipo", value: "Tanque de Tinta" }, { label: "Conexão", value: "Wi-Fi" }]
            },

            // BIOMETRIA
            {
                name: "Terminal Hikvision Reconhecimento Facial",
                slug: "hikvision-facial-terminal",
                category: "Biometria",
                brand: "Hikvision",
                price: 450000,
                stock: 10,
                image: "https://images.unsplash.com/photo-1554224155-1696413575b9?auto=format&fit=crop&q=80&w=800",
                description: "Controlo de acesso sem contacto com IA.",
                isFeatured: true,
                isNew: true,
                specs: [{ label: "Ecrã", value: "7 polegadas" }, { label: "Capacidade", value: "10.000 faces" }]
            },
            {
                name: "Leitor Digital ZKTeco K40",
                slug: "zkteco-k40",
                category: "Biometria",
                brand: "ZKTeco",
                price: 120000,
                stock: 30,
                image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?auto=format&fit=crop&q=80&w=800",
                description: "Relógio de ponto biométrico com bateria interna.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "Biometria", value: "Impressão Digital" }, { label: "Interface", value: "TCP/IP" }]
            },

            // PERIFÉRICOS
            {
                name: "Monitor LG UltraWide 34\"",
                slug: "lg-ultrawide-34",
                category: "Periféricos",
                brand: "LG",
                price: 550000,
                stock: 6,
                image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800",
                description: "Produtividade imersiva com formato 21:9.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "Resolução", value: "3440 x 1440" }, { label: "Taxa", value: "160Hz" }]
            },
            {
                name: "Logitech MX Master 3S",
                slug: "logitech-mx-master-3s",
                category: "Periféricos",
                brand: "Logitech",
                price: 150000,
                stock: 25,
                image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&q=80&w=800",
                description: "O melhor rato do mundo para produtividade.",
                isFeatured: true,
                isNew: true,
                specs: [{ label: "Sensor", value: "8K DPI" }, { label: "Conexão", value: "Logi Bolt" }]
            },

            // REDES
            {
                name: "Router Ubiquiti Dream Machine",
                slug: "ubiquiti-dream-machine",
                category: "Redes",
                brand: "Ubiquiti",
                price: 450000,
                stock: 5,
                image: "https://images.unsplash.com/photo-1544197150-b99a580675eb?auto=format&fit=crop&q=80&w=800",
                description: "Ecossistema de rede profissional tudo-em-um.",
                isFeatured: true,
                isNew: true,
                specs: [{ label: "Wi-Fi", value: "Tipo 6" }, { label: "Segurança", value: "IDS/IPS" }]
            },

            // ARMAZENAMENTO
            {
                name: "SSD Externo Samsung T7 1TB",
                slug: "samsung-t7-1tb-ssd",
                category: "Armazenamento",
                brand: "Samsung",
                price: 180000,
                stock: 40,
                image: "https://images.unsplash.com/photo-1597740985671-2a8a3b80502e?auto=format&fit=crop&q=80&w=800",
                description: "Transferências ultra-rápidas em formato de bolso.",
                isFeatured: false,
                isNew: false,
                specs: [{ label: "Velocidade", value: "1050 MB/s" }, { label: "Interface", value: "USB-C" }]
            }
        ];

        // 2. Seed Products
        for (const product of PRODUCTS_DATA) {
            const existing = await ctx.db.query("products")
                .withIndex("by_slug", q => q.eq("slug", product.slug))
                .first();

            const finalData = {
                ...product,
                isActive: true,
                rating: 4.5 + Math.random() * 0.5,
                reviewCount: Math.floor(Math.random() * 100),
            };

            if (!existing) {
                await ctx.db.insert("products", {
                    ...finalData as any,
                    createdAt: Date.now(),
                });
                results.productsUpserted++;
            } else {
                await ctx.db.patch(existing._id, finalData as any);
                results.productsUpserted++;
            }
        }

        return `Sucesso! Loja atualizada: ${results.categoriesCreated} categorias novas, ${results.productsUpserted} produtos sincronizados com imagens únicas.`;
    },
});
