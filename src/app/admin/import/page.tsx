"use client";

import React, { useRef, useState } from "react";
import {
    UploadCloud,
    FileSpreadsheet,
    Download,
    CheckCircle2,
    XCircle,
    AlertTriangle,
    Loader2,
    HelpCircle,
    FileText,
} from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card } from "@/shared/components/admin/ui";
import { PermissionGuard } from "@/shared/components/admin/PermissionGuard";
import { toast } from "sonner";

const COLUMN_SPECS = [
    { name: "SKU", alias: "sku", desc: "Código único do produto (usado para identificar/atualizar)", req: true, example: "INF-DEL-001" },
    { name: "Nome", alias: "name", desc: "Designação comercial do produto", req: true, example: "Portátil Dell Inspiron 15" },
    { name: "Preço", alias: "price", desc: "Preço de venda em Kwanzas (Kz)", req: true, example: "450000" },
    { name: "Preço Antigo", alias: "old_price", desc: "Preço anterior / riscado para promoção (opcional)", req: false, example: "490000" },
    { name: "Stock", alias: "stock", desc: "Quantidade física disponível no inventário", req: false, example: "15" },
    { name: "Categoria", alias: "category", desc: "Categoria principal (criada automaticamente se nova)", req: false, example: "Informática" },
    { name: "Subcategoria", alias: "subcategory", desc: "Subcategoria do produto", req: false, example: "Portáteis" },
    { name: "Marca", alias: "brand", desc: "Fabricante / Marca (criada automaticamente se nova)", req: false, example: "Dell" },
    { name: "Descrição", alias: "description", desc: "Resumo do produto para a loja", req: false, example: "Portátil de alta performance" },
    { name: "Imagem", alias: "image", desc: "URL da imagem (se vazio, usa imagem padrão)", req: false, example: "https://..." },
    { name: "Estado", alias: "status", desc: "published (publicado), draft (rascunho) ou archived", req: false, example: "published" },
    { name: "Destaque", alias: "is_featured", desc: "1 para sim, 0 para não (exibir na homepage)", req: false, example: "1" },
];

export default function AdminImportPage() {
    return (
        <PermissionGuard permission="catalog:import">
            <AdminImportContent />
        </PermissionGuard>
    );
}

export function AdminImportContent() {
    const { token } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);
    const [importing, setImporting] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [result, setResult] = useState<{ created: number; updated: number; errors: { row: number; error: string }[] } | null>(null);
    const [dragOver, setDragOver] = useState(false);

    const handleDownloadTemplate = async () => {
        if (!token) return;
        setDownloading(true);
        try {
            await api.imports.downloadTemplate(token);
            toast.success("Modelo Excel descarregado com sucesso!");
        } catch (err: any) {
            toast.error(err?.message || "Erro ao descarregar modelo");
        } finally {
            setDownloading(false);
        }
    };

    const handleFile = async (file: File) => {
        if (!token) return;
        if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xlsm")) {
            toast.error("Formato inválido. Por favor, envie um ficheiro Excel (.xlsx).");
            return;
        }
        setImporting(true);
        setResult(null);
        try {
            const res = await api.imports.importProducts(file, token);
            setResult(res);
            if (res.errors.length === 0) {
                toast.success(`Importação concluída: ${res.created} criados, ${res.updated} atualizados.`);
            } else {
                toast.warning(`Importação finalizada com ${res.errors.length} aviso(s).`);
            }
        } catch (err: any) {
            toast.error(err?.message || "Falha na importação");
            setResult({ created: 0, updated: 0, errors: [{ row: 0, error: err?.message || "Falha na importação" }] });
        } finally {
            setImporting(false);
        }
    };

    return (
        <div className="space-y-8">
            <AdminHeader
                title="Importar Catálogo via Excel"
                subtitle="Criação e atualização em lote de produtos através de folha de cálculo (.xlsx)"
                action={
                    <button
                        onClick={handleDownloadTemplate}
                        disabled={downloading}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-sm"
                    >
                        {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Descarregar Modelo Excel (.xlsx)
                    </button>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Upload Dropzone */}
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
                            className={`rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
                                dragOver
                                    ? "border-primary bg-primary/5 scale-[1.01]"
                                    : "border-gray-200 dark:border-white/10 hover:border-primary/40"
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
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
                                <FileSpreadsheet className="w-8 h-8" />
                            </div>
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                {importing ? "A processar ficheiro Excel..." : "Arraste a sua folha de cálculo aqui"}
                            </h3>
                            <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                                Suporta ficheiros padrão <span className="font-semibold text-gray-700 dark:text-gray-300">.xlsx</span>. Produtos com SKU existente são atualizados; novos SKUs são criados automaticamente.
                            </p>
                            <button
                                onClick={() => fileRef.current?.click()}
                                disabled={importing}
                                className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-all shadow-md shadow-primary/20"
                            >
                                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                Escolher Ficheiro no Computador
                            </button>
                        </div>
                    </Card>

                    {/* Result Summary */}
                    {result && (
                        <Card className="p-6">
                            <h4 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <FileText className="w-4 h-4 text-primary" /> Relatório da Importação
                            </h4>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className="rounded-xl bg-green-50 dark:bg-green-500/10 p-4 text-center border border-green-100 dark:border-green-500/20">
                                    <CheckCircle2 className="w-6 h-6 text-green-500 mx-auto mb-1" />
                                    <p className="text-3xl font-black text-green-600 dark:text-green-400">{result.created}</p>
                                    <p className="text-xs font-bold text-green-700 dark:text-green-300 uppercase">Produtos Criados</p>
                                </div>
                                <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 p-4 text-center border border-blue-100 dark:border-blue-500/20">
                                    <CheckCircle2 className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                                    <p className="text-3xl font-black text-blue-600 dark:text-blue-400">{result.updated}</p>
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase">Produtos Atualizados</p>
                                </div>
                            </div>
                            {result.errors.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5">
                                    <p className="flex items-center gap-2 text-sm font-bold text-red-500 mb-3">
                                        <AlertTriangle className="w-4 h-4" /> {result.errors.length} linha(s) com erros ou avisos:
                                    </p>
                                    <div className="max-h-48 overflow-y-auto space-y-1.5 p-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-100 dark:border-red-500/10">
                                        {result.errors.map((e, i) => (
                                            <p key={i} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
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

                {/* Instructions & Template Helper */}
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <HelpCircle className="w-4 h-4 text-primary" /> Modelo Oficial
                            </h3>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                            Descarregue o modelo predefinido com cores, validações e linhas de exemplo para preencher com os produtos da sua empresa.
                        </p>
                        <button
                            onClick={handleDownloadTemplate}
                            disabled={downloading}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 p-3 text-xs font-bold transition-colors"
                        >
                            <Download className="w-4 h-4" /> Descarregar .xlsx Exemplo
                        </button>
                    </Card>

                    <Card className="p-6">
                        <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-3">
                            Colunas Suportadas no Excel
                        </h3>
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                            {COLUMN_SPECS.map(c => (
                                <div key={c.name} className="p-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 text-xs">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-gray-900 dark:text-white">{c.name}</span>
                                        {c.req ? (
                                            <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">Obrigatório</span>
                                        ) : (
                                            <span className="text-[9px] font-medium text-gray-400">Opcional</span>
                                        )}
                                    </div>
                                    <p className="text-[11px] text-gray-500 dark:text-gray-400">{c.desc}</p>
                                    <p className="text-[10px] font-mono text-primary mt-1">Ex: {c.example}</p>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}