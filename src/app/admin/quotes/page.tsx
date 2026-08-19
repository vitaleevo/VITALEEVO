"use client";

import React, { useMemo, useState } from "react";
import { Eye, UserPlus, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Modal, Loading, ErrorBox, Empty, Table, Td, Badge, Field, Select, inputClass } from "@/shared/components/admin/ui";
import { formatDate } from "@/shared/utils/format";

const QUOTE_STATUSES = ["new", "in_review", "proposal_sent", "accepted", "fulfilled", "rejected"];

export default function AdminQuotesPage() {
    const { token } = useAuth();
    const { data: page, isLoading, error, refetch } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.quotes.list(token as string, { page_size: 100 }),
    });
    const { data: staffList } = useApiQuery<any[]>(null, { deps: [token], enabled: !!token, fetcher: () => api.users.getStaffList(token as string) });
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);

    const quotes = useMemo(() => {
        const list = page?.results ?? [];
        return statusFilter ? list.filter((q: any) => q.status === statusFilter) : list;
    }, [page, statusFilter]);

    const handleStatus = async (status: string) => {
        if (!token || !selected) return;
        setSaving(true);
        try {
            await api.quotes.setStatus(selected.id, status, token);
            toast.success("Estado atualizado");
            setSelected(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao atualizar estado");
        } finally {
            setSaving(false);
        }
    };

    const handleAssign = async (userId: string) => {
        if (!token || !selected) return;
        try {
            await api.quotes.assign(selected.id, userId, token);
            toast.success(userId ? "Cotação atribuída" : "Atribuição limpa");
            setSelected(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.message || "Erro ao atribuir");
        }
    };

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader title="Cotações" subtitle={`${quotes.length} pedidos de cotação`} />

            <div className="mb-6 max-w-xs">
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Todos os estados</option>
                    {QUOTE_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </Select>
            </div>

            <Table headers={["Referência", "Cliente", "Telefone", "Estado", "Atribuída a", "Follow-up", ""]}>
                {quotes.map((q: any) => (
                    <tr key={q.id}>
                        <Td className="font-mono text-xs font-bold">{q.publicId || q.public_id}</Td>
                        <Td>
                            <p className="font-bold text-gray-900 dark:text-white">{q.name}</p>
                            <p className="text-xs text-gray-400">{q.email}</p>
                        </Td>
                        <Td>{q.phone}</Td>
                        <Td><Badge value={q.status} /></Td>
                        <Td>{q.assignedToName || q.assigned_to_name || "—"}</Td>
                        <Td className="text-gray-400">{q.nextFollowUpAt || q.next_follow_up_at ? formatDate(q.nextFollowUpAt || q.next_follow_up_at) : "—"}</Td>
                        <Td>
                            <button
                                onClick={() => setSelected(q)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors"
                            >
                                <Eye className="w-3.5 h-3.5" /> Gerir
                            </button>
                        </Td>
                    </tr>
                ))}
                {!quotes.length && (
                    <tr><td colSpan={7}><Empty /></td></tr>
                )}
            </Table>

            <QuoteDetailModal
                quote={selected}
                staffList={staffList || []}
                onClose={() => setSelected(null)}
                onStatus={handleStatus}
                onAssign={handleAssign}
                saving={saving}
            />
        </div>
    );
}

function QuoteDetailModal({ quote, staffList, onClose, onStatus, onAssign, saving }: {
    quote: any | null;
    staffList: any[];
    onClose: () => void;
    onStatus: (status: string) => void;
    onAssign: (userId: string) => void;
    saving: boolean;
}) {
    const [status, setStatus] = useState("new");
    const [assigned, setAssigned] = useState("");

    if (!quote) return null;

    return (
        <Modal isOpen={!!quote} onClose={onClose} title={`Cotação ${quote.publicId || quote.public_id}`} wide>
            <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Cliente</p>
                        <p className="font-bold text-gray-900 dark:text-white">{quote.name}</p>
                        <p className="text-gray-500">{quote.email}</p>
                        <p className="text-gray-500">{quote.phone}</p>
                        {quote.company && <p className="text-gray-500">{quote.company}</p>}
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Mensagem</p>
                        <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{quote.message || "—"}</p>
                    </div>
                </div>

                <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Itens ({quote.items?.length || 0})</p>
                    <div className="space-y-1.5">
                        {(quote.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between text-sm bg-gray-50 dark:bg-white/5 rounded-lg px-3 py-2">
                                <span className="font-medium text-gray-800 dark:text-gray-200">{item.name}</span>
                                <span className="text-gray-400">x{item.quantity}</span>
                            </div>
                        ))}
                        {!quote.items?.length && <p className="text-sm text-gray-400">Sem itens</p>}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Field label="Mudar estado">
                        <Select value={status} onChange={e => setStatus(e.target.value)}>
                            {QUOTE_STATUSES.map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                        </Select>
                    </Field>
                    <Field label="Atribuir a">
                        <div className="flex gap-2">
                            <Select value={assigned} onChange={e => setAssigned(e.target.value)}>
                                <option value="">—</option>
                                {staffList.map((u: any) => <option key={u.id} value={u.id}>{u.firstName || u.first_name || u.email}</option>)}
                            </Select>
                            <button
                                onClick={() => onAssign(assigned)}
                                className="shrink-0 rounded-xl bg-primary/10 text-primary px-4 text-sm font-bold hover:bg-primary/20 transition-colors"
                                title="Atribuir"
                            >
                                <UserPlus className="w-4 h-4" />
                            </button>
                        </div>
                    </Field>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="rounded-xl px-5 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        Fechar
                    </button>
                    <button
                        disabled={saving || status === quote.status}
                        onClick={() => onStatus(status)}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                        <CalendarClock className="w-4 h-4" />
                        {saving ? "A guardar..." : "Atualizar estado"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}