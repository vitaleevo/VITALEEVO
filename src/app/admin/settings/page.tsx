"use client";

import React, { useState } from "react";
import { Save } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Field, TextArea } from "@/shared/components/admin/ui";
import { PermissionGuard } from "@/shared/components/admin/PermissionGuard";

export default function AdminSettingsPage() {
    return (
        <PermissionGuard permission="settings:manage">
            <AdminSettingsContent />
        </PermissionGuard>
    );
}

export function AdminSettingsContent() {
    const { token } = useAuth();
    const { data: settings, isLoading, error, refetch } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.settings.get(),
    });
    const [json, setJson] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    const value = json ?? JSON.stringify(settings ?? {}, null, 2);

    const handleSave = async () => {
        if (!token) return;
        setSaving(true);
        try {
            const parsed = JSON.parse(value);
            await api.settings.update(parsed, token);
            toast.success("Configurações guardadas");
            setJson(null);
            refetch();
        } catch (err: any) {
            if (err instanceof SyntaxError) {
                toast.error("JSON inválido — verifique a sintaxe");
            } else {
                toast.error(err?.message || "Erro ao guardar");
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div>
            <AdminHeader
                title="Configurações"
                subtitle="site_config — nome do site, redes sociais, manutenção, etc."
                action={
                    <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors">
                        <Save className="w-4 h-4" /> {saving ? "A guardar..." : "Guardar"}
                    </button>
                }
            />

            <Card className="p-6 max-w-3xl">
                <Field label="site_config (JSON)">
                    <TextArea rows={20} value={value} onChange={e => setJson(e.target.value)} className="font-mono text-xs" />
                </Field>
                <p className="mt-2 text-xs text-gray-400">
                    A chave <code className="font-mono">maintenanceMode</code> controla o modo de manutenção do site.
                </p>
            </Card>
        </div>
    );
}