import { mutation } from "./_generated/server";

interface SeedChild {
    name: string;
    slug: string;
}

interface SeedCategory {
    name: string;
    slug: string;
    order: number;
    children?: SeedChild[];
}

// Estrutura do catálogo da loja — categorias com subcategorias.
// Executar com: npx convex run catalogSeed:seedCatalog (idempotente).
const STORE_CATEGORIES: SeedCategory[] = [
    {
        name: "Computadores",
        slug: "computadores",
        order: 1,
        children: [
            { name: "Portáteis", slug: "portateis" },
            { name: "Desktops", slug: "desktops" },
            { name: "All-in-One", slug: "all-in-one" },
        ],
    },
    {
        name: "Impressoras",
        slug: "impressoras",
        order: 2,
        children: [
            { name: "Térmicas / POS", slug: "termicas-pos" },
            { name: "Multifunções", slug: "multifuncoes" },
            { name: "Matriciais", slug: "matriciais" },
        ],
    },
    {
        name: "Servidores",
        slug: "servidores",
        order: 3,
    },
    {
        name: "Software & Licenças",
        slug: "software-licencas",
        order: 4,
        children: [
            { name: "Antivírus", slug: "antivirus" },
            { name: "Windows Server", slug: "windows-server" },
            { name: "Windows 11 Pro", slug: "windows-11-pro" },
        ],
    },
    {
        name: "Câmaras de Vigilância",
        slug: "camaras-vigilancia",
        order: 5,
        children: [
            { name: "IP Bullet", slug: "ip-bullet" },
            { name: "Analógicas", slug: "analogicas" },
            { name: "Dome", slug: "dome" },
            { name: "PTZ", slug: "ptz" },
        ],
    },
    {
        name: "Redes & Conectividade",
        slug: "redes-conectividade",
        order: 6,
        children: [
            { name: "Switches", slug: "switches" },
            { name: "Routers", slug: "routers" },
            { name: "Access Points", slug: "access-points" },
            { name: "Cabos & Acessórios", slug: "cabos-acessorios" },
        ],
    },
    {
        name: "Gravação & Armazenamento",
        slug: "gravacao-armazenamento",
        order: 7,
        children: [
            { name: "NVR", slug: "nvr" },
            { name: "DVR", slug: "dvr" },
            { name: "Discos (HDD/SSD)", slug: "discos" },
        ],
    },
    {
        name: "Acessórios & Periféricos",
        slug: "acessorios-perifericos",
        order: 8,
        children: [
            { name: "Pendrives", slug: "pendrives" },
            { name: "Teclados & Ratos", slug: "teclados-ratos" },
            { name: "Outros Acessórios", slug: "outros-acessorios" },
        ],
    },
];

export const seedCatalog = mutation({
    args: {},
    handler: async (ctx) => {
        let created = 0;
        let updated = 0;

        for (const cat of STORE_CATEGORIES) {
            const existing = await ctx.db
                .query("categories")
                .withIndex("by_type", (q) => q.eq("type", "store"))
                .filter((q) => q.eq(q.field("slug"), cat.slug))
                .first();

            const base = {
                name: cat.name,
                type: "store" as const,
                order: cat.order,
                isActive: true,
                description: undefined as string | undefined,
                parentSlug: undefined as string | undefined,
            };

            if (existing) {
                await ctx.db.patch(existing._id, { name: cat.name, order: cat.order });
                updated++;
            } else {
                await ctx.db.insert("categories", { ...base, slug: cat.slug });
                created++;
            }

            for (const child of cat.children ?? []) {
                const childExisting = await ctx.db
                    .query("categories")
                    .withIndex("by_type", (q) => q.eq("type", "store"))
                    .filter((q) => q.eq(q.field("slug"), child.slug))
                    .first();

                if (childExisting) {
                    await ctx.db.patch(childExisting._id, {
                        name: child.name,
                        parentSlug: cat.slug,
                    });
                    updated++;
                } else {
                    await ctx.db.insert("categories", {
                        name: child.name,
                        slug: child.slug,
                        type: "store",
                        parentSlug: cat.slug,
                        order: cat.order * 10 + (cat.children?.indexOf(child) ?? 0) + 1,
                        isActive: true,
                    });
                    created++;
                }
            }
        }

        return { created, updated, total: STORE_CATEGORIES.length };
    },
});

