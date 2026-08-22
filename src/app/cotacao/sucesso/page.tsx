"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api, getQuoteAccessToken } from "@/shared/utils/apiClient";
import FeatureLayout from "@/shared/components/FeatureLayout";
import {
    CheckCircle2, MessageSquare, ShoppingBag, Home, RefreshCw, AlertCircle,
} from "lucide-react";

export default function CotacaoSucessoPage() {
    const searchParams = useSearchParams();
    const ref = searchParams.get("ref") || "";
    const [accessToken, setAccessToken] = useState<string | null>(null);

    useEffect(() => {
        setAccessToken(ref ? getQuoteAccessToken(ref) : null);
    }, [ref]);

    const { data, isLoading } = useApiQuery<any>(null, {
        deps: [ref, accessToken],
        enabled: !!ref && !!accessToken,
        fetcher: () => api.quotes.getByPublicId(ref, accessToken || ""),
    });

    const quote = data ?? null;

    const shareToWhatsApp = () => {
        const message = encodeURIComponent(
            `Olá VitalEvo! 👋\n\nAcabei de enviar um pedido de cotação (referência *${ref}*) no site.`
        );
        window.open(`https://wa.me/244950744445?text=${message}`, "_blank");
    };

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full px-4 text-center">
                    <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                        <CheckCircle2 className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
                        Pedido Enviado!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Obrigado pelo seu pedido. A nossa equipa comercial vai contactá-lo com a
                        melhor proposta. Enviámos também uma confirmação para o seu e-mail.
                    </p>

                    {accessToken && isLoading ? (
                        <div className="flex justify-center p-8">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : quote ? (
                        <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 mb-8 text-left shadow-xl">
                            <div className="flex justify-between mb-3">
                                <span className="text-sm text-gray-500">Referência:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{quote.publicId}</span>
                            </div>
                            <div className="flex justify-between mb-3">
                                <span className="text-sm text-gray-500">Estado:</span>
                                <span className="font-bold text-primary capitalize">{String(quote.status || "").replace("_", " ")}</span>
                            </div>
                            <div className="flex justify-between mb-3">
                                <span className="text-sm text-gray-500">Itens:</span>
                                <span className="font-bold text-gray-900 dark:text-white">{quote.itemCount || 0}</span>
                            </div>
                            <div className="grid grid-cols-1 gap-3 mt-6">
                                <button
                                    onClick={shareToWhatsApp}
                                    className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-green-500/20"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    Confirmar no WhatsApp
                                </button>
                            </div>
                        </div>
                    ) : accessToken ? (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl mb-8 border border-red-100 dark:border-red-900/20 text-red-600 flex items-center gap-2 justify-center">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Não conseguimos carregar os dados do pedido.</span>
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 mb-8 shadow-xl">
                            <span className="text-sm text-gray-500">Referência do pedido</span>
                            <p className="font-bold text-gray-900 dark:text-white mt-2">{ref}</p>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Link
                            href="/store"
                            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:-translate-y-1"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Continuar a Explorar
                        </Link>
                        <Link
                            href="/"
                            className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold transition-colors text-sm"
                        >
                            <Home className="w-4 h-4" />
                            Voltar ao Início
                        </Link>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
