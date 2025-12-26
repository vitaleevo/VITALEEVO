"use client";

import { useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Clock,
    CheckCircle,
    XCircle,
    Truck,
    Package,
    Search,
    Eye,
    TrendingUp,
    ShoppingBag,
    AlertCircle,
    Filter,
    Loader2
} from "lucide-react";
import { useState } from "react";
import { formatDate, formatCurrency } from "@/shared/utils/format";
import OrderDetailModal from "@/shared/components/OrderDetailModal";

const ORDERS_PER_PAGE = 20;

export default function AdminOrdersPage() {
    const stats = useQuery(api.orders.getStats);

    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { results: orders, status: paginationStatus, loadMore } = usePaginatedQuery(
        api.orders.getPaginated,
        { status: statusFilter },
        { initialNumItems: ORDERS_PER_PAGE }
    );

    if (!orders || !stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // Client-side search (since full-text search is complex on nested objects in Convex without indexes)
    const filteredOrders = orders.filter(order => {
        const matchesSearch = searchTerm === "" ||
            order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shippingAddress.name.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'paid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'processing': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'shipped': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'cancelled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="w-4 h-4" />;
            case 'paid': return <CheckCircle className="w-4 h-4" />;
            case 'processing': return <Package className="w-4 h-4" />;
            case 'shipped': return <Truck className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            case 'cancelled': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const handleViewOrder = (order: any) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Pedidos
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Acompanhe vendas e gerencie o fluxo de entregas.
                    </p>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Receita Total</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className="bg-white dark:bg-[#151e32] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-yellow-500/10 text-yellow-500" title="Aguardando Pagamento">
                            <AlertCircle className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Pendentes</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.pendingOrders}</p>
                </div>

                <div className="bg-white dark:bg-[#151e32] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-green-500/10 text-green-500">
                            <ShoppingBag className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Vendas Hoje</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.ordersToday}</p>
                </div>

                <div className="bg-white dark:bg-[#151e32] p-6 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 rounded-2xl bg-gray-500/10 text-gray-500">
                            <Package className="w-6 h-6" />
                        </div>
                        <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Total Pedidos</span>
                    </div>
                    <p className="text-2xl font-black text-gray-900 dark:text-white">{stats.totalOrders}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/80 dark:bg-[#151e32]/80 backdrop-blur-md p-4 rounded-3xl border border-gray-100 dark:border-white/5 flex flex-col md:flex-row gap-4 sticky top-4 z-20 shadow-xl shadow-black/5">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nº do pedido ou cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent focus:border-primary focus:bg-white dark:focus:bg-surface-dark outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-10 py-3 rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent outline-none focus:border-primary text-sm font-bold cursor-pointer appearance-none min-w-[180px]"
                        >
                            <option value="all">Filtro: Todos</option>
                            <option value="pending">Pendente</option>
                            <option value="paid">Pago</option>
                            <option value="processing">Em Preparação</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregue</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-white dark:bg-[#151e32] rounded-[2.5rem] border border-gray-100 dark:border-white/5 overflow-hidden shadow-2xl shadow-gray-200/50 dark:shadow-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Pedido</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Cliente</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Data</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest">Status</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Total</th>
                                <th className="px-8 py-5 font-bold text-gray-500 text-xs uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 text-gray-400">
                                            <Package className="w-12 h-12 opacity-20" />
                                            <p className="font-medium">Nenhum pedido encontrado com estes filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                                        onClick={() => handleViewOrder(order)}
                                    >
                                        <td className="px-8 py-6">
                                            <span className="font-mono font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg tracking-tighter">#{order.orderNumber}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <p className="font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">{order.shippingAddress.name}</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress.city}</p>
                                        </td>
                                        <td className="px-8 py-6 text-sm text-gray-600 dark:text-gray-400">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${getStatusColor(order.status)}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status === 'pending' && 'Pendente'}
                                                {order.status === 'paid' && 'Pago'}
                                                {order.status === 'processing' && 'Processando'}
                                                {order.status === 'shipped' && 'Enviado'}
                                                {order.status === 'delivered' && 'Entregue'}
                                                {order.status === 'cancelled' && 'Cancelado'}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900 dark:text-white">
                                            {formatCurrency(order.total)}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewOrder(order);
                                                }}
                                                className="p-3 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-400 hover:text-primary hover:bg-primary/10 transition-all border border-transparent hover:border-primary/20"
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

                {/* Pagination / Load More */}
                {paginationStatus !== 'Exhausted' && (
                    <div className="p-8 flex justify-center border-t border-gray-100 dark:border-white/5">
                        <button
                            onClick={() => loadMore(ORDERS_PER_PAGE)}
                            disabled={paginationStatus === 'LoadingMore'}
                            className="inline-flex items-center gap-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {paginationStatus === 'LoadingMore' ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    <span>Carregando...</span>
                                </>
                            ) : (
                                <span>Ver Mais Pedidos</span>
                            )}
                        </button>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <OrderDetailModal
                isOpen={isModalOpen}
                order={selectedOrder}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
