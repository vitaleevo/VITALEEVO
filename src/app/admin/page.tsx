"use client";

import React from 'react';
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    TrendingUp,
    Users,
    ShoppingBag,
    DollarSign,
    Package,
    MessageSquare,
    Clock,
    ArrowRight,
    Award,
    AlertTriangle
} from "lucide-react";
import Link from 'next/link';
import { formatDate } from "@/shared/utils/format";

export default function AdminDashboard() {
    const stats = useQuery(api.dashboard.getStats);

    if (!stats) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const cards = [
        {
            label: "Vendas Totais",
            value: `KZ ${stats.totalSales.toLocaleString('pt-AO')}`,
            icon: DollarSign,
            color: "text-green-500",
            bg: "bg-green-500/10",
            sub: "Total faturado"
        },
        {
            label: "Pedidos",
            value: stats.orderCount.toString(),
            icon: ShoppingBag,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            sub: `${stats.pendingOrders} pendentes`
        },
        {
            label: "Clientes",
            value: stats.userCount.toString(),
            icon: Users,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            sub: "Usuários registrados"
        },
        {
            label: "Produtos",
            value: stats.productCount.toString(),
            icon: Package,
            color: "text-orange-500",
            bg: "bg-orange-500/10",
            sub: `${stats.outOfStock} sem stock`
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'paid': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'delivered': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Visão Geral
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Bem-vindo ao painel administrativo da VitalEvo.
                    </p>
                </div>
                <div className="text-right hidden sm:block">
                    <p className="text-xs font-bold text-primary uppercase tracking-widest mb-1">Status do Sistema</p>
                    <div className="flex items-center gap-2 text-green-500">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-sm font-bold">Online</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((stat, i) => (
                    <div key={i} className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <TrendingUp className="w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                        <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">{stat.value}</h3>
                        <p className="text-xs text-gray-400 mt-2 font-medium">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Sales Chart (CSS Based) */}
                <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <DollarSign className="w-5 h-5 text-green-500" />
                        Vendas (Últimos 7 dias)
                    </h2>
                    <div className="flex items-end justify-between h-48 gap-2">
                        {stats.salesChart.map((day: any, i: number) => {
                            const maxValue = Math.max(...stats.salesChart.map((d: any) => d.value), 1);
                            const height = (day.value / maxValue) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="relative w-full flex justify-center items-end h-full">
                                        <div
                                            className="w-full max-w-[32px] bg-primary/20 group-hover:bg-primary/40 rounded-t-lg transition-all"
                                            style={{ height: `${height}%` }}
                                        />
                                        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            <span className="bg-gray-900 text-white text-[10px] py-1 px-2 rounded-lg font-bold">
                                                KZ {day.value.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                                        {day.date}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            Mais Vendidos
                        </h2>
                    </div>
                    <div className="p-6 space-y-4">
                        {stats.topProducts.map((product: any, i: number) => (
                            <div key={i} className="flex items-center gap-4">
                                <span className="text-xl font-black text-gray-100 dark:text-white/5 italic w-6">0{i + 1}</span>
                                <div className="w-12 h-12 rounded-lg bg-gray-100 dark:bg-white/5 overflow-hidden">
                                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{product.name}</p>
                                    <p className="text-xs text-gray-500">Total: KZ {product.total.toLocaleString('pt-AO')}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <ShoppingBag className="w-5 h-5 text-primary" />
                            Pedidos Recentes
                        </h2>
                        <Link href="/admin/orders" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
                            Ver todos <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {stats.recentOrders.length === 0 ? (
                            <div className="p-12 text-center text-gray-500">Nenhum pedido hoje.</div>
                        ) : (
                            stats.recentOrders.map((order: any) => (
                                <div key={order._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500">
                                            <ShoppingBag className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-gray-900 dark:text-white">#{order.orderNumber}</p>
                                            <p className="text-xs text-gray-500">{order.shippingAddress.name}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-gray-900 dark:text-white">KZ {order.total.toLocaleString('pt-AO')}</p>
                                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Status Column */}
                <div className="space-y-8">
                    {/* Low Stock Alert */}
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm p-6 overflow-hidden">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white gap-2 flex items-center mb-6">
                            <AlertTriangle className="w-5 h-5 text-red-500" />
                            Stock Crítico
                        </h2>
                        <div className="space-y-4">
                            {stats.outOfStock > 0 ? (
                                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-xl">
                                    <p className="text-sm text-red-600 dark:text-red-400 font-bold">Atenção! {stats.outOfStock} produtos estão esgotados.</p>
                                    <Link href="/admin/products" className="text-xs text-red-500 hover:underline mt-2 block font-bold uppercase">Repor Stock Agora</Link>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">Todo o stock está em ordem.</p>
                            )}
                        </div>
                    </div>

                    {/* Recent Messages */}
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <MessageSquare className="w-5 h-5 text-primary" />
                                Novas Mensagens
                                {stats.unreadMessages > 0 && (
                                    <span className="bg-primary text-white text-[10px] py-0.5 px-2 rounded-full animate-pulse">
                                        {stats.unreadMessages}
                                    </span>
                                )}
                            </h2>
                        </div>
                        <div className="divide-y divide-gray-50 dark:divide-white/5">
                            {stats.recentMessages.length === 0 ? (
                                <div className="p-12 text-center text-gray-500">Nenhuma mensagem recente.</div>
                            ) : (
                                stats.recentMessages.map((msg: any) => (
                                    <div key={msg._id} className="p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${msg.isRead ? 'bg-transparent' : 'bg-primary animate-pulse'}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{msg.subject}</p>
                                            <p className="text-xs text-gray-500 truncate">{msg.name}</p>
                                        </div>
                                        <Link
                                            href="/admin/contacts"
                                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400 group"
                                        >
                                            <ArrowRight className="w-5 h-5 group-hover:text-primary transition-colors" />
                                        </Link>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
