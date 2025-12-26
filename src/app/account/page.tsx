"use client";

import { useUser, useClerk, SignedIn, SignedOut } from "@clerk/nextjs";
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

export default function AccountPage() {
    const { user, isLoaded } = useUser();
    const { signOut } = useClerk();

    if (!isLoaded) {
        return (
            <FeatureLayout>
                <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
            </FeatureLayout>
        );
    }

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

                    <SignedOut>
                        <div className="text-center py-20">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                                <span className="material-icons-round text-5xl text-primary">lock</span>
                            </div>
                            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-4">Acesso Restrito</h1>
                            <p className="text-gray-500 mb-8">Faça login para acessar sua conta.</p>
                            <Link href="/sign-in" className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg">
                                Fazer Login
                            </Link>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex flex-col md:flex-row gap-8">

                            {/* Sidebar */}
                            <aside className="w-full md:w-64 shrink-0 space-y-4">
                                <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                                    <div className="w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden bg-primary/10">
                                        {user?.imageUrl ? (
                                            <img src={user.imageUrl} alt={user.fullName || ''} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-icons-round text-4xl text-primary">person</span>
                                            </div>
                                        )}
                                    </div>
                                    <h2 className="font-bold text-lg text-gray-900 dark:text-white">{user?.fullName || 'Usuário'}</h2>
                                    <p className="text-sm text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
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
                                    <button
                                        onClick={() => signOut({ redirectUrl: '/' })}
                                        className="w-full flex items-center gap-3 px-5 py-4 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                    >
                                        <span className="material-icons-round">logout</span>
                                        Sair da Conta
                                    </button>
                                </nav>
                            </aside>

                            {/* Main Content */}
                            <main className="flex-1 space-y-8">
                                <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
                                    Olá, {user?.firstName || 'Usuário'}! 👋
                                </h1>

                                {/* Stats */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-500/20 rounded-xl flex items-center justify-center">
                                                <span className="material-icons-round text-blue-500">shopping_bag</span>
                                            </div>
                                            <div>
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
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
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
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
                                                <p className="text-2xl font-black text-gray-900 dark:text-white">0</p>
                                                <p className="text-sm text-gray-500">Favoritos</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Empty State */}
                                <div className="bg-white dark:bg-[#151e32] p-12 rounded-2xl border border-gray-100 dark:border-white/5 text-center">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <span className="material-icons-round text-4xl text-gray-400">inventory_2</span>
                                    </div>
                                    <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Nenhum pedido ainda</h3>
                                    <p className="text-gray-500 mb-6">Explore nossa loja e faça seu primeiro pedido!</p>
                                    <Link href="/store" className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold shadow-lg">
                                        Ir para a Loja
                                    </Link>
                                </div>
                            </main>
                        </div>
                    </SignedIn>
                </div>
            </div>
        </FeatureLayout>
    );
}
