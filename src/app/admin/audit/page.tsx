"use client";

import React, { useMemo, useState } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Loading, ErrorBox, Empty, Table, Td, Select, inputClass } from "@/shared/components/admin/ui";
import { formatDate } from "@/shared/utils/format";

export default function AdminAuditPage() {
    const { token } = useAuth();
    const { data: page, isLoading, error } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.audit.list(token as string, { page_size: 100 }),
    });
    const [actionFilter, setActionFilter] = useState("");
    const [search, setSearch] = useState("");

    const logs = useMemo(() => {
        let list = page?.results ?? [];
        if (actionFilter) list = list.filter((l: any) => l.action === actionFilter);
        const q = search.trim().toLowerCase();
        if (q) list = list.filter((l: any) => `${l.action} ${l.resourceType ?? l.resource_type} ${l.resourceId ?? l.resource_id} ${l.userEmail ?? l.user_email ?? ""}`.toLowerCase().includes(q));
        return list;
    }, [page, actionFilter, search]);

    const str = (v: unknown) => String(v ?? "");

    const actions = useMemo(() => Array.from(new Set((page?.results ?? []).map((l: any) => l.action))) as string[], [page]);

    if (isLoading) return <Loading />;
    if (error) return <ErrorBox message={error} />;

    return (
        <div>
            <AdminHeader title="Auditoria" subtitle="Registos imutáveis de ações sensíveis" />

            <div className="flex flex-wrap gap-4 mb-6">
                <Select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="max-w-xs">
                    <option value="">Todas as ações</option>
                    {actions.map(a => <option key={a} value={a}>{a}</option>)}
                </Select>
                <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Pesquisar..."
                    className={`${inputClass} max-w-xs`}
                />
            </div>

            <Table headers={["Ação", "Recurso", "Utilizador", "Detalhes", "Data"]}>
                {logs.map((l: any) => (
                    <tr key={l.id}>
                        <Td className="font-mono text-xs font-bold text-primary">{l.action}</Td>
                        <Td>
                            <p className="font-bold text-gray-900 dark:text-white">{str(l.resourceType ?? l.resource_type)}</p>
                            {str(l.resourceId ?? l.resource_id) ? <p className="text-xs text-gray-400 font-mono">{str(l.resourceId ?? l.resource_id).slice(0, 8)}…</p> : null}
                        </Td>
                        <Td>{str(l.userEmail ?? l.user_email) || "—"}</Td>
                        <Td className="max-w-xs truncate text-gray-400">{JSON.stringify(l.details || {})}</Td>
                        <Td className="text-gray-400">{formatDate(l.createdAt || l.created_at)}</Td>
                    </tr>
                ))}
                {!logs.length && <tr><td colSpan={5}><Empty /></td></tr>}
            </Table>
        </div>
    );
}