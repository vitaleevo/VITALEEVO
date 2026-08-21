"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Save, Shield, User, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Field, inputClass } from "@/shared/components/admin/ui";

const ROLE_LABELS: Record<string, string> = {
    admin: "Super Administrador (Acesso Total)",
    commercial: "Comercial & Vendas",
    content: "Gestor de Conteúdos & CMS",
    operations: "Operações & Catálogo",
    user: "Cliente Registado",
};

export function AdminProfileContent() {
    const { token, user } = useAuth();
    const isAdmin = user?.role === "admin" || Boolean((user as any)?.isSuperuser);

    const { data: me, isLoading, error, refetch } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.auth.me(token as string),
    });

    const [form, setForm] = useState({ first_name: "", last_name: "", phone: "" });
    const [saving, setSaving] = useState(false);
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [changing, setChanging] = useState(false);

    useEffect(() => {
        if (me) {
            setForm({
                first_name: (me.firstName as string) || (me.first_name as string) || "",
                last_name: (me.lastName as string) || (me.last_name as string) || "",
                phone: (me.phone as string) || "",
            });
        }
    }, [me]);

    if (isLoading) return <Loading label="A carregar perfil de utilizador..." />;
    if (error) return <ErrorBox message={error} />;

    const handleSave = async () => {
        if (!token || !isAdmin) return;
        setSaving(true);
        try {
            await api.auth.updateProfile(form, token);
            toast.success("Perfil atualizado com sucesso");
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao guardar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handlePassword = async () => {
        if (!token) return;
        if (!isAdmin) {
            toast.error("A sua palavra-passe corporativa é gerida exclusivamente pelo Super Administrador.");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("As novas palavras-passe não coincidem");
            return;
        }
        setChanging(true);
        try {
            await api.auth.changePassword(oldPassword, newPassword, token);
            toast.success("Palavra-passe alterada com sucesso");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao alterar palavra-passe");
        } finally {
            setChanging(false);
        }
    };

    const currentRole = me?.role || user?.role || "colaborador";
    const userPermissions: string[] = me?.permissions || user?.permissions || [];

    return (
        <div className="space-y-6">
            <AdminHeader
                title="O Meu Perfil"
                subtitle={`Conta ativa: ${me?.email || user?.email || ""}`}
            />

            <div className="max-w-2xl space-y-6">
                {/* Aviso corporativo para funcionários não-administradores */}
                {!isAdmin && (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3.5">
                        <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                        <div className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                            <p className="font-bold text-sm mb-0.5">Perfil de Acesso Corporativo</p>
                            O seu nome de utilizador, credenciais de acesso e permissões no sistema foram configurados pelo <strong>Super Administrador</strong> e encontram-se bloqueados para edição direta. Para qualquer atualização cadastral, solicite ao administrador do sistema.
                        </div>
                    </div>
                )}

                {/* Cartão de Dados Cadastrais */}
                <Card className="p-6 space-y-5">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                            <User className="w-4 h-4 text-primary" /> Identificação & Dados Pessoais
                        </h3>
                        <span className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider bg-primary/10 text-primary">
                            {ROLE_LABELS[currentRole] || currentRole}
                        </span>
                    </div>

                    <div className="space-y-4">
                        <Field label="E-mail / Nome de Utilizador (Username)">
                            <input
                                className={`${inputClass} bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500`}
                                value={me?.email || user?.email || ""}
                                disabled
                                readOnly
                            />
                        </Field>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Primeiro Nome">
                                <input
                                    className={`${inputClass} ${!isAdmin ? "bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500" : ""}`}
                                    value={form.first_name ?? ""}
                                    disabled={!isAdmin}
                                    readOnly={!isAdmin}
                                    onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                                />
                            </Field>
                            <Field label="Apelido / Sobrenome">
                                <input
                                    className={`${inputClass} ${!isAdmin ? "bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500" : ""}`}
                                    value={form.last_name ?? ""}
                                    disabled={!isAdmin}
                                    readOnly={!isAdmin}
                                    onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                                />
                            </Field>
                        </div>

                        <Field label="Contacto Telefónico">
                            <input
                                className={`${inputClass} ${!isAdmin ? "bg-gray-100 dark:bg-white/5 cursor-not-allowed text-gray-500" : ""}`}
                                value={form.phone ?? ""}
                                disabled={!isAdmin}
                                readOnly={!isAdmin}
                                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            />
                        </Field>

                        {isAdmin && (
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm"
                                >
                                    <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar Alterações"}
                                </button>
                            </div>
                        )}
                    </div>
                </Card>

                {/* Cartão de Permissões Atribuídas */}
                <Card className="p-6 space-y-4">
                    <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                        <Shield className="w-4 h-4 text-primary" /> Permissões Ativas na Plataforma
                    </h3>
                    {isAdmin ? (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Acesso total de Super Administrador (todas as operações autorizadas).
                        </p>
                    ) : userPermissions.length > 0 ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                            {userPermissions.map(p => (
                                <span
                                    key={p}
                                    className="inline-flex items-center gap-1 text-xs font-mono font-semibold px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10"
                                >
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    {p}
                                </span>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-gray-400">Sem permissões granulares adicionais associadas.</p>
                    )}
                </Card>

                {/* Cartão de Senha (Apenas Super Admin pode alterar a sua própria senha aqui; funcionários têm senha gerida centralmente) */}
                {isAdmin && (
                    <Card className="p-6 space-y-4">
                        <h3 className="flex items-center gap-2 font-bold text-base text-gray-900 dark:text-white">
                            <KeyRound className="w-4 h-4 text-primary" /> Alterar Palavra-passe
                        </h3>
                        <div className="space-y-4">
                            <Field label="Palavra-passe Atual">
                                <input
                                    type="password"
                                    className={inputClass}
                                    value={oldPassword}
                                    onChange={e => setOldPassword(e.target.value)}
                                    placeholder="••••••••"
                                />
                            </Field>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Nova Palavra-passe">
                                    <input
                                        type="password"
                                        className={inputClass}
                                        value={newPassword}
                                        onChange={e => setNewPassword(e.target.value)}
                                        placeholder="Mínimo 8 caracteres"
                                    />
                                </Field>
                                <Field label="Confirmar Nova Palavra-passe">
                                    <input
                                        type="password"
                                        className={inputClass}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="Repita a nova palavra-passe"
                                    />
                                </Field>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={handlePassword}
                                    disabled={changing || !oldPassword || !newPassword || !confirmPassword}
                                    className="inline-flex items-center gap-2 rounded-xl bg-gray-900 dark:bg-white px-6 py-2.5 text-sm font-bold text-white dark:text-black hover:opacity-90 disabled:opacity-50 transition-colors"
                                >
                                    <KeyRound className="w-4 h-4" /> {changing ? "A alterar..." : "Atualizar Palavra-passe"}
                                </button>
                            </div>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    );
}

export default function AdminProfilePage() {
    return <AdminProfileContent />;
}