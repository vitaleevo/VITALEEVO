"use client";

import Link from "next/link";
import { Construction, ArrowLeft } from "lucide-react";

export default function AdminDisabledPage() {
    return (
        <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] px-4">
            <div className="max-w-md w-full text-center">
                <div className="w-24 h-24 rounded-full bg-amber-100 dark:bg-amber-500/15 flex items-center justify-center mx-auto mb-8">
                    <Construction className="w-12 h-12 text-amber-500" />
                </div>
                <h1 className="font-display text-3xl font-black text-gray-900 dark:text-white mb-4">
                    Painel em Construção
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                    O painel de administração está temporariamente indisponível enquanto
                    migramos o sistema para o novo backend. Volte em breve.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar ao Início
                </Link>
            </div>
        </div>
    );
}