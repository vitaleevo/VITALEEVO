"use client";

import React, { useMemo, useState } from "react";
import { Eye, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Modal, Loading, ErrorBox, Empty, Table, Td } from "@/shared/components/admin/ui";
import DeleteDialog from "@/shared/components/DeleteDialog";
import { PermissionGuard } from "@/shared/components/admin/PermissionGuard";
import { formatDate } from "@/shared/utils/format";

export default function AdminContactsPage() {
    return (
        <PermissionGuard permission="contacts:manage">
            <AdminContactsContent />
        </PermissionGuard>
    );
}

export function AdminContactsContent() {
    const { token } = useAuth();
    const { data: contacts, isLoading, error, refetch } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.contacts.list(token as string).then((d: any) => d.results ?? d),
    });
    const [selected, setSelected] = useState<any | null>(null);
    const [deleting, setDeleting] = useState<any | null>(null);

    const unread = useMemo(() => (contacts || []).filter((c: any) => !c.isRead && c.isRead !== undefined && !c.is_read).length, [contacts]);

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    const markRead = async (c: any) => {
        if (!token) return;
        try {
            await api.contacts.markAsRead(c.id, token);
            refetch();
        } catch (err) {
            toast.error("Erro ao marcar como lida");
        }
    };

    const handleDelete = async () => {
        if (!token || !deleting) return;
        try {
            await api.contacts.remove(deleting.id, token);
            toast.success("Mensagem removida");
            setDeleting(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao remover");
        }
    };

    return (
        <div>
            <AdminHeader title="Contactos" subtitle={`${contacts?.length ?? 0} mensagens${unread ? ` · ${unread} por ler` : ""}`} />

            <Table headers={["Nome", "Email", "Assunto", "Estado", "Data", ""]}>
                {(contacts || []).map((c: any) => (
                    <tr key={c.id}>
                        <Td>
                            <p className="font-bold text-gray-900 dark:text-white">{c.name}</p>
                            <p className="text-xs text-gray-400">{c.phone || ""}</p>
                        </Td>
                        <Td>{c.email}</Td>
                        <Td className="max-w-xs truncate">{c.subject}</Td>
                        <Td>
                            {c.isRead || c.is_read ? (
                                <span className="text-xs font-bold text-gray-400">Lida</span>
                            ) : (
                                <span className="text-xs font-bold text-yellow-500">Por ler</span>
                            )}
                        </Td>
                        <Td className="text-gray-400">{formatDate(c.createdAt || c.created_at)}</Td>
                        <Td>
                            <div className="flex gap-1">
                                <button onClick={() => { setSelected(c); if (!c.isRead && !c.is_read) markRead(c); }} className="p-1.5 rounded-lg text-gray-400 hover:text-primary hover:bg-primary/10 transition-colors">
                                    <Eye className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeleting(c)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-colors">
                                    <MailCheck className="w-4 h-4" />
                                </button>
                            </div>
                        </Td>
                    </tr>
                ))}
                {!contacts?.length && <tr><td colSpan={6}><Empty /></td></tr>}
            </Table>

            <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={selected?.subject || "Mensagem"}>
                {selected && (
                    <div className="space-y-4">
                        <div className="text-sm">
                            <p className="font-bold text-gray-900 dark:text-white">{selected.name}</p>
                            <p className="text-gray-500">{selected.email} {selected.phone && `· ${selected.phone}`}</p>
                            {selected.company && <p className="text-gray-500">{selected.company}</p>}
                            <p className="text-xs text-gray-400 mt-1">{formatDate(selected.createdAt || selected.created_at)}</p>
                        </div>
                        <div className="rounded-xl bg-gray-50 dark:bg-white/5 p-4 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                            {selected.message}
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setDeleting(selected)} className="rounded-xl px-5 py-2.5 text-sm font-bold text-red-500 hover:bg-red-500/10 transition-colors">
                                Remover
                            </button>
                            <button onClick={() => setSelected(null)} className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark transition-colors">
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            <DeleteDialog isOpen={!!deleting} onClose={() => setDeleting(null)} onConfirm={handleDelete} title="Remover Mensagem" description="Esta mensagem será removida permanentemente." />
        </div>
    );
}