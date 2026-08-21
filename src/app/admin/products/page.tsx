"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Filter,
    RotateCcw,
    Package,
    CheckCircle,
    AlertTriangle,
    XCircle,
    Banknote,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    Tag,
    Star,
    Layers,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import {
    AdminHeader,
    Card,
    Modal,
    Field,
    Select,
    TextArea,
    Badge,
    Loading,
    ErrorBox,
    Empty,
    inputClass,
    ImageUpload,
} from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { PermissionGuard, useCapability } from "@/shared/components/admin/PermissionGuard";
import { formatCurrency } from "@/shared/utils/format";

const STATUSES = [
    { value: "published", label: "Publicado" },
    { value: "draft", label: "Rascunho" },
    { value: "archived", label: "Arquivado" },
];

export default function AdminProductsPage() {
    return (
        <PermissionGuard permission="catalog:read">
            <AdminProductsContent />
        </PermissionGuard>
    );
}

function AdminProductsContent() {
    const { token } = useAuth();
    const canManage = useCapability("catalog:manage");

    const { data: products, isLoading, error, refetch } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.products.list({ page_size: 200, ordering: "-created_at" }, token).then(d => d.results),
    });
    const { data: categories } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.categories.getByType("store"),
    });
    const { data: brands } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.brands.list(),
    });

    // Filtros
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [brandFilter, setBrandFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [stockFilter, setStockFilter] = useState<"all" | "in_stock" | "low_stock" | "out_of_stock">("all");
    const [featureFilter, setFeatureFilter] = useState<"all" | "featured" | "new">("all");
    const [sortBy, setSortBy] = useState("newest");
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);

    // Modais
    const [editing, setEditing] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleting, setDeleting] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const storeCategories = useMemo(() => (categories || []).filter((c: any) => !c.parent), [categories]);

    // Estatísticas / KPIs
    const stats = useMemo(() => {
        const list = products || [];
        const total = list.length;
        let inStock = 0;
        let lowStock = 0;
        let outOfStock = 0;
        let totalValue = 0;

        for (const p of list) {
            const stock = Number(p.stock ?? 0);
            const price = Number(p.price ?? 0);
            totalValue += price * stock;

            if (stock > 5) {
                inStock++;
            } else if (stock > 0) {
                lowStock++;
            } else {
                outOfStock++;
            }
        }

        return { total, inStock, lowStock, outOfStock, totalValue };
    }, [products]);

    // Filtragem e Ordenação
    const filteredProducts = useMemo(() => {
        let result = products || [];

        // Pesquisa de texto
        const q = search.trim().toLowerCase();
        if (q) {
            result = result.filter((p: any) =>
                `${p.name} ${p.sku ?? ""} ${p.category ?? ""} ${p.brand ?? ""} ${p.description ?? ""}`
                    .toLowerCase()
                    .includes(q)
            );
        }

        // Filtro de Categoria
        if (categoryFilter) {
            result = result.filter((p: any) => p.category === categoryFilter || p.subcategory === categoryFilter);
        }

        // Filtro de Marca
        if (brandFilter) {
            result = result.filter((p: any) => p.brand === brandFilter);
        }

        // Filtro de Estado
        if (statusFilter) {
            result = result.filter((p: any) => p.status === statusFilter);
        }

        // Filtro de Stock
        if (stockFilter === "in_stock") {
            result = result.filter((p: any) => Number(p.stock ?? 0) > 5);
        } else if (stockFilter === "low_stock") {
            result = result.filter((p: any) => {
                const s = Number(p.stock ?? 0);
                return s > 0 && s <= 5;
            });
        } else if (stockFilter === "out_of_stock") {
            result = result.filter((p: any) => Number(p.stock ?? 0) === 0);
        }

        // Filtro de Destaques / Novidades
        if (featureFilter === "featured") {
            result = result.filter((p: any) => Boolean(p.isFeatured || p.is_featured));
        } else if (featureFilter === "new") {
            result = result.filter((p: any) => Boolean(p.isNew || p.is_new));
        }

        // Ordenação
        const sorted = [...result];
        switch (sortBy) {
            case "name_asc":
                sorted.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "name_desc":
                sorted.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            case "price_asc":
                sorted.sort((a, b) => Number(a.price ?? 0) - Number(b.price ?? 0));
                break;
            case "price_desc":
                sorted.sort((a, b) => Number(b.price ?? 0) - Number(a.price ?? 0));
                break;
            case "stock_asc":
                sorted.sort((a, b) => Number(a.stock ?? 0) - Number(b.stock ?? 0));
                break;
            case "stock_desc":
                sorted.sort((a, b) => Number(b.stock ?? 0) - Number(a.stock ?? 0));
                break;
            case "newest":
            default:
                sorted.sort((a, b) => new Date(b.createdAt || b.created_at || 0).getTime() - new Date(a.createdAt || a.created_at || 0).getTime());
                break;
        }

        return sorted;
    }, [products, search, categoryFilter, brandFilter, statusFilter, stockFilter, featureFilter, sortBy]);

    // Paginação
    const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
    const paginatedProducts = useMemo(() => {
        const start = (currentPage - 1) * pageSize;
        return filteredProducts.slice(start, start + pageSize);
    }, [filteredProducts, currentPage, pageSize]);

    const hasActiveFilters = Boolean(
        search || categoryFilter || brandFilter || statusFilter || stockFilter !== "all" || featureFilter !== "all" || sortBy !== "newest"
    );

    const resetFilters = () => {
        setSearch("");
        setCategoryFilter("");
        setBrandFilter("");
        setStatusFilter("");
        setStockFilter("all");
        setFeatureFilter("all");
        setSortBy("newest");
        setCurrentPage(1);
    };

    const openNew = () => {
        setEditing(null);
        setIsOpen(true);
    };

    const openEdit = (p: any) => {
        setEditing(p);
        setIsOpen(true);
    };

    const handleSave = async (form: Record<string, any>) => {
        if (!token) return;
        setSaving(true);
        try {
            if (editing?.slug) {
                await api.products.update(editing.slug, form, token);
                toast.success("Produto atualizado com sucesso");
            } else {
                await api.products.create(form, token);
                toast.success("Produto criado com sucesso");
            }
            setIsOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao guardar produto");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleting) return;
        try {
            await api.products.remove(deleting.slug, token);
            toast.success("Produto removido com sucesso");
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao remover produto");
        }
    };

    if (isLoading) return <Loading label="A carregar produtos do catálogo..." />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div className="space-y-6">
            {/* Cabeçalho */}
            <AdminHeader
                title="Gestão de Produtos"
                subtitle={`${products?.length ?? 0} artigos registados no catálogo comercial`}
                action={
                    canManage ? (
                        <button
                            onClick={openNew}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-all shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Novo Produto
                        </button>
                    ) : null
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-gray-900 dark:text-white">{stats.total}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Total Catálogo</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-emerald-600 dark:text-emerald-400">{stats.inStock}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Em Stock (&gt;5)</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                        <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-amber-600 dark:text-amber-400">{stats.lowStock}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Stock Baixo (1-5)</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
                        <XCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-xl font-black text-red-600 dark:text-red-400">{stats.outOfStock}</p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Esgotados</p>
                    </div>
                </Card>

                <Card className="p-4 flex items-center gap-3 col-span-2 lg:col-span-1">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                        <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                            {formatCurrency(stats.totalValue)}
                        </p>
                        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Valor em Stock</p>
                    </div>
                </Card>
            </div>

            {/* Painel de Filtros Avançados */}
            <Card className="p-4 space-y-3">
                <div className="flex flex-col lg:flex-row gap-3">
                    {/* Pesquisa */}
                    <div className="relative flex-1">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
                            placeholder="Pesquisar por nome, SKU, categoria, marca..."
                            className={`${inputClass} pl-10 h-10 text-sm`}
                        />
                    </div>

                    {/* Categoria */}
                    <div className="w-full lg:w-48">
                        <Select
                            value={categoryFilter}
                            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 text-sm"
                        >
                            <option value="">Todas as Categorias</option>
                            {storeCategories.map((c: any) => (
                                <option key={c.slug} value={c.name}>{c.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Marca */}
                    <div className="w-full lg:w-40">
                        <Select
                            value={brandFilter}
                            onChange={e => { setBrandFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 text-sm"
                        >
                            <option value="">Todas as Marcas</option>
                            {(brands || []).map((b: any) => (
                                <option key={b.slug} value={b.name}>{b.name}</option>
                            ))}
                        </Select>
                    </div>

                    {/* Estado */}
                    <div className="w-full lg:w-36">
                        <Select
                            value={statusFilter}
                            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="h-10 text-sm"
                        >
                            <option value="">Todos Estados</option>
                            {STATUSES.map(s => (
                                <option key={s.value} value={s.value}>{s.label}</option>
                            ))}
                        </Select>
                    </div>
                </div>

                {/* Sub-linha de filtros rápidos */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 dark:border-white/5 text-xs">
                    <div className="flex flex-wrap items-center gap-2">
                        {/* Stock pills */}
                        <div className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            {[
                                { id: "all", label: "Stock: Todos" },
                                { id: "in_stock", label: "Em Stock (>5)" },
                                { id: "low_stock", label: "Baixo (1-5)" },
                                { id: "out_of_stock", label: "Esgotado (0)" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => { setStockFilter(tab.id as any); setCurrentPage(1); }}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                                        stockFilter === tab.id
                                            ? "bg-white dark:bg-[#151e32] text-primary shadow-xs"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {/* Destaques / Novidades */}
                        <div className="inline-flex rounded-lg p-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                            {[
                                { id: "all", label: "Todos" },
                                { id: "featured", label: "⭐ Destaques" },
                                { id: "new", label: "✨ Novidades" },
                            ].map(tab => (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => { setFeatureFilter(tab.id as any); setCurrentPage(1); }}
                                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                                        featureFilter === tab.id
                                            ? "bg-white dark:bg-[#151e32] text-primary shadow-xs"
                                            : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 ml-auto">
                        {/* Ordenação */}
                        <div className="flex items-center gap-1.5">
                            <span className="text-gray-400 font-medium">Ordenar:</span>
                            <Select
                                value={sortBy}
                                onChange={e => setSortBy(e.target.value)}
                                className="h-8 text-xs py-1"
                            >
                                <option value="newest">Mais Recentes</option>
                                <option value="name_asc">Nome (A → Z)</option>
                                <option value="name_desc">Nome (Z → A)</option>
                                <option value="price_asc">Menor Preço</option>
                                <option value="price_desc">Maior Preço</option>
                                <option value="stock_asc">Menor Stock</option>
                                <option value="stock_desc">Maior Stock</option>
                            </Select>
                        </div>

                        {/* Botão limpar filtros */}
                        {hasActiveFilters && (
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-red-500 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" /> Limpar Filtros
                            </button>
                        )}
                    </div>
                </div>
            </Card>

            {/* Tabela de Produtos */}
            <Card className="overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                        {filteredProducts.length} produto(s) encontrado(s)
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>Mostrar:</span>
                        <select
                            value={pageSize}
                            onChange={e => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                            className="bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg px-2 py-1 text-xs outline-none"
                        >
                            <option value={10}>10 por página</option>
                            <option value={25}>25 por página</option>
                            <option value={50}>50 por página</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02] text-xs font-bold uppercase tracking-wider text-gray-400">
                                <th className="px-6 py-3.5">Produto</th>
                                <th className="px-4 py-3.5">SKU</th>
                                <th className="px-4 py-3.5">Categoria / Marca</th>
                                <th className="px-4 py-3.5 text-right">Preço</th>
                                <th className="px-4 py-3.5 text-center">Stock</th>
                                <th className="px-4 py-3.5 text-center">Estado</th>
                                {canManage && <th className="px-6 py-3.5 text-right">Ações</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {paginatedProducts.map((p: any) => {
                                const stock = Number(p.stock ?? 0);
                                const price = Number(p.price ?? 0);
                                const oldPrice = Number(p.oldPrice ?? p.old_price ?? 0);
                                const hasDiscount = oldPrice > price;

                                return (
                                    <tr key={p.id} className="hover:bg-gray-50/60 dark:hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-3.5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-12 w-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 shrink-0">
                                                    {p.image ? (
                                                        /* eslint-disable-next-line @next/next/no-img-element */
                                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-gray-900 dark:text-white truncate max-w-xs" title={p.name}>
                                                        {p.name}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        {p.isFeatured || p.is_featured ? (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded">
                                                                <Star className="w-2.5 h-2.5 fill-amber-500" /> Destaque
                                                            </span>
                                                        ) : null}
                                                        {p.isNew || p.is_new ? (
                                                            <span className="inline-flex items-center gap-0.5 text-[10px] font-black text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded">
                                                                <Sparkles className="w-2.5 h-2.5" /> Novidade
                                                            </span>
                                                        ) : null}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                                                {p.sku || "—"}
                                            </span>
                                        </td>

                                        <td className="px-4 py-3.5">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-xs">{p.category || "—"}</p>
                                                {p.brand && <p className="text-[11px] text-gray-400 mt-0.5">{p.brand}</p>}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-right font-bold text-gray-900 dark:text-white">
                                            <div>
                                                <span>{formatCurrency(price)}</span>
                                                {hasDiscount && (
                                                    <p className="text-[11px] text-gray-400 line-through font-normal">
                                                        {formatCurrency(oldPrice)}
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            {stock > 5 ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                                    {stock} un.
                                                </span>
                                            ) : stock > 0 ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                                    {stock} un. (Baixo)
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 px-2.5 py-1 rounded-full">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                    Esgotado
                                                </span>
                                            )}
                                        </td>

                                        <td className="px-4 py-3.5 text-center">
                                            <Badge value={p.status} />
                                        </td>

                                        {canManage && (
                                            <td className="px-6 py-3.5 text-right">
                                                <div className="flex items-center justify-end gap-1">
                                                    <button
                                                        onClick={() => openEdit(p)}
                                                        title="Editar produto"
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors"
                                                    >
                                                        <Pencil className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleting(p)}
                                                        title="Remover produto"
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                );
                            })}

                            {!paginatedProducts.length && (
                                <tr>
                                    <td colSpan={canManage ? 7 : 6} className="py-12 text-center">
                                        <Empty label={hasActiveFilters ? "Nenhum produto corresponde aos filtros aplicados" : "Nenhum produto cadastrado no catálogo"} />
                                        {hasActiveFilters && (
                                            <button
                                                onClick={resetFilters}
                                                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline"
                                            >
                                                <RotateCcw className="w-3.5 h-3.5" /> Limpar Filtros
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Paginação Footer */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <p className="text-xs text-gray-500">
                            Página <span className="font-bold text-gray-900 dark:text-white">{currentPage}</span> de <span className="font-bold text-gray-900 dark:text-white">{totalPages}</span>
                        </p>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <div className="flex items-center gap-1 px-2">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((page, idx, arr) => (
                                        <React.Fragment key={page}>
                                            {idx > 0 && arr[idx - 1] !== page - 1 && (
                                                <span className="text-xs text-gray-400">...</span>
                                            )}
                                            <button
                                                onClick={() => setCurrentPage(page)}
                                                className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                                                    currentPage === page
                                                        ? "bg-primary text-white"
                                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5"
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1.5 rounded-lg border border-gray-200 dark:border-white/10 text-gray-500 hover:bg-gray-100 dark:hover:bg-white/5 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </Card>

            {/* Modal de Criação / Edição */}
            <ProductForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                product={editing}
                categories={storeCategories}
                brands={brands || []}
                onSave={handleSave}
                saving={saving}
            />

            {/* Dialog de Confirmação para Remover */}
            <DeleteDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Remover Produto"
                description={`Tem a certeza de que deseja remover o produto "${deleting?.name}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
}

const getInitialProductForm = (product: any | null) => ({
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    sku: product?.sku ?? "",
    description: product?.description ?? "",
    full_description: product?.fullDescription ?? product?.full_description ?? "",
    price: product?.price ?? "",
    old_price: product?.oldPrice ?? product?.old_price ?? "",
    stock: product?.stock ?? 0,
    image: product?.image ?? "",
    category: product?.category ?? "",
    subcategory: product?.subcategory ?? "",
    brand: product?.brand ?? "",
    status: product?.status ?? "published",
    is_featured: Boolean(product?.isFeatured ?? product?.is_featured ?? false),
    is_new: Boolean(product?.isNew ?? product?.is_new ?? false),
});

function ProductForm({
    isOpen,
    onClose,
    product,
    categories,
    brands,
    onSave,
    saving,
}: {
    isOpen: boolean;
    onClose: () => void;
    product: any | null;
    categories: any[];
    brands: any[];
    onSave: (form: Record<string, any>) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState<Record<string, any>>(() => getInitialProductForm(product));

    useEffect(() => {
        if (isOpen) {
            setForm(getInitialProductForm(product));
        }
    }, [isOpen, product]);

    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const generateSku = (categoryName?: string) => {
        const prefix = categoryName && categoryName.length >= 3
            ? categoryName.slice(0, 3).toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^A-Z]/g, "PRD")
            : "PRD";
        const randomNum = Math.floor(10000 + Math.random() * 90000);
        return `${prefix}-${randomNum}`;
    };

    const handleNameChange = (name: string) => {
        set("name", name);
        if (!product) {
            // auto slug
            const autoSlug = name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/(^-|-$)/g, "");
            set("slug", autoSlug);

            // auto sku if empty
            if (!form.sku) {
                set("sku", generateSku(form.category));
            }
        }
    };

    const subs = useMemo(() => (categories || []).filter((c: any) => c.parent === form.category), [categories, form.category]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? "Editar Produto" : "Novo Produto no Catálogo"} wide>
            <div className="space-y-6">
                {/* 1. Informações Básicas */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Package className="w-3.5 h-3.5" /> Informações Básicas
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Nome do Produto" required>
                            <input
                                className={inputClass}
                                value={form.name ?? ""}
                                onChange={e => handleNameChange(e.target.value)}
                                required
                                placeholder="ex: Portátil Dell Inspiron 15"
                            />
                        </Field>

                        <Field label="Slug URL (automático)">
                            <div className="flex gap-2">
                                <input
                                    className={inputClass}
                                    value={form.slug ?? ""}
                                    onChange={e => set("slug", e.target.value)}
                                    placeholder="portatil-dell-inspiron-15"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (form.name) {
                                            const s = form.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                                            set("slug", s);
                                        }
                                    }}
                                    title="Regerar Slug"
                                    className="px-3 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-primary/10 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-xs font-bold shrink-0"
                                >
                                    Auto
                                </button>
                            </div>
                        </Field>

                        <Field label="Código SKU *" required>
                            <div className="flex gap-2">
                                <input
                                    className={`${inputClass} font-mono`}
                                    value={form.sku ?? ""}
                                    onChange={e => set("sku", e.target.value.toUpperCase())}
                                    required
                                    placeholder="ex: INF-12345"
                                />
                                <button
                                    type="button"
                                    onClick={() => set("sku", generateSku(form.category))}
                                    className="px-3 rounded-xl bg-primary/10 hover:bg-primary/20 text-primary transition-colors text-xs font-bold shrink-0 flex items-center gap-1"
                                >
                                    <Sparkles className="w-3.5 h-3.5" /> Gerar
                                </button>
                            </div>
                        </Field>

                        <Field label="Estado de Publicação">
                            <Select value={form.status ?? "published"} onChange={e => set("status", e.target.value)}>
                                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Select>
                        </Field>
                    </div>
                </div>

                {/* 2. Preço & Stock */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Banknote className="w-3.5 h-3.5" /> Preços e Inventário
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Preço de Venda (Kz)" required>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={inputClass}
                                value={form.price ?? ""}
                                onChange={e => set("price", e.target.value)}
                                required
                                placeholder="0.00"
                            />
                        </Field>

                        <Field label="Preço Antigo / Riscado (Kz)">
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                className={inputClass}
                                value={form.old_price ?? ""}
                                onChange={e => set("old_price", e.target.value)}
                                placeholder="opcional para promoção"
                            />
                        </Field>

                        <Field label="Quantidade em Stock" required>
                            <input
                                type="number"
                                min="0"
                                className={inputClass}
                                value={form.stock ?? 0}
                                onChange={e => set("stock", Number(e.target.value))}
                                required
                            />
                        </Field>
                    </div>
                </div>

                {/* 3. Classificação */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5" /> Categorização e Marca
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Field label="Categoria Principal">
                            <Select
                                value={form.category ?? ""}
                                onChange={e => { set("category", e.target.value); set("subcategory", ""); }}
                            >
                                <option value="">— Selecionar —</option>
                                {categories.map((c: any) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                            </Select>
                        </Field>

                        <Field label="Subcategoria">
                            <Select
                                value={form.subcategory ?? ""}
                                onChange={e => set("subcategory", e.target.value)}
                            >
                                <option value="">— Nenhuma —</option>
                                {subs.map((c: any) => <option key={c.slug} value={c.name}>{c.name}</option>)}
                            </Select>
                        </Field>

                        <Field label="Marca / Fabricante">
                            <Select value={form.brand ?? ""} onChange={e => set("brand", e.target.value)}>
                                <option value="">— Selecionar —</option>
                                {brands.map((b: any) => <option key={b.slug} value={b.name}>{b.name}</option>)}
                            </Select>
                        </Field>
                    </div>
                </div>

                {/* 4. Mídia e Descrição */}
                <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-white/5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Mídia e Apresentação
                    </h4>
                    <div className="space-y-4">
                        <Field label="Imagem do Produto">
                            <ImageUpload value={form.image ?? ""} onChange={url => set("image", url)} />
                        </Field>

                        <Field label="Descrição Curta" required>
                            <TextArea
                                value={form.description ?? ""}
                                onChange={e => set("description", e.target.value)}
                                required
                                rows={3}
                                placeholder="Resumo do produto para a loja..."
                            />
                        </Field>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <label className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.is_featured)}
                                    onChange={e => set("is_featured", e.target.checked)}
                                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                                />
                                <span>⭐ Destacar na Página Inicial</span>
                            </label>

                            <label className="flex items-center gap-2.5 text-xs font-bold text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={Boolean(form.is_new)}
                                    onChange={e => set("is_new", e.target.checked)}
                                    className="rounded accent-primary w-4 h-4 cursor-pointer"
                                />
                                <span>✨ Marcar como Novidade</span>
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-white/5">
                <button
                    onClick={onClose}
                    type="button"
                    className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    disabled={saving || !form.name || !form.sku || form.price === ""}
                    onClick={() => onSave(form)}
                    type="button"
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                >
                    {saving ? "A guardar..." : "Guardar Produto"}
                </button>
            </div>
        </Modal>
    );
}