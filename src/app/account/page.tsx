"use client";

import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

const mockUser = {
    name: 'João Manuel',
    email: 'joao.manuel@email.com',
    phone: '+244 923 456 789',
    avatar: null,
    memberSince: 'Outubro 2023'
};

const mockOrders = [
    { id: 'VE-88392', date: '22 Dez 2024', status: 'Entregue', total: 18500.00, items: 2 },
    { id: 'VE-77201', date: '15 Nov 2024', status: 'Em Trânsito', total: 589.90, items: 1 },
    { id: 'VE-65110', date: '02 Out 2024', status: 'Entregue', total: 1548.90, items: 3 },
];

export default function AccountPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex flex-col md:flex-row gap-8">

                        {/* Sidebar */}
                        <aside className="w-full md:w-64 shrink-0 space-y-4">
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons-round text-4xl text-primary">person</span>
                                </div>
                                <h2 className="font-bold text-lg text-gray-900 dark:text-white">{mockUser.name}</h2>
                                <p className="text-sm text-gray-500">Membro desde {mockUser.memberSince}</p>
                            </div>

                            <nav className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden">
                                <Link href="/account" className="flex items-center gap-3 px-5 py-4 text-primary font-bold bg-primary/5 border-l-4 border-primary">
                                    <span className="material-icons-round">dashboard</span>
                                    Painel Geral
                                </Link>
                                <Link href="/account/orders" className="flex items-center gap-3 px-5 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <span className="material-icons-round">receipt_long</span>
                                    Meus Pedidos
                                </Link>
                                <Link href="/account/profile" className="flex items-center gap-3 px-5 py-4 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <span className="material-icons-round">settings</span>
                                    Editar Perfil
                                </Link>
                                <button className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                                    <span className="material-icons-round">logout</span>
                                    Sair da Conta
                                </button>
                            </nav>
                        </aside>

                        {/* Main Content */}
                        <main className="flex-1 space-y-8">
                            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">Minha Conta</h1>

                            {/* Stats */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                                            <span className="material-icons-round text-blue-500">shopping_bag</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">{mockOrders.length}</p>
                                            <p className="text-sm text-gray-500">Pedidos</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-green-100 dark:bg-green-500/20 rounded-xl flex items-center justify-center">
                                            <span className="material-icons-round text-green-500">local_shipping</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">1</p>
                                            <p className="text-sm text-gray-500">Em Trânsito</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-500/20 rounded-xl flex items-center justify-center">
                                            <span className="material-icons-round text-purple-500">favorite</span>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-black text-gray-900 dark:text-white">5</p>
                                            <p className="text-sm text-gray-500">Favoritos</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Recent Orders */}
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <div className="flex justify-between items-center mb-6">
                                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Pedidos Recentes</h3>
                                    <Link href="/account/orders" className="text-sm text-primary font-bold hover:underline">Ver Todos</Link>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-gray-100 dark:border-white/5">
                                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Pedido</th>
                                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Data</th>
                                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                                <th className="pb-3 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {mockOrders.map(order => (
                                                <tr key={order.id} className="border-b border-gray-50 dark:border-white/5 last:border-0">
                                                    <td className="py-4">
                                                        <Link href={`/account/orders/${order.id}`} className="font-bold text-gray-900 dark:text-white hover:text-primary">#{order.id}</Link>
                                                    </td>
                                                    <td className="py-4 text-sm text-gray-500">{order.date}</td>
                                                    <td className="py-4">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${order.status === 'Entregue' ? 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400'}`}>
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 text-right font-bold text-gray-900 dark:text-white">Kz {order.total.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                        </main>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
