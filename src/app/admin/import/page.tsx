"use client";

import React, { useState, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import * as XLSX from 'xlsx';
import {
    Upload,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Download,
    Loader2,
    Database,
    Briefcase,
    FileText,
    Trash2
} from 'lucide-react';
import { useAuth } from '@/shared/providers/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';

type ImportType = 'products' | 'projects' | 'blog';

export default function ImportPage() {
    const { token } = useAuth();
    const [importType, setImportType] = useState<ImportType>('products');
    const [fileData, setFileData] = useState<any[]>([]);
    const [fileName, setFileName] = useState<string>('');
    const [isUploading, setIsUploading] = useState(false);
    const [results, setResults] = useState<{ created: number, updated: number, errors: string[] } | null>(null);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const importProductsMutation = useMutation(api.importData.importProducts);
    const importProjectsMutation = useMutation(api.importData.importProjects);
    const importArticlesMutation = useMutation(api.importData.importArticles);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setError(null);
        setResults(null);

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target?.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);
                setFileData(data);
            } catch (err) {
                setError("Falha ao ler o arquivo Excel. Verifique se o formato está correto.");
                console.error(err);
            }
        };
        reader.readAsBinaryString(file);
    };

    const handleImport = async () => {
        if (!token) {
            setError("Você precisa estar logado como administrador.");
            return;
        }

        if (fileData.length === 0) {
            setError("Nenhum dado encontrado no arquivo.");
            return;
        }

        setIsUploading(true);
        setError(null);

        try {
            let res;
            if (importType === 'products') {
                // Map and validate data for products
                const items = fileData.map(row => ({
                    name: String(row.Nome || row.name || ''),
                    slug: String(row.Slug || row.slug || '').toLowerCase().replace(/ /g, '-'),
                    description: String(row.Descricao || row.description || ''),
                    fullDescription: row.Descricao_Completa || row.fullDescription,
                    price: Number(row.Preco || row.price || 0),
                    oldPrice: row.Preco_Antigo ? Number(row.Preco_Antigo) : undefined,
                    image: String(row.Imagem || row.image || '/images/products/placeholder.png'),
                    category: String(row.Categoria || row.category || 'Geral'),
                    brand: row.Marca || row.brand,
                    stock: Number(row.Estoque || row.stock || 0),
                    isNew: row.Novo === 'Sim' || row.isNew === true,
                    isActive: row.Ativo !== 'Não' && row.isActive !== false,
                    isFeatured: row.Destaque === 'Sim' || row.isFeatured === true,
                    rating: Number(row.Avaliacao || row.rating || 5),
                    reviewCount: Number(row.Reviews || row.reviewCount || 0),
                }));
                res = await importProductsMutation({ token, items });
            } else if (importType === 'projects') {
                const items = fileData.map(row => ({
                    title: String(row.Titulo || row.title || ''),
                    slug: String(row.Slug || row.slug || '').toLowerCase().replace(/ /g, '-'),
                    category: String(row.Categoria || row.category || 'Design'),
                    tags: String(row.Tags || row.tags || '').split(',').map(t => t.trim()),
                    image: String(row.Imagem || row.image || '/images/portfolio/placeholder.png'),
                    client: row.Cliente || row.client,
                    year: String(row.Ano || row.year || new Date().getFullYear()),
                    fullDescription: String(row.Descricao || row.fullDescription || ''),
                    challenge: String(row.Desafio || row.challenge || ''),
                    solution: String(row.Solucao || row.solution || ''),
                    results: String(row.Resultados || row.results || '').split('\n').filter(r => r.trim()),
                    isActive: row.Ativo !== 'Não' && row.isActive !== false,
                    order: Number(row.Ordem || row.order || 0),
                }));
                res = await importProjectsMutation({ token, items });
            } else {
                // blog
                const items = fileData.map(row => ({
                    title: String(row.Titulo || row.title || ''),
                    slug: String(row.Slug || row.slug || '').toLowerCase().replace(/ /g, '-'),
                    category: String(row.Categoria || row.category || 'Tecnologia'),
                    excerpt: String(row.Resumo || row.excerpt || ''),
                    content: String(row.Conteudo || row.content || ''),
                    image: String(row.Imagem || row.image || '/images/blog/placeholder.png'),
                    author: String(row.Autor || row.author || 'VitalEvo Admin'),
                    readTime: String(row.Tempo_Leitura || row.readTime || '5 min'),
                    isPublished: row.Publicado === 'Sim' || row.isPublished === true,
                    isFeatured: row.Destaque === 'Sim' || row.isFeatured === true,
                }));
                res = await importArticlesMutation({ token, items });
            }
            setResults(res);
            setFileData([]);
            setFileName('');
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro ao importar os dados.");
        } finally {
            setIsUploading(false);
        }
    };

    const downloadTemplate = () => {
        let headers: string[] = [];
        let sampleData: any[] = [];
        let name = "";

        if (importType === 'products') {
            headers = ['Nome', 'Slug', 'Preco', 'Preco_Antigo', 'Estoque', 'Categoria', 'Marca', 'Descricao', 'Imagem', 'Novo', 'Destaque', 'Ativo'];
            sampleData = [
                ['iPhone 15 Pro', 'iphone-15-pro', 1200000, 1300000, 10, 'Smartphones', 'Apple', 'O mais potente iPhone de sempre.', 'https://images.unsplash.com/photo-1696446701796-da61225697cc', 'Sim', 'Sim', 'Sim'],
                ['MacBook Air M3', 'macbook-air-m3', 1500000, 0, 5, 'Computadores', 'Apple', 'Leveza e potência unidas.', 'https://images.unsplash.com/photo-1517336712461-70133df499c0', 'Sim', 'Não', 'Sim']
            ];
            name = "template_produtos_vitaleevo.xlsx";
        } else if (importType === 'projects') {
            headers = ['Titulo', 'Slug', 'Categoria', 'Tags', 'Cliente', 'Ano', 'Descricao', 'Desafio', 'Solucao', 'Resultados', 'Imagem', 'Ordem', 'Ativo'];
            sampleData = [
                [
                    'Site E-commerce Vitaleevo',
                    'site-ecommerce-vitaleevo',
                    'Desenvolvimento Web',
                    'Next.js, Tailwind, Convex',
                    'Vitaleevo',
                    '2024',
                    'Um site de e-commerce moderno e futurista construído para a VitalEvo.',
                    'O cliente precisava de uma plataforma rápida e segura para vender serviços digitais.',
                    'Implementamos uma arquitetura serverless com Convex e Next.js.',
                    'Aumento de 50% nas vendas\nFeedback excelente dos usuários\nPerformance 100/100 no Lighthouse',
                    'https://images.unsplash.com/photo-1460925895917-afdab827c52f',
                    1,
                    'Sim'
                ]
            ];
            name = "template_projetos_vitaleevo.xlsx";
        } else {
            headers = ['Titulo', 'Slug', 'Categoria', 'Autor', 'Resumo', 'Conteudo', 'Imagem', 'Tempo_Leitura', 'Publicado', 'Destaque'];
            sampleData = [
                [
                    'A Revolução da IA no Design',
                    'revolucao-ia-design',
                    'Design',
                    'VitalEvo Team',
                    'Como a IA está mudando o fluxo de trabalho dos designers em 2024.',
                    'A inteligência artificial não veio para substituir os designers, mas para potenciá-los. Neste artigo exploramos como ferramentas como Midjourney e DALL-E 3 estão a ser integradas nos processos criativos...',
                    'https://images.unsplash.com/photo-1675557009875-436f595f295d',
                    '5 min',
                    'Sim',
                    'Sim'
                ]
            ];
            name = "template_blog_vitaleevo.xlsx";
        }

        const data = [headers, ...sampleData];
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
        XLSX.writeFile(wb, name);
    };

    return (
        <div className="p-4 lg:p-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">
                        Importação em Massa
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Adicione múltiplos itens rapidamente via arquivos Excel (.xlsx)
                    </p>
                </div>
                <button
                    onClick={downloadTemplate}
                    className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-6 py-3 rounded-2xl font-bold hover:bg-gray-50 dark:hover:bg-white/10 transition-all text-sm"
                >
                    <Download className="w-4 h-4 text-primary" />
                    Baixar Template
                </button>
            </div>

            {/* Select Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { id: 'products', label: 'Produtos (Loja)', icon: <Database className="w-5 h-5" />, color: 'bg-blue-500' },
                    { id: 'projects', label: 'Projetos (Portfolio)', icon: <Briefcase className="w-5 h-5" />, color: 'bg-purple-500' },
                    { id: 'blog', label: 'Conteúdo (Blog)', icon: <FileText className="w-5 h-5" />, color: 'bg-orange-500' }
                ].map((type) => (
                    <button
                        key={type.id}
                        onClick={() => {
                            setImportType(type.id as ImportType);
                            setFileData([]);
                            setFileName('');
                            setResults(null);
                        }}
                        className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 group
                            ${importType === type.id
                                ? 'border-primary bg-primary/5 shadow-xl shadow-primary/10'
                                : 'border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5 hover:border-gray-200 dark:hover:border-white/10'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${type.color} group-hover:scale-110 transition-transform`}>
                            {type.icon}
                        </div>
                        <span className={`font-black uppercase tracking-widest text-xs ${importType === type.id ? 'text-primary' : 'text-gray-500'}`}>
                            {type.label}
                        </span>
                    </button>
                ))}
            </div>

            {/* Upload Zone */}
            <div className="bg-white dark:bg-[#151e32] rounded-[40px] border border-gray-100 dark:border-white/5 p-8 lg:p-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

                {!fileName ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-4 border-dashed border-gray-100 dark:border-white/5 rounded-[30px] p-12 flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-white/5 transition-all group"
                    >
                        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <Upload className="w-10 h-10" />
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-bold text-gray-900 dark:text-white">Clique para selecionar</p>
                            <p className="text-gray-500">ou arraste seu arquivo Excel aqui</p>
                        </div>
                        <input
                            type="file"
                            className="hidden"
                            accept=".xlsx, .xls"
                            ref={fileInputRef}
                            onChange={handleFileUpload}
                        />
                    </div>
                ) : (
                    <div className="space-y-8">
                        <div className="flex items-center justify-between bg-primary/5 p-6 rounded-3xl border border-primary/20">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                    <FileSpreadsheet className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900 dark:text-white">{fileName}</p>
                                    <p className="text-xs text-primary font-black uppercase tracking-tighter">{fileData.length} registros encontrados</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setFileName('');
                                    setFileData([]);
                                    setResults(null);
                                }}
                                className="w-10 h-10 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Preview Table */}
                        <div className="max-h-96 overflow-auto rounded-2xl border border-gray-100 dark:border-white/5">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 dark:bg-white/5 sticky top-0">
                                    <tr>
                                        {Object.keys(fileData[0] || {}).map(key => (
                                            <th key={key} className="p-4 text-xs font-black uppercase text-gray-500 tracking-widest border-b border-gray-100 dark:border-white/10">
                                                {key}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {fileData.slice(0, 10).map((row, i) => (
                                        <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                                            {Object.values(row).map((val: any, j) => (
                                                <td key={j} className="p-4 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-100 dark:border-white/5">
                                                    {String(val)}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {fileData.length > 10 && (
                                <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase">
                                    + {fileData.length - 10} registros ocultos no preview
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <button
                                onClick={handleImport}
                                disabled={isUploading}
                                className="flex-1 bg-primary text-white px-8 py-5 rounded-2xl font-black text-lg shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Processando...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle2 className="w-6 h-6" />
                                        Confirmar Importação
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Notifications Section */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 p-6 rounded-3xl text-red-500"
                    >
                        <AlertCircle className="w-6 h-6 shrink-0" />
                        <p className="font-bold">{error}</p>
                    </motion.div>
                )}

                {results && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-emerald-500/10 border border-emerald-500/20 p-8 rounded-[40px] space-y-4"
                    >
                        <div className="flex items-center gap-3 text-emerald-500">
                            <CheckCircle2 className="w-8 h-8" />
                            <h2 className="text-2xl font-black uppercase tracking-tighter">Importação Concluída</h2>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Novos</p>
                                <p className="text-3xl font-black text-emerald-500">{results.created}</p>
                            </div>
                            <div className="bg-white dark:bg-white/5 p-4 rounded-2xl">
                                <p className="text-xs font-black uppercase tracking-widest text-gray-400">Atualizados</p>
                                <p className="text-3xl font-black text-blue-500">{results.updated}</p>
                            </div>
                        </div>
                        {results.errors.length > 0 && (
                            <div className="mt-6">
                                <p className="text-sm font-black uppercase tracking-widest text-red-500 mb-2">Erros Encontrados ({results.errors.length})</p>
                                <ul className="space-y-1 max-h-40 overflow-auto bg-red-500/5 p-4 rounded-xl">
                                    {results.errors.map((err, i) => (
                                        <li key={i} className="text-xs text-red-500 font-mono">{err}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
