"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    Briefcase,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    Eye,
    EyeOff,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";

const ICON_OPTIONS = ["globe", "megaphone", "bot", "network", "sparkles", "shield", "camera", "shopping-bag"];

interface ServiceForm {
    title: string;
    slug: string;
    subtitle: string;
    description: string;
    icon: string;
    features: string;
    ctaText: string;
    order: number;
    isActive: boolean;
    status: "published" | "draft" | "archived";
}

const emptyForm: ServiceForm = {
    title: "",
    slug: "",
    subtitle: "",
    description: "",
    icon: "globe",
    features: "",
    ctaText: "Pedir Proposta",
    order: 0,
    isActive: true,
    status: "published",
};

const generateSlug = (name: string) =>
    name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

export default function AdminServicesPage() {
    const { token } = useAuth();
    const services = useQuery(api.services.getAllAdmin, token ? { token } : "skip");
    const createService = useMutation(api.services.create);
    const updateService = useMutation(api.services.update);
    const removeService = useMutation(api.services.remove);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"services"> | null>(null);
    const [form, setForm] = useState<ServiceForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    if (!services) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleOpenCreate = () => {
        setEditingId(null);
        setForm({ ...emptyForm, order: services.length });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (service: typeof services[0]) => {
        setEditingId(service._id);
        setForm({
            title: service.title,
            slug: service.slug,
            subtitle: service.subtitle,
            description: service.description,
            icon: service.icon,
            features: (service.features || []).join("\n"),
            ctaText: service.ctaText,
            order: service.order,
            isActive: service.isActive,
            status: service.status || "published",
        });
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        const features = form.features
            .split("\n")
            .map((f) => f.trim())
            .filter(Boolean);
        if (!form.title || features.length === 0) {
            toast.error("Preencha o título e pelo menos uma funcionalidade.");
            return;
        }
        setIsSaving(true);
        try {
            if (editingId) {
                await updateService({
                    token: token!,
                    id: editingId,
                    title: form.title,
                    slug: form.slug || generateSlug(form.title),
                    subtitle: form.subtitle,
                    description: form.description,
                    icon: form.icon,
                    features,
                    ctaText: form.ctaText,
                    order: form.order,
                    isActive: form.isActive,
                    status: form.status,
                });
                toast.success("Serviço atualizado com sucesso!");
            } else {
                await createService({
                    token: token!,
                    title: form.title,
                    slug: form.slug || generateSlug(form.title),
                    subtitle: form.subtitle,
                    description: form.description,
                    icon: form.icon,
                    image: "",
                    features,
                    benefits: [],
                    process: [],
                    ctaText: form.ctaText,
                    isActive: form.isActive,
                    status: form.status,
                    order: form.order,
                });
                toast.success("Serviço criado com sucesso!");
            }
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving service:", error);
            toast.error("Erro ao guardar o serviço. Tente novamente.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: Id<"services">) => {
        if (confirm("Tem certeza que deseja remover este serviço?")) {
            try {
                await removeService({ token: token!, id });
                toast.success("Serviço removido.");
            } catch (error) {
                toast.error("Erro ao remover o serviço.");
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Serviços
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie os serviços exibidos na página inicial.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5" />
                    Novo Serviço
                </button>
            </div>

            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Serviço</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Funcionalidades</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Ordem</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {services.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum serviço criado. Crie o primeiro para aparecer na página inicial.
                                    </td>
                                </tr>
                            ) : (
                                services.map((service) => (
                                    <tr key={service._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-sm text-gray-900 dark:text-white">{service.title}</p>
                                            <p className="text-xs text-gray-500 line-clamp-1">{service.subtitle}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300">
                                                {(service.features || []).length} itens
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                {service.order}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                (service.status || "published") === "published" && service.isActive
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                                            }`}>
                                                {(service.status || "published") === "published" && service.isActive ? (
                                                    <>
                                                        <Eye className="w-3.5 h-3.5" />
                                                        Visível
                                                    </>
                                                ) : (
                                                    <>
                                                        <EyeOff className="w-3.5 h-3.5" />
                                                        Oculto
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleOpenEdit(service)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(service._id)}
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
                                {editingId ? 'Editar Serviço' : 'Novo Serviço'}
                            </h2>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Título *
                                    </label>
                                    <input
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value, slug: generateSlug(e.target.value) })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="Ex: Marketing Digital"
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
                                        placeholder="marketing-digital"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Subtítulo (tagline)
                                </label>
                                <input
                                    type="text"
                                    value={form.subtitle}
                                    onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                    placeholder="Frase curta de apresentação"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Descrição
                                </label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                    placeholder="Descrição detalhada do serviço..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Funcionalidades / Itens (um por linha) *
                                </label>
                                <textarea
                                    value={form.features}
                                    onChange={(e) => setForm({ ...form, features: e.target.value })}
                                    rows={4}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                    placeholder={"Websites\nE-commerce\nSistemas Web"}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Ícone
                                    </label>
                                    <select
                                        value={form.icon}
                                        onChange={(e) => setForm({ ...form, icon: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    >
                                        {ICON_OPTIONS.map(icon => (
                                            <option key={icon} value={icon}>{icon}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Texto do CTA
                                    </label>
                                    <input
                                        type="text"
                                        value={form.ctaText}
                                        onChange={(e) => setForm({ ...form, ctaText: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    />
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                        Estado
                                    </label>
                                    <select
                                        value={form.status}
                                        onChange={(e) => setForm({ ...form, status: e.target.value as ServiceForm["status"] })}
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                    >
                                        <option value="published">Publicado</option>
                                        <option value="draft">Rascunho</option>
                                        <option value="archived">Arquivado</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-3 pt-8">
                                    <input
                                        type="checkbox"
                                        id="isActive"
                                        checked={form.isActive}
                                        onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="isActive" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Ativo (visível na loja pública)
                                    </label>
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
                                disabled={isSaving || !form.title}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                {editingId ? 'Atualizar' : 'Criar Serviço'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}