"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Package,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    X,
    Save,
    Loader2,
    Star,
    FileSpreadsheet
} from "lucide-react";
import { useState } from "react";
import Image from "next/image";
import ImageUpload from "@/shared/components/ImageUpload";
import BulkImportModal from "@/shared/components/BulkImportModal";

interface ProductForm {
    name: string;
    slug: string;
    description: string;
    fullDescription: string;
    price: number;
    oldPrice: number;
    image: string;
    category: string;
    brand: string;
    stock: number;
    isNew: boolean;
    isFeatured: boolean;
    specs: { label: string; value: string }[];
}

const emptyForm: ProductForm = {
    name: "",
    slug: "",
    description: "",
    fullDescription: "",
    price: 0,
    oldPrice: 0,
    image: "",
    category: "Câmeras de Segurança",
    brand: "",
    stock: 0,
    isNew: false,
    isFeatured: false,
    specs: [],
};

// Hardcoded categories removed - now fetched from Convex

import { useAuth } from "@/shared/providers/AuthProvider";

export default function AdminProductsPage() {
    const { token } = useAuth();
    const products = useQuery(api.products.getAllAdmin, token ? { token } : "skip");
    const dbCategories = useQuery(api.categories.getByType, { type: "store" });
    const dbBrands = useQuery(api.brands.getAll);
    const createProduct = useMutation(api.products.create);
    const updateProduct = useMutation(api.products.update);
    const removeProduct = useMutation(api.products.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    if (!products || !dbCategories || !dbBrands) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredProducts = products.filter(product => {
        const searchNormalized = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const nameNormalized = product.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catNormalized = product.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const brandNormalized = (product.brand || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const matchesSearch =
            nameNormalized.includes(searchNormalized) ||
            catNormalized.includes(searchNormalized) ||
            brandNormalized.includes(searchNormalized);

        const matchesCategory = categoryFilter === "all" || product.category === categoryFilter;

        return matchesSearch && matchesCategory;
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

    const handleOpenEdit = (product: typeof products[0]) => {
        setEditingId(product._id);
        setForm({
            name: product.name,
            slug: product.slug,
            description: product.description,
            fullDescription: product.fullDescription || "",
            price: product.price,
            oldPrice: product.oldPrice || 0,
            image: product.image,
            category: product.category,
            brand: product.brand || "",
            stock: product.stock,
            isNew: product.isNew,
            isFeatured: product.isFeatured || false,
            specs: (product.specs as { label: string; value: string }[]) || [],
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (editingId) {
                await updateProduct({
                    token: token!,
                    id: editingId,
                    name: form.name,
                    description: form.description,
                    fullDescription: form.fullDescription,
                    price: form.price,
                    oldPrice: form.oldPrice > 0 ? form.oldPrice : undefined,
                    image: form.image,
                    category: form.category,
                    brand: form.brand,
                    stock: form.stock,
                    isNew: form.isNew,
                    isFeatured: form.isFeatured,
                    specs: form.specs,
                });
            } else {
                await createProduct({
                    token: token!,
                    name: form.name,
                    slug: form.slug || generateSlug(form.name),
                    description: form.description,
                    fullDescription: form.fullDescription,
                    price: form.price,
                    oldPrice: form.oldPrice > 0 ? form.oldPrice : undefined,
                    image: form.image,
                    category: form.category,
                    brand: form.brand,
                    stock: form.stock,
                    isNew: form.isNew,
                    isFeatured: form.isFeatured,
                    specs: form.specs,
                });
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving product:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleToggleActive = async (product: typeof products[0]) => {
        await updateProduct({
            token: token!,
            id: product._id,
            isActive: !product.isActive,
        });
    };

    const handleDelete = async (id: Id<"products">) => {
        if (confirm("Tem certeza que deseja remover este produto?")) {
            await removeProduct({ token: token!, id });
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Produtos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie o catálogo de produtos da loja.
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        Importar em Massa
                    </button>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Produto
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{products.length}</p>
                            <p className="text-sm text-gray-500">Total de Produtos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                            <Eye className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {products.filter(p => p.isActive).length}
                            </p>
                            <p className="text-sm text-gray-500">Produtos Ativos</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Package className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {products.filter(p => p.stock < 10).length}
                            </p>
                            <p className="text-sm text-gray-500">Stock Baixo</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-[#151e32] p-4 rounded-xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 outline-none focus:border-primary"
                >
                    <option value="all">Todas as Categorias</option>
                    {dbCategories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                </select>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Produto</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Preço</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum produto encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0 relative">
                                                    {product.image ? (
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                            <Package className="w-6 h-6" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white">{product.name}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900 dark:text-white">
                                                KZ {product.price.toLocaleString('pt-AO')}
                                            </p>
                                            {product.oldPrice && product.oldPrice > 0 && (
                                                <p className="text-xs text-gray-400 line-through">
                                                    KZ {product.oldPrice.toLocaleString('pt-AO')}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${product.stock < 10 ? 'text-red-500' : 'text-gray-900 dark:text-white'}`}>
                                                {product.stock}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleToggleActive(product)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${product.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                                    }`}
                                            >
                                                {product.isActive ? (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Ativo
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        Inativo
                                                    </>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(product)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
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
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Editar Produto' : 'Novo Produto'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Nome do Produto *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value, slug: generateSlug(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Ex: Whey Protein Premium"
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
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="whey-protein-premium"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição Curta *
                                </label>
                                <input
                                    type="text"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Uma breve descrição do produto"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição Completa
                                </label>
                                <textarea
                                    value={form.fullDescription}
                                    onChange={(e) => setForm({ ...form, fullDescription: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                    placeholder="Descrição detalhada do produto..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Preço (KZ) *
                                    </label>
                                    <input
                                        type="number"
                                        value={form.price}
                                        onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Preço Antigo (KZ)
                                    </label>
                                    <input
                                        type="number"
                                        value={form.oldPrice}
                                        onChange={(e) => setForm({ ...form, oldPrice: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Stock *
                                    </label>
                                    <input
                                        type="number"
                                        value={form.stock}
                                        onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="0"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <ImageUpload
                                    label="Imagem do Produto *"
                                    value={form.image}
                                    onChange={(url) => setForm({ ...form, image: url })}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Categoria *
                                    </label>
                                    <select
                                        value={form.category}
                                        onChange={(e) => setForm({ ...form, category: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    >
                                        <option value="">Selecione uma categoria</option>
                                        {dbCategories.map(cat => (
                                            <option key={cat._id} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Marca
                                    </label>
                                    <select
                                        value={form.brand}
                                        onChange={(e) => setForm({ ...form, brand: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    >
                                        <option value="">Selecione uma marca</option>
                                        {dbBrands.map(brand => (
                                            <option key={brand._id} value={brand.name}>{brand.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isNew"
                                    checked={form.isNew}
                                    onChange={(e) => setForm({ ...form, isNew: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isNew" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Marcar como Novo
                                </label>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={form.isFeatured}
                                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                                />
                                <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                    Produto em Destaque (Home)
                                </label>
                            </div>

                            <div className="border-t border-gray-200 dark:border-white/5 pt-6">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
                                        Especificações Técnicas
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setForm({ ...form, specs: [...form.specs, { label: "", value: "" }] })}
                                        className="text-primary hover:text-primary-dark text-xs font-bold flex items-center gap-1"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        Adicionar Linha
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {form.specs.length === 0 ? (
                                        <p className="text-sm text-gray-500 italic">Nenhuma especificação adicionada.</p>
                                    ) : (
                                        form.specs.map((spec, index) => (
                                            <div key={index} className="flex gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Rótulo (ex: Peso)"
                                                    value={spec.label}
                                                    onChange={(e) => {
                                                        const newSpecs = [...form.specs];
                                                        newSpecs[index].label = e.target.value;
                                                        setForm({ ...form, specs: newSpecs });
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm outline-none"
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Valor (ex: 500g)"
                                                    value={spec.value}
                                                    onChange={(e) => {
                                                        const newSpecs = [...form.specs];
                                                        newSpecs[index].value = e.target.value;
                                                        setForm({ ...form, specs: newSpecs });
                                                    }}
                                                    className="flex-1 px-3 py-2 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-sm outline-none"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        const newSpecs = form.specs.filter((_, i) => i !== index);
                                                        setForm({ ...form, specs: newSpecs });
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
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
                                disabled={isSaving || !form.name || !form.description || !form.image || form.price <= 0}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {editingId ? 'Atualizar' : 'Criar Produto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            <BulkImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="products"
            />
        </div>
    );
}
