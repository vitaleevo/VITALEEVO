"use client";

import React, { useState } from "react";
import { Send, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Empty, Table, Td, Field, TextArea, inputClass } from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { PermissionGuard } from "@/shared/components/admin/PermissionGuard";
import { formatDate } from "@/shared/utils/format";

export default function AdminNewsletterPage() {
    return (
        <PermissionGuard permission="contacts:manage">
            <AdminNewsletterContent />
        </PermissionGuard>
    );
}

export function AdminNewsletterContent() {
    const { token } = useAuth();
    const { data: subscribers, isLoading, error, refetch } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.newsletter.list(token as string),
    });
    const [subject, setSubject] = useState("");
    const [body, setBody] = useState("");
    const [sending, setSending] = useState(false);
    const [deleting, setDeleting] = useState<any | null>(null);

    const handleBroadcast = async () => {
        if (!token) return;
        setSending(true);
        try {
            const { sent } = await api.newsletter.broadcast(subject, body, token);
            toast.success(`E-mail enviado para ${sent} subscritores`);
            setSubject("");
            setBody("");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao enviar");
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async () => {
        if (!token || !deleting) return;
        try {
            await api.newsletter.remove(deleting.id, token);
            toast.success("Subscritor removido");
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao remover");
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader title="Newsletter" subtitle={`${subscribers?.length ?? 0} subscritores ativos`} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
                <Card className="p-6 xl:col-span-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Enviar para todos</h3>
                    <div className="space-y-4">
                        <Field label="Assunto" required>
                            <input className={inputClass} value={subject} onChange={e => setSubject(e.target.value)} />
                        </Field>
                        <Field label="Corpo" required>
                            <TextArea rows={6} value={body} onChange={e => setBody(e.target.value)} />
                        </Field>
                        <button
                            disabled={sending || !subject.trim() || !body.trim()}
                            onClick={handleBroadcast}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            {sending ? "A enviar..." : `Enviar para ${subscribers?.length ?? 0} subscritores`}
                        </button>
                    </div>
                </Card>

                <div className="xl:col-span-2">
                    <Table headers={["Email", "Subscrito em", "Estado", ""]}>
                        {(subscribers || []).map((s: any) => (
                            <tr key={s.id}>
                                <Td className="font-bold text-gray-900 dark:text-white">{s.email}</Td>
                                <Td className="text-gray-400">{formatDate(s.subscribedAt || s.subscribed_at)}</Td>
                                <Td>
                                    {s.isActive || s.is_active ? (
                                        <span className="text-xs font-bold text-green-500">Ativo</span>
                                    ) : (
                                        <span className="text-xs font-bold text-gray-400">Inativo</span>
                                    )}
                                </Td>
                                <Td>
                                    <button onClick={() => setDeleting(s)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </Td>
                            </tr>
                        ))}
                        {!subscribers?.length && <tr><td colSpan={4}><Empty /></td></tr>}
                    </Table>
                </div>
            </div>

            <DeleteDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Remover Subscritor" description="Este email deixará de receber a newsletter." />
        </div>
    );
}