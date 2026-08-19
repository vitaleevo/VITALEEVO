"use client";

import React, { useEffect, useState } from "react";
import { KeyRound, Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Field, inputClass } from "@/shared/components/admin/ui";

export default function AdminProfilePage() {
    const { token, user } = useAuth();
    const { data: me, isLoading, error } = useApiQuery<any>(null, {
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
                first_name: (me.first_name as string) || "",
                last_name: (me.last_name as string) || "",
                phone: (me.phone as string) || "",
            });
        }
    }, [me]);

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            await api.auth.updateProfile(form, token);
            toast.success("Perfil atualizado");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao guardar perfil");
        } finally {
            setSaving(false);
        }
    };

    const handlePassword = async () => {
        if (!token) return;
        if (newPassword !== confirmPassword) {
            toast.error("As passwords não coincidem");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("A password deve ter pelo menos 8 caracteres");
            return;
        }
        setChanging(true);
        try {
            await api.auth.changePassword(oldPassword, newPassword, token);
            toast.success("Password alterada");
            setOldPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao alterar password");
        } finally {
            setChanging(false);
        }
    };

    return (
        <div>
            <AdminHeader title="O Meu Perfil" subtitle={user?.email || (me?.email as string) || ""} />

            <div className="max-w-xl space-y-6">
                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Dados pessoais</h3>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nome">
                                <input className={inputClass} value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                            </Field>
                            <Field label="Apelido">
                                <input className={inputClass} value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                            </Field>
                        </div>
                        <Field label="Telefone">
                            <input className={inputClass} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
                        </Field>
                        <div className="flex justify-end">
                            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">
                                <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar"}
                            </button>
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="flex items-center gap-2 font-bold text-gray-900 dark:text-white mb-4">
                        <KeyRound className="w-4 h-4 text-primary" /> Alterar password
                    </h3>
                    <div className="space-y-4">
                        <Field label="Password atual">
                            <input type="password" className={inputClass} value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                            <Field label="Nova password">
                                <input type="password" className={inputClass} value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                            </Field>
                            <Field label="Confirmar nova password">
                                <input type="password" className={inputClass} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                            </Field>
                        </div>
                        <div className="flex justify-end">
                            <button onClick={handlePassword} disabled={changing || !oldPassword || !newPassword || !confirmPassword} className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">
                                {changing ? "A alterar..." : "Alterar password"}
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}