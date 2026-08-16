"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export default function LegalDocumentPage({ params }: { params: { slug: string } }) {
    const doc = useQuery(api.legalDocuments.getBySlug, { slug: params.slug });

    if (doc === undefined) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (doc === null) {
        notFound();
    }

    return (
        <div className="section-pad bg-background-light dark:bg-background-dark">
            <div className="wrap max-w-3xl">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-primary dark:text-slate-300 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Voltar ao Início
                </Link>
                <div className="mt-8 flex items-center gap-4">
                    <span className="icon-tile">
                        <FileText className="h-6 w-6" />
                    </span>
                    <h1 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                        {doc.title}
                    </h1>
                </div>
                <div className="mt-10 rounded-3xl bg-white p-8 shadow-sm border border-slate-100 dark:bg-white/5 dark:border-white/5 md:p-12">
                    <div
                        className="prose prose-slate max-w-none prose-headings:font-display prose-headings:font-extrabold prose-headings:text-slate-900 dark:prose-invert dark:prose-headings:text-white"
                        dangerouslySetInnerHTML={{ __html: doc.content }}
                    />
                </div>
                <p className="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
                    Última atualização: {new Date(doc.updatedAt).toLocaleDateString("pt-PT")}
                </p>
            </div>
        </div>
    );
}