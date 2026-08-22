"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    LayoutDashboard,
    Newspaper,
    FolderKanban,
    Briefcase,
    ScrollText,
    LayoutTemplate,
    Tags,
    Building2,
    Upload,
    Inbox,
    Mail,
    Users,
    ShieldCheck,
    Settings,
    UserCircle,
    ChevronRight,
    Sparkles,
    FileSpreadsheet,
    ArrowRight,
    Search,
    Flame,
} from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading } from "@/shared/components/admin/ui";

// Importações dos conteúdos dos módulos consolidados
import { AdminBlogContent } from "../blog/page";
import { AdminPortfolioContent } from "../portfolio/page";
import { AdminServicesContent } from "../services/page";
import { AdminLegalContent } from "../legal/page";
import { AdminSiteContent } from "../site/page";
import { AdminCategoriesContent } from "../categories/page";
import { AdminBrandsContent } from "../brands/page";
import { AdminImportContent } from "../import/page";
import { AdminContactsContent } from "../contacts/page";
import { AdminNewsletterContent } from "../newsletter/page";
import { AdminUsersContent } from "../users/page";
import { AdminAuditContent } from "../audit/page";
import { AdminSettingsContent } from "../settings/page";
import { AdminProfileContent } from "../profile/page";
import { AdminHeatmapView } from "@/shared/components/admin/AdminHeatmapView";

interface TabItem {
    id: string;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
    component: React.ComponentType;
}

interface TabGroup {
    group: string;
    items: TabItem[];
}

