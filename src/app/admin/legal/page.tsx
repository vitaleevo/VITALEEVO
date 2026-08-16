"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { FileText, Plus, Edit, Trash2, X, Save, Loader2, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";

interface LegalForm {
    title: string;
    slug: string;
    content: string;
    status: "draft" | "published";
}

const emptyForm: LegalForm = { title: "", slug: "", content: "", status: "draft" };

const generateSlug = (name: string) =>
    name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

export default function AdminLegalPage() {
    const { token } = useAuth();
    const docs = useQuery(api.legalDocuments.getAllAdmin, token ? { token } : "skip");
    const upsertDoc = useMutation(api.legalDocuments.upsert);
    const removeDoc = useMutation(api.legalDocuments.remove);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<Id<"legalDocuments"> | null>(null);
    const [form, setForm] = useState<LegalForm>(emptyForm);
    const [isSaving, setIsSaving] = useState(false);

    if (!docs) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const handleSave = async () => {
        if (!form.title || !form.content.trim()) {
            toast.error("Preencha o título e o conteúdo.");
            return;
        }
        setIsSaving(true);
        try {
            const id = await upsertDoc({
                token: token!,
                title: form.title,
                slug: form.slug || generateSlug(form.title),
                content: form.content,
                status: form.status,
            });
            setEditingId(id);
            toast.success("Documento guardado com sucesso!");
            setIsModalOpen(false);
            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            console.error("Error saving legal document:", error);
            toast.error("Erro ao guardar o documento.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: Id<"legalDocuments">) => {
        if (confirm("Tem certeza que deseja remover este documento?")) {
            try {
                await removeDoc({ token: token!, id });
                toast.success("Documento removido.");
            } catch (error) {
                toast.error("Erro ao remover o documento.");
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Documentos Legais
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Políticas, termos e documentos institucionais públicos em /legal/{'{slug}'}.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingId(null); setForm(emptyForm); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-primary/25"
                >
                    <Plus className="w-5 h-5" />
                    Novo Documento
                </button>
            </div>

            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Documento</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">URL</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {docs.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                        Nenhum documento criado.
                                    </td>
                                </tr>
                            ) : (
                                docs.map((doc) => (
                                    <tr key={doc._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                    <FileText className="w-5 h-5 text-primary" />
                                                </div>
                                                <p className="font-bold text-sm text-gray-900 dark:text-white">{doc.title}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-xs text-gray-500 font-mono">/legal/{doc.slug}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                                doc.status === "published"
                                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                            }`}>
                                                <Globe className="w-3.5 h-3.5" />
                                                {doc.status === "published" ? "Publicado" : "Rascunho"}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => { setEditingId(doc._id); setForm({ title: doc.title, slug: doc.slug, content: doc.content, status: doc.status }); setIsModalOpen(true); }}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(doc._id)}
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
                                {editingId ? 'Editar Documento' : 'Novo Documento'}
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
                                        placeholder="Ex: Política de Privacidade"
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
                                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                        placeholder="politica-de-privacidade"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Conteúdo (pode usar HTML básico) *
                                </label>
                                <textarea
                                    value={form.content}
                                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                                    rows={12}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono text-sm"
                                    placeholder={"<h2>Introdução</h2>\n<p>Texto do documento...</p>"}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={form.status}
                                    onChange={(e) => setForm({ ...form, status: e.target.value as LegalForm["status"] })}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                >
                                    <option value="draft">Rascunho</option>
                                    <option value="published">Publicado</option>
                                </select>
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
                                Guardar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}