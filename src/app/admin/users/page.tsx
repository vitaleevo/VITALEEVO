"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Modal, Loading, ErrorBox, Empty, Table, Td, Field, Select, inputClass, Badge } from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";

const ROLES = [
    { value: "admin", label: "Administrador" },
    { value: "commercial", label: "Comercial" },
    { value: "content", label: "Conteúdo" },
    { value: "operations", label: "Operações" },
    { value: "user", label: "Utilizador" },
];

export default function AdminUsersPage() {
    const { token } = useAuth();
    const { data: users, isLoading, error, refetch } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.users.list(token as string),
    });
    const [editing, setEditing] = useState<any | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [deleting, setDeleting] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState<Record<string, any>>({});
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => { setEditing(null); setForm({ role: "user", is_active: true, is_staff: false }); setIsOpen(true); };
    const openEdit = (u: any) => {
        setEditing(u);
        setForm({
            first_name: u.firstName || u.first_name || "",
            last_name: u.lastName || u.last_name || "",
            phone: u.phone || "",
            role: u.role || "user",
            is_active: Boolean(u.isActive ?? u.is_active ?? true),
        });
        setIsOpen(true);
    };

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const body: Record<string, any> = {
                first_name: form.first_name,
                last_name: form.last_name,
                phone: form.phone,
                role: form.role,
                is_active: form.is_active,
            };
            if (!editing) {
                body.email = form.email;
                body.password = form.password;
                await api.users.create(body, token);
                toast.success("Utilizador criado");
            } else {
                await api.users.update(editing.id, body, token);
                toast.success("Utilizador atualizado");
            }
            setIsOpen(false);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao guardar utilizador");
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleting) return;
        try {
            await api.users.remove(deleting.id, token);
            toast.success("Utilizador removido");
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao remover");
        }
    };

    const resetPassword = async (u: any) => {
        if (!token) return;
        const password = window.prompt(`Nova password para ${u.email}:`);
        if (!password) return;
        try {
            await api.users.resetPassword(u.id, password, token);
            toast.success("Password reposta");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao repor password");
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader
                title="Utilizadores"
                subtitle={`${users?.length ?? 0} contas`}
                action={
                    <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                        <Plus className="w-4 h-4" /> Novo Utilizador
                    </button>
                }
            />

            <Table headers={["Nome", "Email", "Telefone", "Cargo", "Estado", "Ações"]}>
                {(users || []).map((u: any) => (
                    <tr key={u.id}>
                        <Td className="font-bold text-gray-900 dark:text-white">
                            {u.firstName || u.first_name || u.lastName || u.last_name ? `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim() : "—"}
                        </Td>
                        <Td>{u.email}</Td>
                        <Td>{u.phone || "—"}</Td>
                        <Td><Badge value={u.role} /></Td>
                        <Td>
                            {u.isActive ?? u.is_active ? (
                                <span className="text-xs font-bold text-green-500">Ativo</span>
                            ) : (
                                <span className="text-xs font-bold text-red-500">Inativo</span>
                            )}
                        </Td>
                        <Td>
                            <div className="flex gap-1">
                                <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                    <Pencil className="w-4 h-4" />
                                </button>
                                <button onClick={() => resetPassword(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                    <KeyRound className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleting(u)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </Td>
                    </tr>
                ))}
                {!users?.length && <tr><td colSpan={6}><Empty /></td></tr>}
            </Table>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar Utilizador" : "Novo Utilizador"}>
                <div className="space-y-4">
                    {!editing && (
                        <>
                            <Field label="Email" required>
                                <input type="email" className={inputClass} value={form.email || ""} onChange={e => set("email", e.target.value)} required />
                            </Field>
                            <Field label="Password" required>
                                <input type="password" className={inputClass} value={form.password || ""} onChange={e => set("password", e.target.value)} required />
                            </Field>
                        </>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Nome">
                            <input className={inputClass} value={form.first_name || ""} onChange={e => set("first_name", e.target.value)} />
                        </Field>
                        <Field label="Apelido">
                            <input className={inputClass} value={form.last_name || ""} onChange={e => set("last_name", e.target.value)} />
                        </Field>
                    </div>
                    <Field label="Telefone">
                        <input className={inputClass} value={form.phone || ""} onChange={e => set("phone", e.target.value)} />
                    </Field>
                    <Field label="Cargo">
                        <Select value={form.role || "user"} onChange={e => set("role", e.target.value)}>
                            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </Select>
                    </Field>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
                        <input type="checkbox" checked={Boolean(form.is_active)} onChange={e => set("is_active", e.target.checked)} className="rounded accent-primary" />
                        Conta ativa
                    </label>
                </div>
                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        Cancelar
                    </button>
                    <button onClick={handleSave} disabled={saving || (!editing && (!form.email || !form.password))} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">
                        {saving ? "A guardar..." : "Guardar"}
                    </button>
                </div>
            </Modal>

            <DeleteDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Remover Utilizador" description={`A conta ${deleting?.email} será removida permanentemente.`} />
        </div>
    );
}