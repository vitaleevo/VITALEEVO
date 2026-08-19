"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import {
    AdminHeader, Card, Modal, Field, Select, TextArea, Badge, Loading, ErrorBox, Empty,
    Table, Td, inputClass, ImageUpload,
} from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { formatCurrency } from "@/shared/utils/format";

const STATUSES = ["published", "draft", "archived"];

export default function AdminProductsPage() {
    const { token } = useAuth();
    const { data: products, isLoading, error, refetch } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.products.list({ page_size: 100, ordering: "-created_at" }).then(d => d.results),
    });
    const { data: categories } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.categories.getByType("store") });
    const { data: brands } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.brands.list() });

    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleting, setDeleting] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const storeCategories = useMemo(() => (categories || []).filter((c: any) => !c.parent), [categories]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return products || [];
        return (products || []).filter((p: any) =>
            `${p.name} ${p.sku} ${p.category ?? ""}`.toLowerCase().includes(q)
        );
    }, [products, search]);

    const openNew = () => { setEditing(null); setIsOpen(true); };
    const openEdit = (p: any) => { setEditing(p); setIsOpen(true); };

    const handleSave = async (form: Record<string, any>) => {
        if (!token) return;
        setSaving(true);
        try {
            if (editing?.slug) {
                await api.products.update(editing.slug, form, token);
                toast.success("Produto atualizado");
            } else {
                await api.products.create(form, token);
                toast.success("Produto criado");
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
            toast.success("Produto removido");
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao remover produto");
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader
                title="Produtos"
                subtitle={`${products?.length ?? 0} produtos no catálogo`}
                action={
                    <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                        <Plus className="w-4 h-4" /> Novo Produto
                    </button>
                }
            />

            <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar por nome, SKU ou categoria..."
                    className={`${inputClass} pl-10`}
                />
            </div>

            <Table headers={["Produto", "SKU", "Categoria", "Preço", "Stock", "Estado", "Ações"]}>
                {filtered.map((p: any) => (
                    <tr key={p.id}>
                        <Td>
                            <div className="flex items-center gap-3">
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0f172a] shrink-0">
                                    {p.image && <Image src={p.image} alt="" fill className="object-cover" unoptimized />}
                                </div>
                                <span className="font-bold text-gray-900 dark:text-white">{p.name}</span>
                            </div>
                        </Td>
                        <Td className="font-mono text-xs">{p.sku || "—"}</Td>
                        <Td>{p.category || "—"}</Td>
                        <Td className="font-bold">{formatCurrency(Number(p.price ?? 0))}</Td>
                        <Td>{p.stock ?? 0}</Td>
                        <Td><Badge value={p.status} /></Td>
                        <Td>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleting(p)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Td>
                    </tr>
                ))}
                {!filtered.length && (
                    <tr><td colSpan={7}><Empty label={search ? "Sem resultados" : "Sem produtos"} /></td></tr>
                )}
            </Table>

            <ProductForm
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                product={editing}
                categories={storeCategories}
                brands={brands || []}
                onSave={handleSave}
                saving={saving}
            />

            <DeleteDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Remover Produto"
                description={`Tem certeza que deseja remover "${deleting?.name}"? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
}

function ProductForm({ isOpen, onClose, product, categories, brands, onSave, saving }: {
    isOpen: boolean;
    onClose: () => void;
    product: any | null;
    categories: any[];
    brands: any[];
    onSave: (form: Record<string, any>) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState<Record<string, any>>(() => ({
        name: product?.name ?? "",
        slug: product?.slug ?? "",
        sku: product?.sku ?? "",
        description: product?.description ?? "",
        full_description: product?.fullDescription ?? product?.full_description ?? "",
        price: product?.price ?? "",
        old_price: product?.oldPrice ?? "",
        stock: product?.stock ?? 0,
        image: product?.image ?? "",
        category: product?.category ?? "",
        subcategory: product?.subcategory ?? "",
        brand: product?.brand ?? "",
        status: product?.status ?? "published",
        is_featured: Boolean(product?.isFeatured ?? product?.is_featured ?? false),
        is_new: Boolean(product?.isNew ?? product?.is_new ?? false),
    }));
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const subs = useMemo(() => (categories || []).filter((c: any) => c.parent === form.category), [categories, form.category]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={product ? "Editar Produto" : "Novo Produto"} wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Nome" required>
                    <input className={inputClass} value={form.name} onChange={e => set("name", e.target.value)} required />
                </Field>
                <Field label="Slug">
                    <input className={inputClass} value={form.slug} onChange={e => set("slug", e.target.value)} placeholder="auto a partir do nome" />
                </Field>
                <Field label="SKU">
                    <input className={inputClass} value={form.sku} onChange={e => set("sku", e.target.value)} />
                </Field>
                <Field label="Preço (Kz)" required>
                    <input type="number" step="0.01" min="0" className={inputClass} value={form.price} onChange={e => set("price", e.target.value)} required />
                </Field>
                <Field label="Preço antigo (Kz)">
                    <input type="number" step="0.01" min="0" className={inputClass} value={form.old_price} onChange={e => set("old_price", e.target.value)} />
                </Field>
                <Field label="Stock">
                    <input type="number" min="0" className={inputClass} value={form.stock} onChange={e => set("stock", Number(e.target.value))} />
                </Field>
                <Field label="Categoria">
                    <Select value={form.category} onChange={e => { set("category", e.target.value); set("subcategory", ""); }}>
                        <option value="">—</option>
                        {categories.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                </Field>
                <Field label="Subcategoria">
                    <Select value={form.subcategory} onChange={e => set("subcategory", e.target.value)}>
                        <option value="">—</option>
                        {subs.map((c: any) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                    </Select>
                </Field>
                <Field label="Marca">
                    <Select value={form.brand} onChange={e => set("brand", e.target.value)}>
                        <option value="">—</option>
                        {brands.map((b: any) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
                    </Select>
                </Field>
                <Field label="Estado">
                    <Select value={form.status} onChange={e => set("status", e.target.value)}>
                        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>
                </Field>
                <div className="md:col-span-2">
                    <Field label="Descrição" required>
                        <TextArea value={form.description} onChange={e => set("description", e.target.value)} required />
                    </Field>
                </div>
                <div className="md:col-span-2">
                    <Field label="Imagem">
                        <ImageUpload value={form.image} onChange={url => set("image", url)} />
                    </Field>
                </div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={form.is_featured} onChange={e => set("is_featured", e.target.checked)} className="rounded accent-primary" />
                    Destaque na loja
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                    <input type="checkbox" checked={form.is_new} onChange={e => set("is_new", e.target.checked)} className="rounded accent-primary" />
                    Novidade
                </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Cancelar
                </button>
                <button
                    disabled={saving || !form.name || !form.price}
                    onClick={() => onSave(form)}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                    {saving ? "A guardar..." : "Guardar"}
                </button>
            </div>
        </Modal>
    );
}