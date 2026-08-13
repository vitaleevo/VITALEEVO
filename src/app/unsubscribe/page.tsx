"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import Link from 'next/link';
import { MailX, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import FeatureLayout from '@/shared/components/FeatureLayout';

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const email = searchParams.get('email');
    const unsubscribe = useMutation(api.newsletter.unsubscribe);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        const performUnsubscribe = async () => {
            if (!email) {
                setStatus('error');
                return;
            }

            try {
                await unsubscribe({ email });
                setStatus('success');
            } catch (error) {
                console.error("Unsubscribe error:", error);
                setStatus('error');
            }
        };

        performUnsubscribe();
    }, [email, unsubscribe]);

    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-white dark:bg-[#151e32] rounded-[2.5rem] p-10 shadow-2xl border border-gray-100 dark:border-white/5 text-center">
                {status === 'loading' && (
                    <div className="space-y-6">
                        <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Processando pedido...</h1>
                        <p className="text-gray-500 dark:text-gray-400">Estamos a remover o seu e-mail da nossa lista.</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/10 rounded-full flex items-center justify-center mx-auto text-green-600 dark:text-green-400">
                            <CheckCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscrição cancelada</h1>
                        <p className="text-gray-500 dark:text-gray-400 leading-relaxed">
                            O seu e-mail <strong>{email}</strong> foi removido com sucesso. Lamentamos vê-lo partir, mas respeitamos a sua privacidade.
                        </p>
                        <div className="pt-6">
                            <Link href="/" className="inline-flex items-center justify-center px-8 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark transition-all">
                                Voltar para a Home
                            </Link>
                        </div>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="w-20 h-20 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-red-600 dark:text-red-400">
                            <AlertCircle className="w-10 h-10" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Algo correu mal</h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Não conseguimos processar o seu cancelamento automaticamente. Por favor, envie um e-mail para <strong>info@vitaleevo.ao</strong>.
                        </p>
                        <div className="pt-6">
                            <Link href="/" className="text-primary font-bold hover:underline">
                                Ir para a Página Inicial
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <FeatureLayout>
            <Suspense fallback={
                <div className="min-h-[60vh] flex items-center justify-center">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
        </FeatureLayout>
    );
}
