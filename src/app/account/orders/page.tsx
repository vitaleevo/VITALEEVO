"use client";

import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, ChevronRight } from "lucide-react";

const mockOrders = [
    { id: 'VE-88392', date: '22 Dez 2024', status: 'Entregue', total: 18500.00, items: 2 },
    { id: 'VE-77201', date: '15 Nov 2024', status: 'Em Trânsito', total: 589.90, items: 1 },
    { id: 'VE-65110', date: '02 Out 2024', status: 'Entregue', total: 1548.90, items: 3 },
    { id: 'VE-54009', date: '18 Set 2024', status: 'Cancelado', total: 249.00, items: 1 },
];

export default function OrdersPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/account" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">Meus Pedidos</h1>
                    </div>

                    <div className="space-y-4">
                        {mockOrders.map(order => (
                            <Link
                                href={`/account/orders/${order.id}`}
                                key={order.id}
                                className="block bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 hover:shadow-lg hover:border-primary/30 transition-all group"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <p className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                                            Pedido #{order.id}
                                        </p>
                                        <p className="text-sm text-gray-500">{order.date} · {order.items} {order.items > 1 ? 'itens' : 'item'}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold 
                                            ${order.status === 'Entregue' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : ''}
                                            ${order.status === 'Em Trânsito' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400' : ''}
                                            ${order.status === 'Cancelado' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' : ''}
                                        `}>
                                            {order.status}
                                        </span>
                                        <p className="font-black text-xl text-gray-900 dark:text-white">
                                            Kz {order.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                                        </p>
                                        <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                </div>
            </div>
        </FeatureLayout>
    );
}