export default function AdminCMSHubPage() {
    const { token, user } = useAuth();
    const [activeTab, setActiveTab] = useState<string>("resumo");
    const [tabFilter, setTabFilter] = useState<string>("");

    // Carregar estatísticas gerais para a aba "Resumo"
    const { data: stats, isLoading: statsLoading } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.dashboard.getStats(token as string),
    });

    const TAB_GROUPS: TabGroup[] = useMemo(() => [
        {
            group: "Visão Geral",
            items: [
                {
                    id: "resumo",
                    label: "Hub Resumo",
                    description: "Painel central e métricas do CMS",
                    icon: LayoutDashboard,
                    component: () => <CMSOverviewTab onSelectTab={setActiveTab} stats={stats} loading={statsLoading} />,
                },
                {
                    id: "heatmap",
                    label: "Mapa de Calor & Cliques",
                    description: "Densidade de cliques e ranking de botões",
                    icon: Flame,
                    permission: "audit:read",
                    component: AdminHeatmapView,
                },
            ],
        },
        {
            group: "Conteúdos & Mídia",
            items: [
                {
                    id: "blog",
                    label: "Blog & Artigos",
                    description: "Publicações, notícias e artigos",
                    icon: Newspaper,
                    permission: "content:manage",
                    component: AdminBlogContent,
                },
                {
                    id: "portfolio",
                    label: "Portfólio",
                    description: "Projetos e estudos de caso",
                    icon: FolderKanban,
                    permission: "content:manage",
                    component: AdminPortfolioContent,
                },
                {
                    id: "services",
                    label: "Serviços",
                    description: "Serviços corporativos do site",
                    icon: Briefcase,
                    permission: "content:manage",
                    component: AdminServicesContent,
                },
                {
                    id: "legal",
                    label: "Documentos Legais",
                    description: "Termos de uso e privacidade",
                    icon: ScrollText,
                    permission: "content:manage",
                    component: AdminLegalContent,
                },
                {
                    id: "site",
                    label: "Páginas do Site",
                    description: "Estrutura institucional e SEO",
                    icon: LayoutTemplate,
                    permission: "settings:manage",
                    component: AdminSiteContent,
                },
            ],
        },
        {
            group: "Estrutura & Catálogo",
            items: [
                {
                    id: "categories",
                    label: "Categorias",
                    description: "Árvore de categorias e filtros",
                    icon: Tags,
                    permission: "catalog:read",
                    component: AdminCategoriesContent,
                },
                {
                    id: "brands",
                    label: "Marcas",
                    description: "Fabricantes e logótipos",
                    icon: Building2,
                    permission: "catalog:read",
                    component: AdminBrandsContent,
                },
                {
                    id: "import",
                    label: "Importar Excel",
                    description: "Importação e atualização em massa",
                    icon: Upload,
                    permission: "catalog:import",
                    component: AdminImportContent,
                },
            ],
        },
        {
            group: "Comunicação & CRM",
            items: [
                {
                    id: "contacts",
                    label: "Contactos",
                    description: "Mensagens recebidas no site",
                    icon: Inbox,
                    permission: "contacts:manage",
                    component: AdminContactsContent,
                },
                {
                    id: "newsletter",
                    label: "Newsletter",
                    description: "Subscritores e envio em massa",
                    icon: Mail,
                    permission: "contacts:manage",
                    component: AdminNewsletterContent,
                },
            ],
        },
        {
            group: "Administração & Sistema",
            items: [
                {
                    id: "users",
                    label: "Utilizadores & Staff",
                    description: "Contas, cargos e permissões",
                    icon: Users,
                    permission: "users:manage",
                    component: AdminUsersContent,
                },
                {
                    id: "audit",
                    label: "Auditoria & Logs",
                    description: "Registo imutável de operações",
                    icon: ShieldCheck,
                    permission: "audit:read",
                    component: AdminAuditContent,
                },
                {
                    id: "settings",
                    label: "Configurações",
                    description: "Parâmetros globais (site_config)",
                    icon: Settings,
                    permission: "settings:manage",
                    component: AdminSettingsContent,
                },
                {
                    id: "profile",
                    label: "O Meu Perfil",
                    description: "Informações da conta autenticada",
                    icon: UserCircle,
                    component: AdminProfileContent,
                },
            ],
        },
    ], [stats, statsLoading]);

    // Filtrar abas com base nas permissões do utilizador
    const hasPermission = useCallback((permission?: string) => {
        if (!permission) return true;
        if (user?.role === "admin" || (user as any)?.isSuperuser) return true;
        const perms: string[] = user?.permissions || [];
        if (permission === "catalog:read" && perms.includes("catalog:manage")) return true;
        return perms.includes(permission);
    }, [user]);

    const permittedGroups = useMemo(() => {
        return TAB_GROUPS.map(group => ({
            ...group,
            items: group.items.filter(item => hasPermission(item.permission)),
        })).filter(group => group.items.length > 0);
    }, [TAB_GROUPS, hasPermission]);

    const allPermittedItems = useMemo(() => {
        return permittedGroups.flatMap(g => g.items);
    }, [permittedGroups]);

    // Sincronizar activeTab com o Hash da URL (#blog, #portfolio, etc.)
    useEffect(() => {
        const hash = window.location.hash.replace("#", "");
        if (hash && allPermittedItems.some(i => i.id === hash)) {
            setActiveTab(hash);
        }
    }, [allPermittedItems]);

    const handleSelectTab = (tabId: string) => {
        setActiveTab(tabId);
        window.history.replaceState(null, "", `#${tabId}`);
    };

    const currentTabItem = allPermittedItems.find(i => i.id === activeTab) || allPermittedItems[0];
    const ActiveComponent = currentTabItem?.component || (() => <div className="p-8 text-center text-gray-400">Aba não encontrada</div>);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const categories = useMemo(() => {
        return [
            { id: "all", label: "Todos os Módulos" },
            ...permittedGroups.map(g => ({ id: g.group, label: g.group })),
        ];
    }, [permittedGroups]);

    const displayedTabs = useMemo(() => {
        let items = allPermittedItems;
        if (selectedCategory !== "all") {
            const group = permittedGroups.find(g => g.group === selectedCategory);
            items = group ? group.items : allPermittedItems;
        }
        if (tabFilter.trim()) {
            const q = tabFilter.toLowerCase();
            items = items.filter(i => i.label.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
        }
        return items;
    }, [allPermittedItems, permittedGroups, selectedCategory, tabFilter]);

    return (
        <div className="space-y-6">
            {/* Top Hub Breadcrumb & Navigation Bar */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#151e32] border border-gray-100 dark:border-white/5 shadow-sm space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-purple-600 text-white flex items-center justify-center shadow-lg shadow-primary/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <span>Painel Administrativo</span>
                                <span>/</span>
                                <span className="text-primary font-black">Hub CMS Unificado</span>
                            </div>
                            <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white mt-0.5">
                                Gestão Central de Conteúdos & Sistema
                            </h1>
                        </div>
                    </div>

                    {/* Campo de pesquisa de abas */}
                    <div className="relative min-w-[240px]">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={tabFilter}
                            onChange={e => setTabFilter(e.target.value)}
                            placeholder="Pesquisar módulo..."
                            className="w-full text-xs rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 pl-9 pr-3 py-2.5 text-gray-900 dark:text-white outline-none focus:border-primary/50"
                        />
                    </div>
                </div>

                {/* Filtros de Categoria em Pílulas */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                selectedCategory === cat.id
                                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-sm"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10"
                            }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Abas Horizontais do Hub */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
                    {displayedTabs.map(item => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelectTab(item.id)}
                                className={`shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                                    isActive
                                        ? "bg-primary text-white shadow-md shadow-primary/25 scale-[1.02]"
                                        : "bg-gray-50 dark:bg-[#0f172a] text-gray-700 dark:text-gray-300 hover:bg-primary/10 hover:text-primary border border-gray-200/60 dark:border-white/5"
                                }`}
                            >
                                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-gray-400 group-hover:text-primary"}`} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Painel de Conteúdo Ativo (100% de Largura sem Segundo Sidebar) */}
            <div className="w-full">
                <ActiveComponent />
            </div>
        </div>
    );
}

// ── Aba de Resumo / Overview do CMS ──────────────────────────────────────────
function CMSOverviewTab({ onSelectTab, stats, loading }: { onSelectTab: (tabId: string) => void; stats: any; loading: boolean }) {
    if (loading) return <Loading label="A carregar métricas do CMS..." />;

    const quickCards = [
        { id: "heatmap", label: "Mapa de Calor & Cliques", desc: "Densidade térmica e ranking", icon: Flame, color: "text-rose-500 bg-rose-500/10" },
        { id: "blog", label: "Artigos do Blog", desc: "Notícias & Conteúdos", icon: Newspaper, color: "text-blue-500 bg-blue-500/10" },
        { id: "portfolio", label: "Portfólio", desc: "Projetos Concluídos", icon: FolderKanban, color: "text-purple-500 bg-purple-500/10" },
        { id: "services", label: "Serviços", desc: "Oferta Institucional", icon: Briefcase, color: "text-amber-500 bg-amber-500/10" },
        { id: "categories", label: "Categorias", desc: "Catálogo & Loja", icon: Tags, color: "text-emerald-500 bg-emerald-500/10" },
        { id: "contacts", label: "Contactos", desc: `${stats?.contacts?.total ?? 0} mensagens recebidas`, icon: Inbox, color: "text-indigo-500 bg-indigo-500/10" },
        { id: "newsletter", label: "Newsletter", desc: `${stats?.newsletterSubscribers ?? 0} subscritores ativos`, icon: Mail, color: "text-rose-500 bg-rose-500/10" },
        { id: "users", label: "Utilizadores", desc: `${stats?.users?.total ?? 0} contas registadas`, icon: Users, color: "text-cyan-500 bg-cyan-500/10" },
    ];

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Resumo Central do CMS"
                subtitle="Aceda e faça a gestão unificada de todos os módulos de conteúdo, catálogo e administração num só lugar."
            />

            {/* Grade de Acesso Rápido a Módulos */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                {quickCards.map(c => {
                    const Icon = c.icon;
                    return (
                        <button
                            key={c.id}
                            onClick={() => onSelectTab(c.id)}
                            className="text-left group"
                        >
                            <Card className="p-5 hover:border-primary/40 hover:shadow-md transition-all h-full flex flex-col justify-between">
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className={`p-2.5 rounded-xl ${c.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                    <h3 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                        {c.label}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                        {c.desc}
                                    </p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    Abrir módulo &rarr;
                                </span>
                            </Card>
                        </button>
                    );
                })}
            </div>

            {/* Informações do Sistema e Boas Práticas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-primary" /> Funcionalidades Consolidadas
                    </h3>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span><strong>Geração Automática de Slugs e Códigos:</strong> Todos os artigos, projetos e serviços geram slugs amigáveis em tempo real.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span><strong>Upload Integrado:</strong> Carregamento de imagens direto para a API e pré-visualização instantânea em todos os formulários.</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                            <span><strong>Segurança & Permissões:</strong> Apenas as áreas autorizadas são apresentadas a cada colaborador.</span>
                        </li>
                    </ul>
                </Card>

                <Card className="p-6 space-y-3">
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-primary" /> Importação de Catálogo
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                        Pode atualizar o catálogo completo da loja através de ficheiros Excel (.xlsx). Utilize o modelo oficial padronizado com SKUs automáticos.
                    </p>
                    <div className="pt-2">
                        <button
                            onClick={() => onSelectTab("import")}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 text-xs font-bold transition-colors"
                        >
                            Ir para Importação Excel &rarr;
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
