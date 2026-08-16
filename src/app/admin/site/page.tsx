"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { LayoutTemplate, X, Save, Loader2, Globe } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function AdminSitePage() {
    const { token } = useAuth();
    const pages = useQuery(api.siteContent.getPagesAdmin, token ? { token } : "skip");
    const upsertPage = useMutation(api.siteContent.upsertPage);
    const upsertBlock = useMutation(api.siteContent.upsertBlock);

    const [editing, setEditing] = useState<NonNullable<typeof pages>[number] | null>(null);
    const [title, setTitle] = useState("");
    const [seoTitle, setSeoTitle] = useState("");
    const [seoDescription, setSeoDescription] = useState("");
    const [status, setStatus] = useState<"draft" | "published">("published");
    const [blockContent, setBlockContent] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    if (!pages) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const openEditor = (entry: NonNullable<typeof pages>[number]) => {
        setEditing(entry);
        setTitle(entry.page.title);
        setSeoTitle(entry.page.seoTitle);
        setSeoDescription(entry.page.seoDescription);
        setStatus(entry.page.status);
        const contents: Record<string, string> = {};
        entry.blocks.forEach((b) => { contents[b.type] = b.content; });
        setBlockContent(contents);
    };

    const handleSave = async () => {
        if (!editing) return;
        setIsSaving(true);
        try {
            await upsertPage({
                token: token!,
                slug: editing.page.slug,
                title,
                seoTitle,
                seoDescription,
                status,
            });
            toast.success("Página atualizada com sucesso!");
            setEditing(null);
        } catch (error) {
            console.error("Error saving page:", error);
            toast.error("Erro ao guardar a página.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveBlock = async (type: string) => {
        if (!editing) return;
        setIsSaving(true);
        try {
            await upsertBlock({
                token: token!,
                pageId: editing.page._id,
                type: type as any,
                content: blockContent[type] || "",
            });
            toast.success("Bloco atualizado com sucesso!");
        } catch (error) {
            console.error("Error saving block:", error);
            toast.error("Erro ao guardar o bloco.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                    Conteúdo do Site
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Páginas institucionais e blocos de conteúdo (herói, estatísticas, CTA).
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pages.length === 0 ? (
                    <div className="col-span-full bg-white dark:bg-[#151e32] p-12 rounded-2xl border border-gray-100 dark:border-white/5 text-center text-gray-500">
                        Nenhuma página criada ainda.
                    </div>
                ) : (
                    pages.map((entry) => (
                        <div key={entry.page._id} className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <LayoutTemplate className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{entry.page.title}</p>
                                        <p className="text-xs text-gray-500 font-mono">/{entry.page.slug}</p>
                                    </div>
                                </div>
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                    entry.page.status === "published"
                                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                }`}>
                                    <Globe className="w-3.5 h-3.5" />
                                    {entry.page.status === "published" ? "Publicado" : "Rascunho"}
                                </span>
                            </div>
                            <p className="mt-3 text-sm text-gray-500 line-clamp-2">{entry.page.seoDescription}</p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                {entry.blocks.map((b) => (
                                    <span key={b._id} className="px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-gray-300">
                                        {b.type}
                                    </span>
                                ))}
                            </div>
                            <button
                                onClick={() => openEditor(entry)}
                                className="mt-4 w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 px-4 py-2.5 rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
                            >
                                Editar Página
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Editor Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                Editar: {editing.page.title}
                            </h2>
                            <button
                                onClick={() => setEditing(null)}
                                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Título
                                </label>
                                <input
                                    type="text"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    SEO Title
                                </label>
                                <input
                                    type="text"
                                    value={seoTitle}
                                    onChange={(e) => setSeoTitle(e.target.value)}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    SEO Description
                                </label>
                                <textarea
                                    value={seoDescription}
                                    onChange={(e) => setSeoDescription(e.target.value)}
                                    rows={3}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Estado
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as "draft" | "published")}
                                    className="w-full px-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary outline-none"
                                >
                                    <option value="draft">Rascunho</option>
                                    <option value="published">Publicado</option>
                                </select>
                            </div>

                            <div className="border-t border-gray-200 dark:border-white/5 pt-6">
                                <h3 className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                                    Blocos de Conteúdo
                                </h3>
                                <div className="space-y-4">
                                    {editing.blocks.map((b) => (
                                        <div key={b._id} className="p-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-xs font-black uppercase tracking-wider">
                                                    {b.type}
                                                </span>
                                                <span className={`text-xs font-bold ${b.isVerified ? 'text-green-500' : 'text-amber-500'}`}>
                                                    {b.isVerified ? "Verificado" : "Não verificado"}
                                                </span>
                                            </div>
                                            <textarea
                                                value={blockContent[b.type] || ""}
                                                onChange={(e) => setBlockContent({ ...blockContent, [b.type]: e.target.value })}
                                                rows={4}
                                                className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-[#151e32] border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none font-mono text-sm"
                                                placeholder="Conteúdo do bloco (JSON para blocos estruturados)"
                                            />
                                            <button
                                                onClick={() => handleSaveBlock(b.type)}
                                                disabled={isSaving}
                                                className="mt-2 text-sm bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition-all disabled:opacity-50"
                                            >
                                                Guardar Bloco
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-gray-200 dark:border-white/5 flex justify-end gap-3">
                            <button
                                onClick={() => setEditing(null)}
                                className="px-5 py-2.5 rounded-xl font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isSaving || !title}
                                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white px-5 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSaving ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Save className="w-5 h-5" />
                                )}
                                Guardar Página
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}