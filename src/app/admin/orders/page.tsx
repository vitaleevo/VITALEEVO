"use client";

import React, { useMemo, useState } from "react";
import { Eye } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Empty, Table, Td, Badge, Select, inputClass } from "@/shared/components/admin/ui";
import OrderDetailModal from "@/shared/components/OrderDetailModal";
import { formatCurrency, formatDate } from "@/shared/utils/format";

const STATUSES = ["pending", "paid", "processing", "shipped", "delivered", "cancelled"];

export default function AdminOrdersPage() {
    const { token } = useAuth();
    const { data: page, isLoading, error, refetch } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.orders.list(token as string, { page_size: 100 }),
    });
    const [statusFilter, setStatusFilter] = useState("");
    const [selected, setSelected] = useState<any | null>(null);

    const orders = useMemo(() => {
        const list = page?.results ?? [];
        return statusFilter ? list.filter((o: any) => o.status === statusFilter) : list;
    }, [page, statusFilter]);

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader title="Encomendas" subtitle={`${orders.length} encomendas`} />

            <div className="mb-6 max-w-xs">
                <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">Todos os estados</option>
                    {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
            </div>

            <Table headers={["Número", "Cliente", "Total", "Estado", "Data", ""]}>
                {orders.map((o: any) => (
                    <tr key={o.id}>
                        <Td className="font-mono font-bold">#{o.orderNumber || o.order_number}</Td>
                        <Td>{o.guestEmail || o.guest_email || o.userEmail || o.user_email || "—"}</Td>
                        <Td className="font-bold">{formatCurrency(Number(o.total ?? 0))}</Td>
                        <Td><Badge value={o.status} /></Td>
                        <Td className="text-gray-400">{formatDate(o.createdAt || o.created_at)}</Td>
                        <Td>
                            <button
                                onClick={() => setSelected(o)}
                                className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 text-primary px-3 py-1.5 text-xs font-bold hover:bg-primary/20 transition-colors"
                            >
                                <Eye className="w-3.5 h-3.5" /> Detalhes
                            </button>
                        </Td>
                    </tr>
                ))}
                {!orders.length && (
                    <tr><td colSpan={6}><Empty label={statusFilter ? "Sem encomendas neste estado" : "Sem encomendas"} /></td></tr>
                )}
            </Table>

            <OrderDetailModal order={selected} isOpen={!!selected} onClose={() => { setSelected(null); refetch(); }} />
        </div>
    );
}