// Migração: remapeia produtos dos nomes de categoria antigos para a nova árvore
// (Computadores/Portáteis, Redes & Conectividade, etc.) e apaga categorias órfãs.
export const migrateProducts = mutation({
    args: {},
    handler: async (ctx) => {
        // Categorias extra que faltam na árvore base
        const EXTRA: SeedCategory[] = [
            {
                name: "Controlo de Acesso & Biometria",
                slug: "controlo-acesso-biometria",
                order: 9,
                children: [
                    { name: "Relógios de Ponto", slug: "relogios-ponto" },
                    { name: "Controladores de Acesso", slug: "controladores-acesso" },
                ],
            },
            { name: "Smartphones", slug: "smartphones", order: 10 },
        ];

        for (const cat of EXTRA) {
            const existing = await ctx.db
                .query("categories")
                .withIndex("by_type", (q) => q.eq("type", "store"))
                .filter((q) => q.eq(q.field("slug"), cat.slug))
                .first();
            if (!existing) {
                await ctx.db.insert("categories", {
                    name: cat.name,
                    slug: cat.slug,
                    type: "store",
                    order: cat.order,
                    isActive: true,
                });
            }
            for (const child of cat.children ?? []) {
                const childExisting = await ctx.db
                    .query("categories")
                    .withIndex("by_type", (q) => q.eq("type", "store"))
                    .filter((q) => q.eq(q.field("slug"), child.slug))
                    .first();
                if (!childExisting) {
                    await ctx.db.insert("categories", {
                        name: child.name,
                        slug: child.slug,
                        type: "store",
                        parentSlug: cat.slug,
                        order: cat.order * 10 + 1,
                        isActive: true,
                    });
                }
            }
        }

        // "Consumíveis" passa a subcategoria de "Impressoras"
        const consumiveisCat = await ctx.db
            .query("categories")
            .withIndex("by_type", (q) => q.eq("type", "store"))
            .filter((q) => q.eq(q.field("slug"), "consumiveis"))
            .first();
        if (consumiveisCat) {
            await ctx.db.patch(consumiveisCat._id, { parentSlug: "impressoras" });
        }

        const products = await ctx.db.query("products").collect();
        let remapped = 0;

        const isAio = (name: string) =>
            /iMac|ProOne|All-in-One|IdeaCentre AIO|Inspiron 24|AIO 3|24-cb1000/i.test(name);
        const isRouter = (name: string) =>
            /Router|EdgeRouter|Dream Machine|hAP|Archer|M7350|DWR/i.test(name);
        const isSwitch = (name: string) => /Switch/i.test(name);
        const isMouseKeyboard = (name: string) =>
            /Mouse|Teclado|Keyboard|MX Keys|MX Master|Arc Mouse|K380|K40\b/i.test(name);
        const isPendrive = (name: string) => /DataTraveler|Ultra Dual|Pendrive|Pen Drive/i.test(name);
        const isClock = (name: string) =>
            /Relógio|MB20|SpeedFace|uFace|K40 Relógio/i.test(name);

        for (const p of products) {
            let category: string | undefined;
            let subcategory: string | undefined;

            switch (p.category) {
                case "Laptops":
                case "Laptop":
                    category = "Computadores";
                    subcategory = "Portáteis";
                    break;
                case "Computadores":
                    category = "Computadores";
                    subcategory = isAio(p.name) ? "All-in-One" : "Desktops";
                    break;
                case "Impressoras":
                case "Impressora":
                    category = "Impressoras";
                    break;
                case "Consumíveis":
                    category = "Impressoras";
                    subcategory = "Consumíveis";
                    break;
                case "Redes":
                    category = "Redes & Conectividade";
                    subcategory = isRouter(p.name) ? "Routers" : isSwitch(p.name) ? "Switches" : "Access Points";
                    break;
                case "Periféricos":
                    category = "Acessórios & Periféricos";
                    subcategory = isMouseKeyboard(p.name) ? "Teclados & Ratos" : "Outros Acessórios";
                    break;
                case "Armazenamento":
                    category = isPendrive(p.name) ? "Acessórios & Periféricos" : "Gravação & Armazenamento";
                    subcategory = isPendrive(p.name) ? "Pendrives" : "Discos (HDD/SSD)";
                    break;
                case "Biometria":
                case "Biométricos":
                    category = "Controlo de Acesso & Biometria";
                    subcategory = isClock(p.name) ? "Relógios de Ponto" : "Controladores de Acesso";
                    break;
                case "Smartphones":
                    category = "Smartphones";
                    break;
                default:
                    continue;
            }

            if (category) {
                await ctx.db.patch(p._id, { category, subcategory });
                remapped++;
            }
        }

        // Apagar categorias órfãs antigas (sem produtos a referenciar)
        const oldSlugs = ["laptop", "desktop", "cameras", "laptops", "redes", "armazenamento", "perifericos", "biometria", "biometricos", "smartphones"];
        const remaining = await ctx.db.query("products").collect();
        const usedNames = new Set(remaining.map((p) => p.category));
        let deleted = 0;

        for (const slug of oldSlugs) {
            const cat = await ctx.db
                .query("categories")
                .withIndex("by_type", (q) => q.eq("type", "store"))
                .filter((q) => q.eq(q.field("slug"), slug))
                .first();
            if (cat && !usedNames.has(cat.name)) {
                await ctx.db.delete(cat._id);
                deleted++;
            }
        }

        return { remapped, deleted };
    },
});