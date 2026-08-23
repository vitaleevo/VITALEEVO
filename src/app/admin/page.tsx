"use client";

import React from "react";
import Link from "next/link";
import { Banknote, ShoppingCart, FileText, Inbox, Mail, Users, Package, AlertTriangle, ArrowRight, Newspaper } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Badge, Table, Td, Empty } from "@/shared/components/admin/ui";
import { formatCurrency, formatDate } from "@/shared/utils/format";
import { hasCapability } from "@/shared/auth/capabilities";

export default function AdminDashboardPage() {
    const { token, user } = useAuth();
    const { data: stats, isLoading, error } = useApiQuery<any>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.dashboard.getStats(token as string),
    });

    if (isLoading) return <Loading label="A carregar dashboard..." />;
    if (error) return <ErrorBox message={error} />;
    if (!stats) return <Empty />;

    const orders = stats.orders || {};
    const quotes = stats.quotes || {};
    const contacts = stats.contacts || {};
    const products = stats.products || {};
    const users = stats.users || {};
    const canOrders = hasCapability(user, "orders:read");
    const canQuotes = hasCapability(user, "quotes:read");
    const canContacts = hasCapability(user, "contacts:manage");

    const allCards = [
        { label: "Receita (não cancelada)", value: formatCurrency(stats.revenue ?? 0), icon: Banknote, to: "/admin/orders", perm: "orders:read" },
        { label: "Encomendas", value: String(orders.total ?? 0), icon: ShoppingCart, to: "/admin/orders", perm: "orders:read" },
        { label: "Cotações", value: String(quotes.total ?? 0), icon: FileText, to: "/admin/quotes", perm: "quotes:read" },
        { label: "Contactos", value: String(contacts.total ?? 0), icon: Inbox, to: "/admin/contacts", perm: "contacts:manage" },
        { label: "Subscritores", value: String(stats.newsletterSubscribers ?? 0), icon: Mail, to: "/admin/newsletter", perm: "contacts:manage" },
        { label: "Utilizadores", value: String(users.total ?? 0), icon: Users, to: "/admin/users", perm: "users:manage" },
        { label: "Produtos ativos", value: String(products.active ?? 0), icon: Package, to: "/admin/products", perm: "catalog:read" },
        { label: "Stock baixo (≤5)", value: String(products.lowStock ?? 0), icon: AlertTriangle, to: "/admin/products", perm: "stock:manage" },
        { label: "Conteúdo do site", value: "Gerir", icon: Newspaper, to: "/admin/cms", perm: "content:manage" },
    ];

    const cards = allCards.filter(c => {
        if (!c.perm) return true;
        return hasCapability(user, c.perm);
    });

    const maxRevenue = Math.max(1, ...(stats.monthlyRevenue || []).map((m: any) => m.total));

    return (
        <div>
            <AdminHeader title="Dashboard" subtitle="Visão geral do negócio" />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
                {cards.map(card => (
                    <Link key={card.label} href={card.to} className="group">
                        <Card className="p-5 hover:border-primary/30 transition-colors">
                            <div className="flex items-center justify-between mb-3">
                                <card.icon className="w-5 h-5 text-primary" />
                                <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
                            </div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{card.value}</p>
                            <p className="mt-1 text-xs font-medium text-gray-500">{card.label}</p>
                        </Card>
                    </Link>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Receita mensal */}
                {canOrders && <Card className="p-6 xl:col-span-1">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Receita Mensal (6 meses)</h3>
                    {stats.monthlyRevenue?.length ? (
                        <div className="flex items-end gap-2 h-40">
                            {stats.monthlyRevenue.map((m: any) => (
                                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                    <span className="text-[9px] font-bold text-gray-400">{Math.round((m.total / maxRevenue) * 100)}%</span>
                                    <div
                                        className="w-full rounded-t-lg bg-primary/80"
                                        style={{ height: `${Math.max(4, (m.total / maxRevenue) * 100)}%` }}
                                    />
                                    <span className="text-[9px] text-gray-400">{m.month}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <Empty label="Sem receita registada" />
                    )}
                </Card>}

                {/* Encomendas recentes */}
                {canOrders && <Card className="xl:col-span-2 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Encomendas Recentes</h3>
                        <Link href="/admin/orders" className="text-xs font-bold text-primary hover:underline">Ver todas</Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-xs uppercase tracking-wider text-gray-400 border-b border-gray-50 dark:border-white/5">
                                    <th className="px-4 py-3 font-bold">Número</th>
                                    <th className="px-4 py-3 font-bold">Cliente</th>
                                    <th className="px-4 py-3 font-bold">Total</th>
                                    <th className="px-4 py-3 font-bold">Estado</th>
                                    <th className="px-4 py-3 font-bold">Data</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                                {(stats.recent?.orders || []).map((o: any) => (
                                    <tr key={o.orderNumber || o.order_number}>
                                        <Td className="font-bold">#{o.orderNumber || o.order_number}</Td>
                                        <Td>{o.guestEmail || o.guest_email || "—"}</Td>
                                        <Td className="font-bold">{formatCurrency(Number(o.total))}</Td>
                                        <Td><Badge value={o.status} /></Td>
                                        <Td className="text-gray-400">{formatDate(o.createdAt || o.created_at)}</Td>
                                    </tr>
                                ))}
                                {!(stats.recent?.orders || []).length && <tr><td><Empty /></td></tr>}
                            </tbody>
                        </table>
                    </div>
                </Card>}

                {/* Cotações recentes */}
                {canQuotes && <Card className="xl:col-span-2 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Cotações Recentes</h3>
                        <Link href="/admin/quotes" className="text-xs font-bold text-primary hover:underline">Ver todas</Link>
                    </div>
                    <Table headers={["Ref", "Nome", "Telefone", "Estado", "Data"]}>
                        {(stats.recent?.quotes || []).map((q: any) => (
                            <tr key={q.publicId || q.public_id}>
                                <Td className="font-mono text-xs font-bold">{(q.publicId || q.public_id)}</Td>
                                <Td>{q.name}</Td>
                                <Td>{q.phone}</Td>
                                <Td><Badge value={q.status} /></Td>
                                <Td className="text-gray-400">{formatDate(q.createdAt || q.created_at)}</Td>
                            </tr>
                        ))}
                        {!(stats.recent?.quotes || []).length && (
                            <tr><td colSpan={5}><Empty /></td></tr>
                        )}
                    </Table>
                </Card>}

                {/* Contactos recentes */}
                {canContacts && <Card className="overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                        <h3 className="font-bold text-gray-900 dark:text-white">Contactos Recentes</h3>
                        <Link href="/admin/contacts" className="text-xs font-bold text-primary hover:underline">Ver todos</Link>
                    </div>
                    <div className="divide-y divide-gray-50 dark:divide-white/5">
                        {(stats.recent?.contacts || []).map((c: any) => (
                            <div key={c.id} className="px-6 py-3">
                                <p className="font-bold text-sm text-gray-900 dark:text-white">{c.name}</p>
                                <p className="text-xs text-gray-500 truncate">{c.subject}</p>
                            </div>
                        ))}
                        {!(stats.recent?.contacts || []).length && <Empty />}
                    </div>
                </Card>}
            </div>
        </div>
    );
}
