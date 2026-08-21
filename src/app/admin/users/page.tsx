"use client";

import React, { useState } from "react";
import { Plus, Pencil, Trash2, KeyRound, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import {
    AdminHeader, Modal, Loading, ErrorBox, Empty, Table, Td, Field, Select, inputClass, Badge,
} from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { PermissionGuard } from "@/shared/components/admin/PermissionGuard";

const ROLES = [
    { value: "admin", label: "Administrador (Acesso Total)" },
    { value: "commercial", label: "Comercial (Cotações, Contactos e Encomendas)" },
    { value: "content", label: "Conteúdo (Blog, Portfólio e Serviços)" },
    { value: "operations", label: "Operações (Catálogo, Stock e Encomendas)" },
    { value: "user", label: "Cliente / Utilizador Comum" },
];

const PERMISSION_GROUPS = [
    {
        title: "Loja & Catálogo",
        permissions: [
            { key: "catalog:read", label: "Consultar Catálogo" },
            { key: "catalog:manage", label: "Gerir Produtos, Categorias e Marcas" },
            { key: "catalog:import", label: "Importar Catálogo (Excel)" },
            { key: "stock:manage", label: "Gerir Stock" },
            { key: "orders:read", label: "Consultar Encomendas" },
            { key: "orders:manage", label: "Gerir Encomendas" },
        ],
    },
    {
        title: "Conteúdo & CMS",
        permissions: [
            { key: "content:manage", label: "Gerir Blog, Portfólio e Serviços" },
            { key: "content:import", label: "Importar Conteúdos" },
            { key: "media:upload", label: "Carregar Ficheiros / Imagens" },
        ],
    },
    {
        title: "Comercial & Mensagens",
        permissions: [
            { key: "quotes:read", label: "Consultar Cotações" },
            { key: "quotes:manage", label: "Gerir e Responder a Cotações" },
            { key: "contacts:manage", label: "Gerir Contactos e Mensagens" },
        ],
    },
    {
        title: "Administração & Sistema",
        permissions: [
            { key: "users:manage", label: "Gerir Utilizadores e Permissões" },
            { key: "settings:manage", label: "Configurações Globais" },
            { key: "audit:read", label: "Consultar Auditoria e Logs" },
            { key: "system:manage", label: "Acesso Total ao Sistema" },
        ],
    },
];

const DEFAULT_ROLE_PERMISSIONS: Record<string, string[]> = {
    admin: [
        "system:manage", "users:manage", "catalog:read", "catalog:manage", "catalog:import",
        "stock:manage", "quotes:read", "quotes:manage", "content:manage", "content:import",
        "media:upload", "contacts:manage", "settings:manage", "ai:manage", "audit:read",
        "orders:read", "orders:manage",
    ],
    commercial: ["quotes:read", "quotes:manage", "contacts:manage", "orders:read", "orders:manage", "media:upload"],
    content: ["content:manage", "content:import", "media:upload"],
    operations: ["catalog:read", "catalog:manage", "stock:manage", "quotes:read", "orders:read", "orders:manage", "media:upload"],
    user: [],
};

const getInitialUserForm = () => ({
    role: "content",
    permissions: [...DEFAULT_ROLE_PERMISSIONS.content],
    is_active: true,
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    phone: "",
});

export default function AdminUsersPage() {
    return (
        <PermissionGuard permission="users:manage">
            <AdminUsersContent />
        </PermissionGuard>
    );
}

export function AdminUsersContent() {
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
    const [form, setForm] = useState<Record<string, any>>(getInitialUserForm);
    const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

    const openNew = () => {
        setEditing(null);
        setForm(getInitialUserForm());
        setIsOpen(true);
    };

    const openEdit = (u: any) => {
        setEditing(u);
        const userPerms = Array.isArray(u.permissions)
            ? u.permissions
            : (DEFAULT_ROLE_PERMISSIONS[u.role || "user"] || []);

        setForm({
            first_name: u.firstName || u.first_name || "",
            last_name: u.lastName || u.last_name || "",
            phone: u.phone || "",
            role: u.role || "user",
            permissions: [...userPerms],
            is_active: Boolean(u.isActive ?? u.is_active ?? true),
        });
        setIsOpen(true);
    };

    const handleRoleChange = (newRole: string) => {
        const defaultPerms = DEFAULT_ROLE_PERMISSIONS[newRole] || [];
        setForm(f => ({
            ...f,
            role: newRole,
            permissions: [...defaultPerms],
        }));
    };

    const togglePermission = (permKey: string) => {
        setForm(f => {
            const current: string[] = f.permissions || [];
            const next = current.includes(permKey)
                ? current.filter(p => p !== permKey)
                : [...current, permKey];
            return { ...f, permissions: next };
        });
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
                permissions: form.permissions || [],
                is_active: form.is_active,
            };
            if (!editing) {
                body.email = form.email;
                body.password = form.password;
                await api.users.create(body, token);
                toast.success("Utilizador criado com sucesso");
            } else {
                await api.users.update(editing.id, body, token);
                toast.success("Utilizador e permissões atualizados");
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
            toast.success("Password reposta com sucesso");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao repor password");
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader
                title="Utilizadores & Permissões"
                subtitle={`${users?.length ?? 0} contas registadas no sistema`}
                action={
                    <button onClick={openNew} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors shadow-sm">
                        <Plus className="w-4 h-4" /> Novo Utilizador CMS
                    </button>
                }
            />

            <Table headers={["Utilizador", "Email", "Cargo", "Acesso CMS", "Estado", "Ações"]}>
                {(users || []).map((u: any) => {
                    const isStaff = u.isStaff ?? u.is_staff ?? (u.role !== "user");
                    const permsCount = (u.permissions || []).length;
                    return (
                        <tr key={u.id}>
                            <Td className="font-bold text-gray-900 dark:text-white">
                                <div>
                                    <span>{u.firstName || u.first_name || u.lastName || u.last_name ? `${u.firstName ?? u.first_name ?? ""} ${u.lastName ?? u.last_name ?? ""}`.trim() : "Sem nome"}</span>
                                    {u.phone && <p className="text-xs text-gray-400 font-normal">{u.phone}</p>}
                                </div>
                            </Td>
                            <Td className="text-sm font-mono">{u.email}</Td>
                            <Td><Badge value={u.role || "user"} /></Td>
                            <Td>
                                {isStaff ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">
                                        <UserCheck className="w-3.5 h-3.5" /> Staff ({permsCount} permissões)
                                    </span>
                                ) : (
                                    <span className="text-xs text-gray-400">Cliente (Sem CMS)</span>
                                )}
                            </Td>
                            <Td>
                                {u.isActive ?? u.is_active ? (
                                    <span className="text-xs font-bold text-green-500">Ativo</span>
                                ) : (
                                    <span className="text-xs font-bold text-red-500">Inativo</span>
                                )}
                            </Td>
                            <Td>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(u)} title="Editar utilizador e permissões" className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                        <Pencil className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => resetPassword(u)} title="Definir nova password" className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                        <KeyRound className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => setDeleting(u)} title="Remover conta" className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </Td>
                        </tr>
                    );
                })}
                {!users?.length && <tr><td colSpan={6}><Empty /></td></tr>}
            </Table>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={editing ? "Editar Utilizador & Permissões" : "Novo Utilizador do CMS"} wide>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {!editing && (
                            <>
                                <Field label="Email" required>
                                    <input type="email" className={inputClass} value={form.email || ""} onChange={e => set("email", e.target.value)} required placeholder="exemplo@vitaleevo.ao" />
                                </Field>
                                <Field label="Password Inicial" required>
                                    <input type="password" className={inputClass} value={form.password || ""} onChange={e => set("password", e.target.value)} required placeholder="mínimo 8 caracteres" />
                                </Field>
                            </>
                        )}
                        <Field label="Nome">
                            <input className={inputClass} value={form.first_name || ""} onChange={e => set("first_name", e.target.value)} placeholder="Primeiro nome" />
                        </Field>
                        <Field label="Apelido">
                            <input className={inputClass} value={form.last_name || ""} onChange={e => set("last_name", e.target.value)} placeholder="Sobrenome" />
                        </Field>
                        <Field label="Telefone">
                            <input className={inputClass} value={form.phone || ""} onChange={e => set("phone", e.target.value)} placeholder="+244 9..." />
                        </Field>
                        <Field label="Cargo Predefinido">
                            <Select value={form.role || "user"} onChange={e => handleRoleChange(e.target.value)}>
                                {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                            </Select>
                        </Field>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield className="w-4 h-4 text-primary" />
                            <h4 className="text-sm font-bold text-gray-900 dark:text-white">Capacidades e Permissões Granulares</h4>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                            Selecione as áreas que este utilizador terá permissão para visualizar e gerir no painel administrativo:
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {PERMISSION_GROUPS.map((group) => (
                                <div key={group.title} className="p-3.5 rounded-xl bg-gray-50 dark:bg-[#0b1120] border border-gray-100 dark:border-white/5 space-y-2">
                                    <div className="text-xs font-bold uppercase tracking-wider text-primary">
                                        {group.title}
                                    </div>
                                    <div className="space-y-1.5">
                                        {group.permissions.map((p) => {
                                            const active = (form.permissions || []).includes(p.key) || form.role === "admin";
                                            return (
                                                <label key={p.key} className="flex items-center gap-2.5 text-xs text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                                                    <input
                                                        type="checkbox"
                                                        disabled={form.role === "admin"}
                                                        checked={active}
                                                        onChange={() => togglePermission(p.key)}
                                                        className="rounded accent-primary w-4 h-4 cursor-pointer"
                                                    />
                                                    <span>{p.label}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-2 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                            <input type="checkbox" checked={Boolean(form.is_active)} onChange={e => set("is_active", e.target.checked)} className="rounded accent-primary w-4 h-4" />
                            Conta ativa (permitir autenticação)
                        </label>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                    <button onClick={() => setIsOpen(false)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || (!editing && (!form.email || !form.password))}
                        className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {saving ? "A guardar..." : "Guardar Utilizador"}
                    </button>
                </div>
            </Modal>

            <DeleteDialog
                isOpen={!!deleting}
                onClose={() => setDeleting(null)}
                onConfirm={handleDelete}
                title="Remover Utilizador"
                description={`A conta ${deleting?.email} e todas as suas permissões serão removidas permanentemente.`}
            />
        </div>
    );
}