"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    FileText,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    X,
    Save,
    Loader2,
    User,
    Settings,
    Star,
    FileSpreadsheet
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/shared/utils/format";
import ImageUpload from "@/shared/components/ImageUpload";
import RichTextEditor from "@/shared/components/RichTextEditor";
import BulkImportModal from "@/shared/components/BulkImportModal";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { useAuth } from "@/shared/providers/AuthProvider";

interface ArticleForm {
    title: string;
    slug: string;
    category: string;
    excerpt: string;
    content: string;
    image: string;
    author: string;
    authorRole: string;
    authorImage: string;
    readTime: string;
    isPublished: boolean;
    isFeatured: boolean;
}

const emptyForm: ArticleForm = {
    title: "",
    slug: "",
    category: "Saúde",
    excerpt: "",
    content: "",
    image: "",
    author: "Equipe Vitaleevo",
    authorRole: "Especialista",
    authorImage: "",
    readTime: "5 min",
    isPublished: false,
    isFeatured: false,
};

// Hardcoded categories removed - now fetched from Convex

export default function AdminBlogPage() {
    const { token } = useAuth();
    const articles = useQuery(api.articles.getAllAdmin, token ? { token } : "skip");
    const dbCategories = useQuery(api.categories.getByType, { type: "blog" });
    const createArticle = useMutation(api.articles.create);
    const updateArticle = useMutation(api.articles.update);
    const removeArticle = useMutation(api.articles.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"articles"> | null>(null);
    const [form, setForm] = useState<ArticleForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);

    // Delete Dialog State
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<Id<"articles"> | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    if (!articles || !dbCategories) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredArticles = articles.filter(article => {
        const searchNormalized = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const titleNormalized = article.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catNormalized = article.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        return titleNormalized.includes(searchNormalized) || catNormalized.includes(searchNormalized);
    });

    const generateSlug = (title: string) => {
        return title
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

    const handleOpenEdit = (article: typeof articles[0]) => {
        setEditingId(article._id);
        setForm({
            title: article.title,
            slug: article.slug,
            category: article.category,
            excerpt: article.excerpt,
            content: article.content,
            image: article.image,
            author: article.author,
            authorRole: article.authorRole || "",
            authorImage: article.authorImage || "",
            readTime: article.readTime,
            isPublished: article.isPublished,
            isFeatured: article.isFeatured || false,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            if (editingId) {
                await updateArticle({
                    token: token!,
                    id: editingId,
                    ...form
                });
            } else {
                await createArticle({
                    token: token!,
                    ...form,
                    slug: form.slug || generateSlug(form.title)
                });
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving article:", error);
        } finally {
            setIsSaving(false);
        }
    };

    // Open Delete Confirmation
    const handleConfirmDelete = (id: Id<"articles">) => {
        setItemToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    // Execute Delete
    const handleDelete = async () => {
        if (!itemToDelete) return;

        setIsDeleting(true);
        try {
            await removeArticle({ token: token!, id: itemToDelete });
            setIsDeleteDialogOpen(false);
            setItemToDelete(null);
        } catch (error) {
            console.error("Error deleting article:", error);
        } finally {
            setIsDeleting(false);
        }
    };

    const togglePublish = async (article: typeof articles[0]) => {
        await updateArticle({
            token: token!,
            id: article._id,
            isPublished: !article.isPublished
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Blog
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie os artigos e notícias do site.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsImportModalOpen(true)}
                        className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 px-5 py-3 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                    >
                        <FileSpreadsheet className="w-5 h-5 text-green-500" />
                        Importar Artigos
                    </button>
                    <a
                        href="/admin/categories"
                        className="flex items-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 text-gray-700 dark:text-white px-5 py-3 rounded-xl font-bold transition-all border border-gray-200 dark:border-white/10"
                    >
                        <Settings className="w-5 h-5" />
                        Categorias
                    </a>
                    <button
                        onClick={handleOpenCreate}
                        className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                    >
                        <Plus className="w-5 h-5" />
                        Novo Artigo
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <FileText className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{articles.length}</p>
                            <p className="text-sm text-gray-500">Total de Artigos</p>
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
                                {articles.filter(a => a.isPublished).length}
                            </p>
                            <p className="text-sm text-gray-500">Publicados</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[#151e32] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar artigos por título ou categoria..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Articles Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Artigo</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Autor</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredArticles.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum artigo encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredArticles.map((article) => (
                                    <tr key={article._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={article.image}
                                                        alt={article.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="max-w-xs">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{article.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{article.excerpt}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                {article.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{article.author}</p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {formatDate(article.createdAt)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => togglePublish(article)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${article.isPublished
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}
                                            >
                                                {article.isPublished ? (
                                                    <><Eye className="w-3.5 h-3.5" /> Publicado</>
                                                ) : (
                                                    <><EyeOff className="w-3.5 h-3.5" /> Rascunho</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(article)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleConfirmDelete(article._id)}
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
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                {editingId ? 'Editar Artigo' : 'Novo Artigo'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Título do Artigo *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                            placeholder="Ex: Como manter uma alimentação saudável"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Slug (URL)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.slug}
                                            onChange={(e) => setForm({ ...form, slug: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                            placeholder="ex-titulo-artigo"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
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
                                                Tempo de Leitura *
                                            </label>
                                            <input
                                                type="text"
                                                value={form.readTime}
                                                onChange={(e) => setForm({ ...form, readTime: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                                placeholder="Ex: 5 min"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <ImageUpload
                                        label="Imagem de Capa *"
                                        value={form.image}
                                        onChange={(url) => setForm({ ...form, image: url })}
                                    />
                                    <div className="grid grid-cols-1 gap-4">
                                        <ImageUpload
                                            label="Foto do Autor"
                                            value={form.authorImage || ""}
                                            onChange={(url) => setForm({ ...form, authorImage: url })}
                                        />
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Autor *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.author}
                                                    onChange={(e) => setForm({ ...form, author: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                    Cargo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={form.authorRole}
                                                    onChange={(e) => setForm({ ...form, authorRole: e.target.value })}
                                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Resumo (Excerpt) *
                                </label>
                                <textarea
                                    value={form.excerpt}
                                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none resize-none"
                                    placeholder="Uma breve introdução para atrair o leitor..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Conteúdo Completo (Editor Rico) *
                                </label>
                                <RichTextEditor
                                    value={form.content}
                                    onChange={(value) => setForm({ ...form, content: value })}
                                    placeholder="Escreva aqui o conteúdo principal do seu artigo..."
                                />
                            </div>

                            <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10">
                                <input
                                    type="checkbox"
                                    id="isPublished"
                                    checked={form.isPublished}
                                    onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="isPublished" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                                    Publicar imediatamente
                                </label>
                            </div>

                            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <input
                                    type="checkbox"
                                    id="isFeatured"
                                    checked={form.isFeatured}
                                    onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                    className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                                />
                                <label htmlFor="isFeatured" className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-2">
                                    <Star className="w-4 h-4 fill-amber-500" />
                                    Destaque na Página Inicial
                                </label>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3 bg-gray-50 dark:bg-white/5">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !form.title || !form.content || !form.image}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {editingId ? 'Atualizar Artigo' : 'Criar Artigo'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* Bulk Import Modal */}
            <BulkImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                type="blog"
            />
            {/* Delete Confirmation Modal */}
            <DeleteDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDelete}
                isDeleting={isDeleting}
                title="Apagar Artigo"
                description="Tem certeza que deseja apagar este artigo permanentemente? Ele será removido do blog e não poderá ser recuperado."
            />
        </div>
    );
}
