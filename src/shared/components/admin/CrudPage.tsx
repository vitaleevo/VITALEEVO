"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import {
    AdminHeader, Modal, Field, Select, TextArea, Badge, Loading, ErrorBox, Empty,
    Table, Td, inputClass, ImageUpload,
} from "./ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import RichTextEditor from "@/shared/components/RichTextEditor";

export interface CrudField {
    name: string;
    label: string;
    type?: "text" | "number" | "textarea" | "richtext" | "select" | "image" | "checkbox";
    options?: { value: string; label: string }[];
    required?: boolean;
    colSpan?: 1 | 2;
    placeholder?: string;
    /** Valor vazio → enviar undefined (não tocar no campo na edição). */
    optional?: boolean;
}

export interface CrudColumn {
    key: string;
    label: string;
    render?: (row: any) => React.ReactNode;
}

interface CrudPageProps {
    title: string;
    subtitle?: string;
    itemName: string;
    fetcher: () => Promise<unknown[]>;
    columns: CrudColumn[];
    fields: CrudField[];
    searchKeys: string[];
    keyField?: string;
    onCreate?: (form: Record<string, any>) => Promise<unknown>;
    onUpdate?: (key: string, form: Record<string, any>) => Promise<unknown>;
    onDelete?: (key: string) => Promise<unknown>;
    extra?: React.ReactNode;
}

/**
 * Página CRUD genérica do admin — lista + pesquisa + modal + exclusão,
 * com um contrato único para todos os domínios.
 */
export default function CrudPage({ title, subtitle, itemName, fetcher, columns, fields, searchKeys, keyField = "slug", onCreate, onUpdate, onDelete, extra }: CrudPageProps) {
    const { token } = useAuth();
    const { data, isLoading, error, refetch } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher });
    const [search, setSearch] = useState("");
    const [editing, setEditing] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleting, setDeleting] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data || [];
        return (data || []).filter(row => searchKeys.some(k => String(row[k] ?? "").toLowerCase().includes(q)));
    }, [data, search, searchKeys]);

    const openNew = () => { setEditing(null); setIsOpen(true); };
    const openEdit = (row: any) => { setEditing(row); setIsOpen(true); };

    const handleSave = async (form: Record<string, any>) => {
        if (!token) return;
        setSaving(true);
        try {
            const key = editing?.[keyField];
            if (key && onUpdate) {
                await onUpdate(key, form);
                toast.success(`${itemName} atualizado`);
            } else if (onCreate) {
                await onCreate(form);
                toast.success(`${itemName} criado`);
            }
            setIsOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || `Erro ao guardar ${itemName.toLowerCase()}`);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleting || !onDelete) return;
        try {
            await onDelete(deleting[keyField]);
            toast.success(`${itemName} removido`);
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || `Erro ao remover ${itemName.toLowerCase()}`);
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader
                title={title}
                subtitle={subtitle ?? `${data?.length ?? 0} registos`}
                action={onCreate ? (
                    <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                        <Plus className="w-4 h-4" /> Novo {itemName}
                    </button>
                ) : undefined}
            />

            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative max-w-sm flex-1">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Pesquisar..."
                        className={`${inputClass} pl-10`}
                    />
                </div>
                {extra}
            </div>

            <Table headers={[...columns.map(c => c.label), "Ações"]}>
                {filtered.map((row, idx) => (
                    <tr key={row.id ?? row[keyField] ?? idx}>
                        {columns.map(col => (
                            <Td key={col.key}>{col.render ? col.render(row) : row[col.key]}</Td>
                        ))}
                        <Td>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                {onDelete && (
                                    <button onClick={() => setDeleting(row)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                        </Td>
                    </tr>
                ))}
                {!filtered.length && (
                    <tr><td colSpan={columns.length + 1}><Empty label={search ? "Sem resultados" : "Sem registos"} /></td></tr>
                )}
            </Table>

            <CrudModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                editing={editing}
                fields={fields}
                itemName={itemName}
                onSave={handleSave}
                saving={saving}
            />

            <DeleteDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title={`Remover ${itemName}`}
                description={`Tem certeza que deseja remover este ${itemName.toLowerCase()}? Esta ação não pode ser desfeita.`}
            />
        </div>
    );
}

function CrudModal({ isOpen, onClose, editing, fields, itemName, onSave, saving }: {
    isOpen: boolean;
    onClose: () => void;
    editing: any | null;
    fields: CrudField[];
    itemName: string;
    onSave: (form: Record<string, any>) => void;
    saving: boolean;
}) {
    const [form, setForm] = useState<Record<string, any>>(() => {
        const initial: Record<string, any> = {};
        for (const f of fields) {
            const value = editing?.[f.name];
            initial[f.name] = value ?? (f.type === "checkbox" ? false : "");
        }
        return initial;
    });
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${editing ? "Editar" : "Novo"} ${itemName}`} wide>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {fields.map(f => {
                    const input = (() => {
                        switch (f.type) {
                            case "textarea":
                                return <TextArea value={form[f.name]} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder} />;
                            case "richtext":
                                return <RichTextEditor value={form[f.name] || ""} onChange={v => set(f.name, v)} />;
                            case "select":
                                return (
                                    <Select value={form[f.name]} onChange={e => set(f.name, e.target.value)} required={f.required}>
                                        <option value="">—</option>
                                        {(f.options || []).map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                                    </Select>
                                );
                            case "image":
                                return <ImageUpload value={form[f.name]} onChange={url => set(f.name, url)} />;
                            case "checkbox":
                                return (
                                    <input type="checkbox" checked={Boolean(form[f.name])} onChange={e => set(f.name, e.target.checked)} className="rounded accent-primary" />
                                );
                            case "number":
                                return <input type="number" className={inputClass} value={form[f.name]} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder} />;
                            default:
                                return <input className={inputClass} value={form[f.name]} onChange={e => set(f.name, e.target.value)} required={f.required} placeholder={f.placeholder} />;
                        }
                    })();
                    return (
                        <div key={f.name} className={f.colSpan === 2 ? "md:col-span-2" : ""}>
                            <Field label={f.label} required={f.required}>
                                {input}
                            </Field>
                        </div>
                    );
                })}
            </div>
            <div className="mt-6 flex justify-end gap-3">
                <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                    Cancelar
                </button>
                <button
                    disabled={saving || fields.some(f => f.required && !form[f.name])}
                    onClick={() => {
                        const clean: Record<string, any> = {};
                        for (const f of fields) {
                            if (f.optional && (form[f.name] === "" || form[f.name] == null)) continue;
                            clean[f.name] = form[f.name];
                        }
                        onSave(clean);
                    }}
                    className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                >
                    {saving ? "A guardar..." : "Guardar"}
                </button>
            </div>
        </Modal>
    );
}

// ── Renderizadores de coluna comuns ──────────────────────────────────────
function ImageColumn({ src }: { src?: string }) {
    return src ? (
        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-[#0f172a]">
            <Image src={src} alt="" fill className="object-cover" unoptimized />
        </div>
    ) : <span className="text-gray-300">—</span>;
}

export function imageColumn(key = "image") {
    function imageRenderer(row: any) {
        return <ImageColumn src={row[key]} />;
    }
    return imageRenderer;
}

function BadgeColumn({ value }: { value: string }) {
    return <Badge value={value} />;
}

export function badgeColumn(key = "status") {
    function badgeRenderer(row: any) {
        return <BadgeColumn value={String(row[key] ?? "")} />;
    }
    return badgeRenderer;
}