"use client";

import { useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, User } from "lucide-react";

export default function ProfilePage() {
    const { user, isLoaded } = useUser();

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
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

                    <SignedOut>
                        <div className="text-center py-20">
                            <p className="text-gray-500 mb-8">Faça login para editar seu perfil.</p>
                            <Link href="/sign-in" className="bg-primary text-white px-8 py-4 rounded-xl font-bold">
                                Fazer Login
                            </Link>
                        </div>
                    </SignedOut>

                    <SignedIn>
                        <div className="flex items-center gap-4 mb-8">
                            <Link href="/account" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-500" />
                            </Link>
                            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">Editar Perfil</h1>
                        </div>

                        <div className="bg-white dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5">

                            {/* Avatar */}
                            <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/10">
                                <div className="w-24 h-24 rounded-full overflow-hidden shrink-0 bg-primary/10">
                                    {user?.imageUrl ? (
                                        <img src={user.imageUrl} alt={user.fullName || ''} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-12 h-12 text-primary" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white mb-2">Foto de Perfil</p>
                                    <p className="text-sm text-gray-500">Gerencie sua foto através do Clerk</p>
                                </div>
                            </div>

                            {/* Info */}
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                                    <div className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 flex items-center text-gray-900 dark:text-white">
                                        {user?.fullName || 'Não definido'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                                    <div className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 flex items-center text-gray-900 dark:text-white">
                                        {user?.primaryEmailAddress?.emailAddress || 'Não definido'}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone</label>
                                    <div className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 flex items-center text-gray-500">
                                        {user?.primaryPhoneNumber?.phoneNumber || 'Não definido'}
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                                    <p className="text-sm text-gray-500 mb-4">
                                        Para alterar suas informações de perfil, acesse o painel do Clerk.
                                    </p>
                                    <button
                                        onClick={() => user?.update({})}
                                        className="bg-primary hover:bg-primary-dark text-white py-4 px-8 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                                    >
                                        Gerenciar Conta
                                    </button>
                                </div>
                            </div>
                        </div>
                    </SignedIn>
                </div>
            </div>
        </FeatureLayout>
    );
}
