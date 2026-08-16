"use client";

import { useState } from "react";
import { useQuery, usePaginatedQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
    FileText, Eye, Loader2, Search, Filter, MessageSquare,
    UserPlus, CheckCircle2, XCircle, CalendarClock, TrendingUp,
    Package, Send, Plus, Trash2,
} from "lucide-react";
import { formatDate } from "@/shared/utils/format";

const QUOTES_PER_PAGE = 20;

const STATUS_LABELS: Record<string, string> = {
    new: "Novo",
    qualified: "Qualificado",
    proposal_sent: "Proposta enviada",
    negotiating: "Em negociação",
    accepted: "Aceite",
    lost: "Perdido",
    cancelled: "Cancelado",
    fulfilled: "Executado",
};

const STATUS_COLORS: Record<string, string> = {
    new: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    qualified: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
    proposal_sent: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    negotiating: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    accepted: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    lost: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-200 text-gray-700 dark:bg-white/10 dark:text-gray-400",
    fulfilled: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

const SOURCE_LABELS: Record<string, string> = {
    store: "Loja",
    site: "Site",
    contact: "Contacto",
    whatsapp: "WhatsApp",
};

export default function AdminQuotesPage() {
    const { token } = useAuth();
    const t = token || "";
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selected, setSelected] = useState<any>(null);

    const stats = useQuery(api.quotes.getStats, token ? { token: t } : "skip");
    const staff = useQuery(api.users.getStaffList, token ? { token: t } : "skip");
    const detail = useQuery(api.quotes.getById, selected && token ? { token: t, id: selected } : "skip");

    const { results: quotes, status: paginationStatus, loadMore } = usePaginatedQuery(
        api.quotes.listPaginated,
        token ? { status: statusFilter, token: t } : "skip",
        { initialNumItems: QUOTES_PER_PAGE }
    );

    const assign = useMutation(api.quotes.assign);
    const setStatus = useMutation(api.quotes.setStatus);
    const setFollowUp = useMutation(api.quotes.setFollowUp);
    const setProposal = useMutation(api.quotes.setProposal);
    const addTask = useMutation(api.quotes.addTask);
    const updateTask = useMutation(api.quotes.updateTask);

    const [newTask, setNewTask] = useState("");
    const [proposalNote, setProposalNote] = useState("");
    const [proposalTotal, setProposalTotal] = useState("");
    const [busy, setBusy] = useState(false);

    if (!quotes || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filtered = quotes.filter((q) => {
        const s = searchTerm.toLowerCase();
        return (
            s === "" ||
            q.publicId.toLowerCase().includes(s) ||
            q.name.toLowerCase().includes(s) ||
            (q.email || "").toLowerCase().includes(s) ||
            (q.company || "").toLowerCase().includes(s)
        );
    });

    const run = async (fn: Promise<any>) => {
        setBusy(true);
        try {
            await fn;
        } catch (e: any) {
            alert(e?.message || "Erro na operação");
        } finally {
            setBusy(false);
        }
    };

    const quote = detail?.quote;
    const waLink = quote
        ? `https://wa.me/${quote.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
            `Olá ${quote.name}! A VitalEvo recebeu o seu pedido de cotação (${quote.publicId}) e queremos apresentar-lhe a melhor proposta.`
        )}`
        : "#";

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Cotações
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Funil comercial — de pedido a proposta executada.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                    { label: "Total", value: stats.total, icon: FileText, color: "bg-primary/10 text-primary" },
                    { label: "Novos", value: stats.new, icon: TrendingUp, color: "bg-blue-500/10 text-blue-500" },
                    { label: "Propostas", value: stats.proposal_sent, icon: Send, color: "bg-purple-500/10 text-purple-500" },
                    { label: "Aceites", value: stats.accepted, icon: CheckCircle2, color: "bg-green-500/10 text-green-500" },
                    { label: "Executadas", value: stats.fulfilled, icon: Package, color: "bg-emerald-500/10 text-emerald-500" },
                ].map((s) => (
                    <div key={s.label} className="bg-white dark:bg-[#151e32] p-5 rounded-[1.75rem] border border-gray-100 dark:border-white/5 shadow-sm">
                        <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2.5 rounded-xl ${s.color}`}>
                                <s.icon className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">{s.label}</span>
                        </div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-[#151e32]/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 sticky top-4 z-20 shadow-xl shadow-black/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por referência, nome, empresa ou e-mail..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-surface-dark outline-none transition-all text-sm"
                    />
                </div>
                <div className="relative">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="pl-10 pr-10 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent outline-none focus:border-primary text-sm font-bold cursor-pointer appearance-none min-w-[200px]"
                    >
                        <option value="all">Filtro: Todos</option>
                        {Object.entries(STATUS_LABELS).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Referência</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Data</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Origem</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Estado</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <FileText className="w-12 h-12 opacity-20" />
                                            <p className="font-medium">Nenhuma cotação encontrada com estes filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((q) => (
                                    <tr
                                        key={q._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                        onClick={() => setSelected(q._id)}
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg tracking-tighter">{q.publicId}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{q.name}</p>
                                            <p className="text-xs text-gray-500">{q.company || q.email}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(q.createdAt)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-gray-500 uppercase">{SOURCE_LABELS[q.source] || q.source}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[q.status]}`}>
                                                {STATUS_LABELS[q.status] || q.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setSelected(q._id); }}
                                                className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all"
                                                aria-label="Abrir detalhe"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {paginationStatus !== "Exhausted" && (
                    <div className="p-8 flex justify-center border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => loadMore(QUOTES_PER_PAGE)}
                            disabled={paginationStatus === "LoadingMore"}
                            className="inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {paginationStatus === "LoadingMore" ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Carregando...
                                </>
                            ) : (
                                "Ver Mais Cotações"
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {quote && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
                    <div
                        className="bg-white dark:bg-[#151e32] rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-8 border-b border-gray-100 dark:border-white/5 flex items-start justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="font-mono font-black text-primary bg-primary/5 px-3 py-1 rounded-lg">{quote.publicId}</span>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[quote.status]}`}>
                                        {STATUS_LABELS[quote.status] || quote.status}
                                    </span>
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 dark:text-white">{quote.name}</h2>
                                <p className="text-sm text-gray-500">
                                    {quote.company && <>{quote.company} · </>}
                                    {quote.email} · {quote.phone}
                                </p>
                                {quote.message && (
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-white/5 rounded-xl p-3">
                                        {quote.message}
                                    </p>
                                )}
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"
                                aria-label="Fechar"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Ações rápidas */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <a
                                    href={waLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-500/20"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Abrir WhatsApp
                                </a>
                                <div className="flex items-center gap-2">
                                    <UserPlus className="w-4 h-4 text-gray-400 shrink-0" />
                                    <select
                                        value={quote.assignedTo || ""}
                                        onChange={(e) => run(assign({ token: t, id: quote._id, assignedTo: e.target.value ? (e.target.value as any) : undefined }))}
                                        disabled={busy}
                                        className="flex-1 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary px-3 py-3 text-sm font-bold outline-none"
                                    >
                                        <option value="">Sem responsável</option>
                                        {staff?.map((u) => (
                                            <option key={u._id as string} value={u._id as string}>
                                                {u.name} ({u.role})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Estado */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Mudar estado</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(STATUS_LABELS).map(([key, label]) => (
                                        <button
                                            key={key}
                                            onClick={() => run(setStatus({ token: t, id: quote._id, status: key as any }))}
                                            disabled={busy || key === quote.status}
                                            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 ${key === quote.status ? "bg-primary text-white" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary"}`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {quote.acceptedAt && (
                                    <p className="mt-2 text-xs text-gray-500">Aceite em {formatDate(quote.acceptedAt)}</p>
                                )}
                            </div>

                            {/* Proposta */}
                            <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-5">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                                    <Send className="w-4 h-4 text-primary" />
                                    Enviar proposta
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        placeholder="Total (Kz)"
                                        value={proposalTotal}
                                        onChange={(e) => setProposalTotal(e.target.value)}
                                        className="rounded-xl bg-white dark:bg-[#151e32] border border-gray-200 dark:border-white/10 px-4 py-3 text-sm font-bold outline-none focus:border-primary"
                                    />
                                    <input
                                        type="text"
                                        placeholder="Nota da proposta"
                                        value={proposalNote}
                                        onChange={(e) => setProposalNote(e.target.value)}
                                        className="sm:col-span-1 rounded-xl bg-white dark:bg-[#151e32] border border-gray-200 dark:border-white/10 px-4 py-3 text-sm outline-none focus:border-primary"
                                    />
                                    <button
                                        onClick={() => run(setProposal({
                                            token: t, id: quote._id,
                                            proposalNote: proposalNote || "Proposta comercial VitalEvo",
                                            quotedTotal: Number(proposalTotal) || 0,
                                        }))}
                                        disabled={busy}
                                        className="rounded-xl bg-primary hover:bg-primary-dark text-white px-4 py-3 text-sm font-bold transition-all"
                                    >
                                        Registar proposta
                                    </button>
                                </div>
                                {quote.proposalNote && (
                                    <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                                        <strong>Proposta atual:</strong> {quote.proposalNote}
                                        {quote.quotedTotal ? ` — ${quote.quotedTotal.toLocaleString("pt-AO")} Kz` : ""}
                                    </p>
                                )}
                            </div>

                            {/* Itens */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Itens ({detail.items.length})</h3>
                                <div className="space-y-2">
                                    {detail.items.map((item: any) => (
                                        <div key={item._id} className="flex items-center justify-between gap-4 rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">{item.name}</p>
                                                {item.sku && <p className="text-xs text-gray-500">Ref: {item.sku}</p>}
                                            </div>
                                            <span className="font-black text-gray-900 dark:text-white">× {item.quantity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Tarefas */}
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Tarefas</h3>
                                <div className="space-y-2 mb-3">
                                    {detail.tasks.map((t: any) => (
                                        <div key={t._id} className="flex items-center justify-between gap-3 rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => run(updateTask({
                                                        token: t, taskId: t._id,
                                                        status: t.status === "done" ? "todo" : "done",
                                                    }))}
                                                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${t.status === "done" ? "bg-green-500 border-green-500" : "border-gray-300 dark:border-gray-600"}`}
                                                    aria-label="Concluir tarefa"
                                                >
                                                    {t.status === "done" && <CheckCircle2 className="w-4 h-4 text-white" />}
                                                </button>
                                                <span className={`text-sm font-medium ${t.status === "done" ? "line-through text-gray-400" : "text-gray-900 dark:text-white"}`}>
                                                    {t.title}
                                                </span>
                                            </div>
                                            {t.dueAt && <span className="text-xs text-gray-500">{formatDate(t.dueAt)}</span>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Nova tarefa..."
                                        value={newTask}
                                        onChange={(e) => setNewTask(e.target.value)}
                                        className="flex-1 rounded-xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary px-4 py-3 text-sm outline-none"
                                    />
                                    <button
                                        onClick={() => {
                                            if (!newTask.trim()) return;
                                            run(addTask({ token: t, quoteId: quote._id, title: newTask.trim() }));
                                            setNewTask("");
                                        }}
                                        disabled={busy}
                                        className="px-4 py-3 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-bold flex items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Adicionar
                                    </button>
                                </div>
                            </div>

                            {/* Movimentos de stock */}
                            {detail.movements.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Movimentos de stock</h3>
                                    <div className="space-y-2">
                                        {detail.movements.map((m: any) => (
                                            <div key={m._id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 px-4 py-2.5 text-sm">
                                                <span className="capitalize text-gray-600 dark:text-gray-400">{m.type}</span>
                                                <span className={`font-black ${m.quantity > 0 ? "text-green-500" : "text-red-500"}`}>
                                                    {m.quantity > 0 ? "+" : ""}{m.quantity}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}