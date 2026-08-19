"use client";

import React, { useRef, useState } from "react";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle, AlertTriangle, Loader2 } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card } from "@/shared/components/admin/ui";

const COLUMNS = ["SKU", "Nome", "Preço", "Stock", "Categoria", "Subcategoria", "Marca", "Descrição", "Imagem", "Estado", "Destaque"];

export default function AdminImportPage() {
    const { token } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState<{ created: number; updated: number; errors: { row: number; error: string }[] } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleFile = async (file: File) => {
        if (!token) return;
        setImporting(true);
        setResult(null);
        try {
            const res = await api.imports.importProducts(file, token);
            setResult(res);
        } catch (err: any) {
            setResult({ created: 0, updated: 0, errors: [{ row: 0, error: err?.message || "Falha na importação" }] });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div>
            <AdminHeader title="Importar Excel" subtitle="Cria ou atualiza produtos por SKU (colunas aceites em português ou inglês)" />

            <div className="max-w-2xl space-y-6">
                <Card className="p-8">
                    <div
                        onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                        onDragLeave={() => setDragOver(false)}
                        onDrop={e => {
                            e.preventDefault();
                            setDragOver(false);
                            const f = e.dataTransfer.files?.[0];
                            if (f) handleFile(f);
                        }}
                        className={`rounded-2xl border-2 border-dashed p-12 text-center transition-colors ${
                            dragOver ? "border-primary bg-primary/5" : "border-gray-200 dark:border-white/10"
                        }`}
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept=".xlsx,.xlsm"
                            className="hidden"
                            onChange={e => {
                                const f = e.target.files?.[0];
                                if (f) handleFile(f);
                                e.target.value = "";
                            }}
                        />
                        <FileSpreadsheet className="w-12 h-12 text-primary mx-auto mb-4" />
                        <p className="font-bold text-gray-900 dark:text-white mb-1">
                            {importing ? "A importar..." : "Arraste o ficheiro .xlsx ou clique para escolher"}
                        </p>
                        <p className="text-sm text-gray-500 mb-6">Produtos com o mesmo SKU são atualizados; novos são criados.</p>
                        <button
                            onClick={() => fileRef.current?.click()}
                            disabled={importing}
                            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                        >
                            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                            Escolher ficheiro
                        </button>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-3">Colunas aceites (1.ª linha = cabeçalho)</h3>
                    <div className="flex flex-wrap gap-2">
                        {COLUMNS.map(c => (
                            <span key={c} className="rounded-lg bg-gray-100 dark:bg-white/5 px-3 py-1 text-xs font-bold text-gray-600 dark:text-gray-300">
                                {c}
                            </span>
                        ))}
                    </div>
                </Card>

                {result && (
                    <Card className="p-6">
                        <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="rounded-xl bg-green-50 dark:bg-green-500/10 p-4 text-center">
                                <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                <p className="text-2xl font-black text-green-600">{result.created}</p>
                                <p className="text-xs font-bold text-green-600 uppercase">Criados</p>
                            </div>
                            <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-4 text-center">
                                <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                                <p className="text-2xl font-black text-blue-600">{result.updated}</p>
                                <p className="text-xs font-bold text-blue-600 uppercase">Atualizados</p>
                            </div>
                        </div>
                        {result.errors.length > 0 && (
                            <div>
                                <p className="flex items-center gap-2 text-sm font-bold text-red-500 mb-2">
                                    <AlertTriangle className="w-4 h-4" /> {result.errors.length} linha(s) com erros
                                </p>
                                <div className="max-h-48 overflow-y-auto space-y-1">
                                    {result.errors.map((e, i) => (
                                        <p key={i} className="flex items-start gap-2 text-xs text-red-500">
                                            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                            <span>{e.row ? `Linha ${e.row}: ` : ""}{e.error}</span>
                                        </p>
                                    ))}
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}