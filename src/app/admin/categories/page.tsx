"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Settings,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    Eye,
    EyeOff,
    Search
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";

interface CategoryForm {
    name: string;
    slug: string;
    type: string;
    description: string;
    order: number;
    isActive: boolean;
}

const emptyForm: CategoryForm = {
    name: "",
    slug: "",
    type: "store",
    description: "",
    order: 0,
    isActive: true,
};

const types = [
    { label: "Loja", value: "store" },
    { label: "Blog", value: "blog" },
    { label: "Portfólio", value: "portfolio" }
];

export default function AdminCategoriesPage() {
    const { token } = useAuth();
    const categories = useQuery(api.categories.getAllAdmin, token ? { token } : "skip");
    const createCategory = useMutation(api.categories.create);
    const updateCategory = useMutation(api.categories.update);
    const removeCategory = useMutation(api.categories.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"categories"> | null>(null);
    const [form, setForm] = useState<CategoryForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    if (!categories) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === "all" || cat.type === typeFilter;
        return matchesSearch && matchesType;
    });

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");
    };

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm(emptyForm);
        setIsModalOpen(true);
    };

    const handleOpenEdit = (cat: typeof categories[0]) => {
        setEditingId(cat._id);
        setForm({
            name: cat.name,
            slug: cat.slug,
            type: cat.type,
            description: cat.description || "",
            order: cat.order,
            isActive: cat.isActive,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (editingId) {
                await updateCategory({
                    token: token!,
                    id: editingId,
                    ...form
                });
            } else {
                await createCategory({
                    token: token!,
                    ...form,
                    slug: form.slug || generateSlug(form.name)
                });
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving category:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: Id<"categories">) => {
        if (confirm("Tem certeza que deseja apagar esta categoria?")) {
            await removeCategory({ token: token!, id });
        }
    };

    const toggleActive = async (cat: typeof categories[0]) => {
        await updateCategory({
            token: token!,
            id: cat._id,
            isActive: !cat.isActive
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Categorias
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie as categorias dos produtos, blog e portfólio.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5" />
                    Nova Categoria
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#151e32] p-4 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar categorias..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none transition-all"
                    />
                </div>
                <select
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-primary"
                >
                    <option value="all">Todos os Tipos</option>
                    {types.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                </select>
            </div>

            {/* Categories Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Nome</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Ordem</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma categoria encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{cat.name}</p>
                                            <p className="text-xs text-gray-500">{cat.slug}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary">
                                                {types.find(t => t.value === cat.type)?.label || cat.type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                            {cat.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(cat)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${cat.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                            >
                                                {cat.isActive ? (
                                                    <><Eye className="w-3.5 h-3.5" /> Ativa</>
                                                ) : (
                                                    <><EyeOff className="w-3.5 h-3.5" /> Inativa</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(cat)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(cat._id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-lg shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Editar Categoria' : 'Nova Categoria'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Nome da Categoria *
                                </label>
                                <input
                                    type="text"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    placeholder="Ex: Hardware"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Slug
                                </label>
                                <input
                                    type="text"
                                    value={form.slug}
                                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Tipo *
                                </label>
                                <select
                                    value={form.type}
                                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                >
                                    {types.map(t => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Ordem
                                </label>
                                <input
                                    type="number"
                                    value={form.order}
                                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                />
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={form.isActive}
                                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Categoria Ativa
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.name}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {editingId ? 'Atualizar' : 'Criar Categoria'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
