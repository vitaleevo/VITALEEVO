"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center px-4">
            <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
                    <span className="material-icons-round text-5xl text-red-500">error</span>
                </div>
                <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-4">
                    Algo deu errado!
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8">
                    Desculpe, ocorreu um erro inesperado. Por favor, tente novamente.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={reset}
                        className="bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Tentar Novamente
                    </button>
                    <Link
                        href="/"
                        className="bg-gray-200 dark:bg-white/10 hover:bg-gray-300 dark:hover:bg-white/20 text-gray-900 dark:text-white px-8 py-4 rounded-xl font-bold transition-all"
                    >
                        Voltar ao Início
                    </Link>
                </div>
            </div>
        </div>
    );
}
