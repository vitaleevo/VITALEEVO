"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Briefcase,
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    X,
    Save,
    Loader2,
    Settings,
    Star
} from "lucide-react";
import { useState } from "react";
// import { formatDate } from "@/shared/utils/format";
import ImageUpload from "@/shared/components/ImageUpload";
import RichTextEditor from "@/shared/components/RichTextEditor";
import MultiImageUpload from "@/shared/components/MultiImageUpload";

interface ProjectForm {
    title: string;
    slug: string;
    category: string;
    tags: string;
    image: string;
    images: string[];
    client: string;
    year: string;
    fullDescription: string;
    challenge: string;
    solution: string;
    results: string;
    isActive: boolean;
    isFeatured: boolean;
    order: number;
}

const emptyForm: ProjectForm = {
    title: "",
    slug: "",
    category: "",
    tags: "",
    image: "",
    images: [],
    client: "",
    year: new Date().getFullYear().toString(),
    fullDescription: "",
    challenge: "",
    solution: "",
    results: "",
    isActive: true,
    isFeatured: false,
    order: 0,
};

export default function AdminPortfolioPage() {
    const projects = useQuery(api.projects.getAllAdmin);
    const dbCategories = useQuery(api.categories.getByType, { type: "portfolio" });
    const createProject = useMutation(api.projects.create);
    const updateProject = useMutation(api.projects.update);
    const removeProject = useMutation(api.projects.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"projects"> | null>(null);
    const [form, setForm] = useState<ProjectForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    if (!projects || !dbCategories) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredProjects = projects.filter(project => {
        const searchNormalized = searchTerm.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const titleNormalized = project.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const catNormalized = project.category.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
        setForm({
            ...emptyForm,
            category: dbCategories && dbCategories.length > 0 ? dbCategories[0].name : "",
            year: new Date().getFullYear().toString()
        });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (project: typeof projects[0]) => {
        setEditingId(project._id);
        setForm({
            title: project.title,
            slug: project.slug,
            category: project.category,
            tags: project.tags.join(", "),
            image: project.image,
            images: project.images || [],
            client: project.client || "",
            year: project.year || "",
            fullDescription: project.fullDescription,
            challenge: project.challenge,
            solution: project.solution,
            results: project.results.join("\n"),
            isActive: project.isActive,
            isFeatured: project.isFeatured ?? false,
            order: project.order,
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const projectData = {
                ...form,
                tags: form.tags.split(",").map(t => t.trim()).filter(t => t),
                results: form.results.split("\n").map(r => r.trim()).filter(r => r),
            };

            if (editingId) {
                await updateProject({
                    id: editingId,
                    ...projectData
                });
            } else {
                await createProject({
                    ...projectData,
                    slug: form.slug || generateSlug(form.title)
                });
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving project:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: Id<"projects">) => {
        if (confirm("Tem certeza que deseja apagar este projeto?")) {
            await removeProject({ id });
        }
    };

    const toggleActive = async (project: typeof projects[0]) => {
        await updateProject({
            id: project._id,
            isActive: !project.isActive
        });
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Portfólio
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie os projetos exibidos no portfólio.
                    </p>
                </div>
                <div className="flex items-center gap-3">
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
                        Novo Projeto
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{projects.length}</p>
                            <p className="text-sm text-gray-500">Total de Projetos</p>
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
                                {projects.filter(p => p.isActive).length}
                            </p>
                            <p className="text-sm text-gray-500">Ativos</p>
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
                        placeholder="Buscar projetos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Projeto</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Categoria</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Cliente/Ano</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Ordem</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredProjects.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum projeto encontrado.
                                    </td>
                                </tr>
                            ) : (
                                filteredProjects.map((project) => (
                                    <tr key={project._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-16 h-10 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden flex-shrink-0">
                                                    <img
                                                        src={project.image}
                                                        alt={project.title}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="max-w-xs">
                                                    <p className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{project.title}</p>
                                                    <p className="text-xs text-gray-500 line-clamp-1">{project.slug}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                {project.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">{project.client}</p>
                                            <p className="text-xs text-gray-500">{project.year}</p>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {project.order}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(project)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${project.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                                    }`}
                                            >
                                                {project.isActive ? (
                                                    <><Eye className="w-3.5 h-3.5" /> Ativo</>
                                                ) : (
                                                    <><EyeOff className="w-3.5 h-3.5" /> Inativo</>
                                                )}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(project)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(project._id)}
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
                                {editingId ? 'Editar Projeto' : 'Novo Projeto'}
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
                                            Título do Projeto *
                                        </label>
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                            placeholder="Ex: Novo Website E-commerce"
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
                                                {dbCategories.length > 0 ? (
                                                    dbCategories.map(cat => (
                                                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                    ))
                                                ) : (
                                                    <>
                                                        <option value="">Selecione uma categoria...</option>
                                                        <option value="Website">Website</option>
                                                        <option value="Branding">Branding</option>
                                                        <option value="Software">Software</option>
                                                        <option value="Marketing Digital">Marketing Digital</option>
                                                        <option value="Design">Design</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                                Ano
                                            </label>
                                            <input
                                                type="text"
                                                value={form.year}
                                                onChange={(e) => setForm({ ...form, year: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Cliente
                                        </label>
                                        <input
                                            type="text"
                                            value={form.client}
                                            onChange={(e) => setForm({ ...form, client: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Tags (separadas por vírgula)
                                        </label>
                                        <input
                                            type="text"
                                            value={form.tags}
                                            onChange={(e) => setForm({ ...form, tags: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                            placeholder="React, Next.js, Design"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <ImageUpload
                                        label="Imagem Principal *"
                                        value={form.image}
                                        onChange={(url) => setForm({ ...form, image: url })}
                                    />
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Resultados Chave (um por linha)
                                        </label>
                                        <textarea
                                            value={form.results}
                                            onChange={(e) => setForm({ ...form, results: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none resize-none"
                                            placeholder="+50% Vendas&#10;Melhoria de Performance&#10;Novo Branding"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl border border-gray-200 dark:border-white/10 mt-6">
                                        <input
                                            type="checkbox"
                                            id="isFeatured"
                                            checked={form.isFeatured}
                                            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                                            className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                        />
                                        <label htmlFor="isFeatured" className="text-sm font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                                            <Star className={`w-4 h-4 ${form.isFeatured ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                                            Destaque na Página Principal?
                                        </label>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                            Ordem de Exibição
                                        </label>
                                        <input
                                            type="number"
                                            value={form.order}
                                            onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) })}
                                            className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                                <MultiImageUpload
                                    label="Galeria de Imagens do Projeto"
                                    value={form.images}
                                    onChange={(urls) => setForm({ ...form, images: urls })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição Completa (Editor Rico)
                                </label>
                                <RichTextEditor
                                    value={form.fullDescription}
                                    onChange={(value) => setForm({ ...form, fullDescription: value })}
                                    placeholder="Descreva o projeto..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        O Desafio
                                    </label>
                                    <textarea
                                        value={form.challenge}
                                        onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        A Solução
                                    </label>
                                    <textarea
                                        value={form.solution}
                                        onChange={(e) => setForm({ ...form, solution: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none resize-none"
                                    />
                                </div>
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
                                disabled={isSaving || !form.title || !form.image}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/25"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {editingId ? 'Atualizar Projeto' : 'Criar Projeto'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
