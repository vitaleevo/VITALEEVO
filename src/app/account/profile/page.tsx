"use client";

import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

export default function ProfilePage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/account" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <span className="material-icons-round text-gray-500">arrow_back</span>
                        </Link>
                        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">Editar Perfil</h1>
                    </div>

                    <div className="bg-white dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5">

                        {/* Avatar */}
                        <div className="flex items-center gap-6 mb-10 pb-8 border-b border-gray-100 dark:border-white/10">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-5xl text-primary">person</span>
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 dark:text-white mb-2">Foto de Perfil</p>
                                <button className="text-sm text-primary font-bold hover:underline">Alterar Foto</button>
                            </div>
                        </div>

                        {/* Form */}
                        <form className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    defaultValue="João Manuel"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                                <input
                                    type="email"
                                    defaultValue="joao.manuel@email.com"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone</label>
                                <input
                                    type="tel"
                                    defaultValue="+244 923 456 789"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                />
                            </div>

                            <div className="pt-6 border-t border-gray-100 dark:border-white/10">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Alterar Senha</h3>
                                <div className="space-y-4">
                                    <input
                                        type="password"
                                        placeholder="Senha Atual"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Nova Senha"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>

                            <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 mt-8">
                                Salvar Alterações
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
