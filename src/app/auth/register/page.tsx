"use client";

import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full px-4">

                    <div className="bg-white dark:bg-[#151e32] p-8 md:p-10 rounded-3xl shadow-xl border border-gray-100 dark:border-white/5">
                        <div className="text-center mb-10">
                            <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-2">Crie sua Conta</h1>
                            <p className="text-gray-500 dark:text-gray-400">Junte-se a nós para ter acesso exclusivo.</p>
                        </div>

                        <form className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo</label>
                                <input
                                    type="text"
                                    placeholder="Seu nome"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">E-mail</label>
                                <input
                                    type="email"
                                    placeholder="seu@email.com"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Confirmar Senha</label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-gray-900 dark:text-white transition-all"
                                />
                            </div>

                            <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 mt-4">
                                Cadastrar
                            </button>
                        </form>

                        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Já tem uma conta? <Link href="/auth/login" className="text-primary font-bold hover:underline">Fazer Login</Link>
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </FeatureLayout>
    );
}
