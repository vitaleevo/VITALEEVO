"use client";

import React, { useMemo, useState } from "react";
import {
    Flame,
    MousePointerClick,
    Eye,
    Users,
    Activity,
    Smartphone,
    Monitor,
    Tablet,
    Calendar,
    Layers,
    ListOrdered,
    BarChart3,
    Sparkles,
    RefreshCw,
    ExternalLink,
    HelpCircle,
} from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading, ErrorBox, Table, Td, Select, inputClass } from "./ui";

const PERIODS = [
    { value: "today", label: "Hoje" },
    { value: "7d", label: "Últimos 7 dias" },
    { value: "30d", label: "Últimos 30 dias" },
    { value: "all", label: "Todo o período" },
];

export function AdminHeatmapView() {
    const { token } = useAuth();
    const [period, setPeriod] = useState("30d");
    const [selectedPath, setSelectedPath] = useState("/");
    const [viewMode, setViewMode] = useState<"heatmap" | "ranking" | "pages">("heatmap");
    const [heatIntensity, setHeatIntensity] = useState<number>(2);
    const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

    // 1. Carregar lista de páginas rastreadas
    const { data: pagesList, refetch: refetchPages } = useApiQuery<any[]>(null, {
        deps: [token],
        enabled: !!token,
        fetcher: () => api.analytics.getPages(token as string),
    });

    // 2. Carregar métricas gerais de visão geral
    const { data: overview, isLoading: loadingOverview, error: errorOverview, refetch: refetchOverview } = useApiQuery<any>(null, {
        deps: [token, period],
        enabled: !!token,
        fetcher: () => api.analytics.getOverview(token as string, period),
    });

    // 3. Carregar dados de mapa de calor e cliques da página selecionada
    const { data: heatmapData, isLoading: loadingHeatmap, refetch: refetchHeatmap } = useApiQuery<any>(null, {
        deps: [token, selectedPath, period],
        enabled: !!token,
        fetcher: () => api.analytics.getHeatmap(token as string, selectedPath, period),
    });

    const refreshAll = () => {
        refetchPages();
        refetchOverview();
        refetchHeatmap();
    };

    const maxClicksInPoints = useMemo(() => {
        const pts = heatmapData?.points || [];
        if (pts.length === 0) return 1;
        return Math.max(1, ...pts.map((p: any) => p.count || 1));
    }, [heatmapData]);

    if (loadingOverview && !overview) return <Loading label="A carregar dados do mapa de calor..." />;
    if (errorOverview) return <ErrorBox message={errorOverview} />;

    const totalViews = overview?.totalPageviews || 0;
    const totalClicks = overview?.totalClicks || 0;
    const uniqueVisitors = overview?.uniqueVisitors || 0;
    const interactionRate = overview?.interactionRate || 0;
    const devices = overview?.devices || { desktop: 0, mobile: 0, tablet: 0 };
    const totalDevices = (devices.desktop || 0) + (devices.mobile || 0) + (devices.tablet || 0) || 1;

    return (
        <div className="space-y-6">
            <AdminHeader
                title="Mapa de Calor & Interação"
                subtitle="Análise visual de onde os visitantes clicam, navegam e quais os botões mais frequentes."
                action={
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 rounded-xl bg-gray-100 dark:bg-white/5 p-1 border border-gray-200 dark:border-white/10 text-xs">
                            {PERIODS.map(p => (
                                <button
                                    key={p.value}
                                    onClick={() => setPeriod(p.value)}
                                    className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                                        period === p.value
                                            ? "bg-primary text-white shadow-sm"
                                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                                    }`}
                                >
                                    {p.label}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={refreshAll}
                            className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-500 hover:text-primary transition-colors border border-gray-200 dark:border-white/10"
                            title="Atualizar dados"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    </div>
                }
            />

            {/* KPI Cards de Resumo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{totalViews.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Visualizações de Páginas</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <Users className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{uniqueVisitors.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sessões / Visitantes</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                        <Flame className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{totalClicks.toLocaleString()}</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliques Registados</p>
                    </div>
                </Card>

                <Card className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <Activity className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-gray-900 dark:text-white">{interactionRate}%</p>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Taxa de Interação</p>
                    </div>
                </Card>
            </div>

            {/* Barra de Controlo de Página e Modos de Visualização */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-white dark:bg-[#151e32] border border-gray-100 dark:border-white/5 shadow-sm">
                <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Página Analisada:</span>
                    <div className="min-w-[260px]">
                        <Select value={selectedPath} onChange={e => setSelectedPath(e.target.value)}>
                            {(pagesList || [{ path: "/", views: 0, clicks: 0 }]).map((p: any) => (
                                <option key={p.path} value={p.path}>
                                    {p.path === "/" ? "/ (Página Principal / Home)" : p.path} ({p.clicks || 0} cliques)
                                </option>
                            ))}
                        </Select>
                    </div>
                    <a
                        href={selectedPath}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:text-primary transition-colors text-xs font-bold"
                    >
                        <ExternalLink className="w-3.5 h-3.5" /> Abrir no Site
                    </a>
                </div>

                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10 text-xs">
                    <button
                        onClick={() => setViewMode("heatmap")}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
                            viewMode === "heatmap"
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <Flame className="w-4 h-4" /> Mapa Visual
                    </button>
                    <button
                        onClick={() => setViewMode("ranking")}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
                            viewMode === "ranking"
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <ListOrdered className="w-4 h-4" /> Ranking de Botões
                    </button>
                    <button
                        onClick={() => setViewMode("pages")}
                        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-bold transition-all ${
                            viewMode === "pages"
                                ? "bg-primary text-white shadow-sm"
                                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                        }`}
                    >
                        <BarChart3 className="w-4 h-4" /> Todas as Páginas
                    </button>
                </div>
            </div>

            {/* ── 1. MODO: MAPA DE CALOR VISUAL (CANVAS MOCKUP) ────────────────── */}
            {viewMode === "heatmap" && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-gray-100 dark:border-white/5">
                            <div>
                                <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-rose-500" /> Nuvem de Densidade de Cliques em:{" "}
                                    <span className="font-mono text-primary">{selectedPath}</span>
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {heatmapData?.totalClicks ?? 0} cliques capturados em {heatmapData?.totalPageviews ?? 0} visualizações neste período.
                                </p>
                            </div>

                            {/* Controlo de Intensidade */}
                            <div className="flex items-center gap-3 text-xs">
                                <span className="text-gray-400 font-semibold">Intensidade Térmica:</span>
                                <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-lg">
                                    {[1, 2, 3].map(lvl => (
                                        <button
                                            key={lvl}
                                            onClick={() => setHeatIntensity(lvl)}
                                            className={`px-2.5 py-1 rounded text-xs font-bold ${heatIntensity === lvl ? "bg-primary text-white" : "text-gray-500 hover:text-gray-900"}`}
                                        >
                                            {lvl}x
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Visualizador de Mockup / Heatmap Overlay */}
                        <div className="relative w-full aspect-[16/10] min-h-[480px] rounded-2xl bg-slate-900 dark:bg-[#080d1a] border border-gray-800 overflow-hidden shadow-inner flex flex-col justify-between select-none">
                            {/* Browser Mockup Top Bar */}
                            <div className="px-4 py-2.5 bg-slate-800/80 border-b border-white/10 flex items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                                    <span className="ml-3 font-mono text-[11px] text-gray-300">https://vitaleevo.ao{selectedPath}</span>
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider text-rose-400 flex items-center gap-1">
                                    <Flame className="w-3 h-3" /> Heatmap Live
                                </span>
                            </div>

                            {/* Wireframe de fundo da página simulada */}
                            <div className="relative flex-1 p-8 opacity-20 pointer-events-none flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <div className="w-32 h-6 rounded-lg bg-white/40" />
                                    <div className="flex gap-4">
                                        <div className="w-16 h-4 rounded bg-white/30" />
                                        <div className="w-16 h-4 rounded bg-white/30" />
                                        <div className="w-20 h-7 rounded-lg bg-primary/60" />
                                    </div>
                                </div>
                                <div className="space-y-4 max-w-xl">
                                    <div className="w-3/4 h-10 rounded-xl bg-white/40" />
                                    <div className="w-full h-4 rounded bg-white/20" />
                                    <div className="w-2/3 h-4 rounded bg-white/20" />
                                    <div className="flex gap-3 pt-2">
                                        <div className="w-36 h-10 rounded-xl bg-primary/80" />
                                        <div className="w-36 h-10 rounded-xl bg-white/20" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-6 pt-6">
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                    <div className="h-28 rounded-2xl bg-white/10" />
                                </div>
                            </div>

                            {/* Camada de Pontos de Calor Renderizados */}
                            <div className="absolute inset-0 top-10 pointer-events-auto">
                                {(heatmapData?.points || []).map((pt: any, idx: number) => {
                                    const density = Math.min(1, pt.count / maxClicksInPoints);
                                    const size = Math.max(28, Math.min(80, 24 + pt.count * 8 * heatIntensity));

                                    // Gradiente de calor térmico: 
                                    // baixa densidade (azul/ciano) -> média (amarelo/laranja) -> alta densidade (vermelho vivo)
                                    const heatColor =
                                        density > 0.6
                                            ? "radial-gradient(circle, rgba(239,68,68,0.95) 0%, rgba(249,115,22,0.7) 40%, rgba(234,179,8,0.3) 70%, transparent 100%)"
                                            : density > 0.3
                                            ? "radial-gradient(circle, rgba(249,115,22,0.9) 0%, rgba(234,179,8,0.6) 40%, rgba(59,130,246,0.2) 75%, transparent 100%)"
                                            : "radial-gradient(circle, rgba(56,189,248,0.85) 0%, rgba(59,130,246,0.5) 45%, rgba(99,102,241,0.15) 75%, transparent 100%)";

                                    return (
                                        <div
                                            key={idx}
                                            onMouseEnter={() => setHoveredPoint(pt)}
                                            onMouseLeave={() => setHoveredPoint(null)}
                                            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full cursor-pointer transition-transform hover:scale-125 z-10"
                                            style={{
                                                left: `${pt.x}%`,
                                                top: `${pt.y}%`,
                                                width: `${size}px`,
                                                height: `${size}px`,
                                                background: heatColor,
                                                filter: `blur(${Math.max(2, 6 - heatIntensity)}px)`,
                                            }}
                                        />
                                    );
                                })}

                                {(!heatmapData?.points || heatmapData.points.length === 0) && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                        <MousePointerClick className="w-10 h-10 mb-2 opacity-40 text-primary" />
                                        <p className="font-bold text-sm">Sem cliques registados nesta página ainda</p>
                                        <p className="text-xs text-gray-500 mt-1">Os cliques de visitantes em botões e links surgirão aqui automaticamente.</p>
                                    </div>
                                )}
                            </div>

                            {/* Tooltip Flutuante de Ponto de Calor */}
                            {hoveredPoint && (
                                <div
                                    className="absolute z-30 p-2.5 rounded-xl bg-gray-950/90 text-white text-xs backdrop-blur border border-white/20 shadow-2xl pointer-events-none -translate-x-1/2 -translate-y-full -mt-2 animate-in fade-in zoom-in-95 duration-150"
                                    style={{ left: `${hoveredPoint.x}%`, top: `${hoveredPoint.y}%` }}
                                >
                                    <p className="font-bold text-rose-400 flex items-center gap-1.5">
                                        <Flame className="w-3.5 h-3.5" /> {hoveredPoint.count} {hoveredPoint.count === 1 ? "clique" : "cliques"}
                                    </p>
                                    <p className="text-[11px] text-gray-200 mt-0.5 max-w-xs truncate">
                                        Elemento: <span className="font-mono text-primary font-bold">{hoveredPoint.text}</span>
                                    </p>
                                    <p className="text-[10px] text-gray-400">Posição: X {hoveredPoint.x}% · Y {hoveredPoint.y}%</p>
                                </div>
                            )}

                            {/* Legenda de Temperatura */}
                            <div className="px-6 py-3 bg-slate-900/90 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-gray-400">
                                <div className="flex items-center gap-3">
                                    <span className="font-bold text-gray-300">Escala Térmica:</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-sky-400" />
                                        <span className="text-[11px]">Baixa (1-2)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-amber-400" />
                                        <span className="text-[11px]">Média (3-5)</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <span className="w-3 h-3 rounded-full bg-red-500 shadow-sm shadow-red-500" />
                                        <span className="text-[11px] font-bold text-red-400">Frequência Alta (&gt;6)</span>
                                    </div>
                                </div>
                                <span className="text-[11px] text-gray-500">Passe o cursor sobre os pontos para inspecionar</span>
                            </div>
                        </div>
                    </Card>

                    {/* Tabela Resumo dos Elementos da Página Atual */}
                    <Card className="p-6">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <ListOrdered className="w-4 h-4 text-primary" /> Elementos Mais Clicados em <span className="font-mono text-primary">{selectedPath}</span>
                        </h3>
                        <Table headers={["Elemento / Botão", "Tipo", "Nº de Cliques", "Frequência Relativa"]}>
                            {(heatmapData?.elements || []).map((el: any, idx: number) => (
                                <tr key={idx}>
                                    <Td className="font-bold text-gray-900 dark:text-white max-w-sm truncate">
                                        {el.label}
                                    </Td>
                                    <Td>
                                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                            &lt;{el.tag}&gt;
                                        </span>
                                    </Td>
                                    <Td className="font-bold text-rose-500">
                                        {el.clicks} cliques
                                    </Td>
                                    <Td>
                                        <div className="flex items-center gap-3 min-w-[140px]">
                                            <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                                <div className="h-full rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${el.percentage}%` }} />
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{el.percentage}%</span>
                                        </div>
                                    </Td>
                                </tr>
                            ))}
                            {(!heatmapData?.elements || heatmapData.elements.length === 0) && (
                                <tr><td colSpan={4} className="py-8 text-center text-sm text-gray-400">Nenhum elemento clicado nesta página ainda.</td></tr>
                            )}
                        </Table>
                    </Card>
                </div>
            )}

            {/* ── 2. MODO: RANKING GLOBAL DE BOTÕES NO SITE INTEIRO ───────────── */}
            {viewMode === "ranking" && (
                <Card className="p-6 space-y-6">
                    <div>
                        <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                            <MousePointerClick className="w-5 h-5 text-primary" /> Ranking Global de Botões & Chamadas para Ação (CTA)
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                            Descubra quais são os botões que mais geram conversão e cliques em todo o site.
                        </p>
                    </div>

                    <Table headers={["Botão / Elemento", "Página de Origem", "Tag", "Total de Cliques", "Participação"]}>
                        {(overview?.topButtons || []).map((b: any, idx: number) => (
                            <tr key={idx}>
                                <Td className="font-bold text-gray-900 dark:text-white">
                                    <div className="flex items-center gap-2.5">
                                        <span className="w-6 h-6 rounded-lg bg-primary/10 text-primary text-xs font-black flex items-center justify-center">
                                            #{idx + 1}
                                        </span>
                                        <span className="max-w-xs truncate">{b.text}</span>
                                    </div>
                                </Td>
                                <Td className="font-mono text-xs text-primary">
                                    {b.path}
                                </Td>
                                <Td>
                                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400">
                                        &lt;{b.tag}&gt;
                                    </span>
                                </Td>
                                <Td className="font-black text-rose-500">
                                    {b.clicks} cliques
                                </Td>
                                <Td>
                                    <div className="flex items-center gap-3 min-w-[140px]">
                                        <div className="flex-1 h-2 rounded-full bg-gray-100 dark:bg-white/5 overflow-hidden">
                                            <div className="h-full rounded-full bg-gradient-to-r from-primary to-rose-500" style={{ width: `${b.percentage}%` }} />
                                        </div>
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-300">{b.percentage}%</span>
                                    </div>
                                </Td>
                            </tr>
                        ))}
                        {(!overview?.topButtons || overview.topButtons.length === 0) && (
                            <tr><td colSpan={5} className="py-8 text-center text-sm text-gray-400">Nenhum botão clicado registado no período selecionado.</td></tr>
                        )}
                    </Table>
                </Card>
            )}

            {/* ── 3. MODO: TODAS AS PÁGINAS & FREQUÊNCIA ─────────────────────── */}
            {viewMode === "pages" && (
                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-primary" /> Frequência de Tráfego e Interação por Rota
                        </h3>
                        <Table headers={["Página / Rota", "Visualizações", "Visitantes Únicos", "Cliques Totais", "Taxa de Interação", "Ação"]}>
                            {(overview?.topPages || []).map((p: any) => (
                                <tr key={p.path}>
                                    <Td className="font-bold font-mono text-gray-900 dark:text-white">
                                        {p.path}
                                    </Td>
                                    <Td>{p.visits}</Td>
                                    <Td>{p.uniqueVisitors}</Td>
                                    <Td className="font-bold text-rose-500">{p.clicks}</Td>
                                    <Td>
                                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600">
                                            {p.interactionRate}%
                                        </span>
                                    </Td>
                                    <Td>
                                        <button
                                            onClick={() => { setSelectedPath(p.path); setViewMode("heatmap"); }}
                                            className="px-3 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 text-xs font-bold transition-colors"
                                        >
                                            Ver Mapa de Calor &rarr;
                                        </button>
                                    </Td>
                                </tr>
                            ))}
                            {(!overview?.topPages || overview.topPages.length === 0) && (
                                <tr><td colSpan={6} className="py-8 text-center text-sm text-gray-400">Nenhuma visita a páginas registada no período.</td></tr>
                            )}
                        </Table>
                    </Card>

                    {/* Divisão por Dispositivos */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                                    <Monitor className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Computador (Desktop)</p>
                                    <p className="text-xs text-gray-500">{devices.desktop || 0} acessos</p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                                {Math.round(((devices.desktop || 0) / totalDevices) * 100)}%
                            </span>
                        </Card>

                        <Card className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Telemóvel (Mobile)</p>
                                    <p className="text-xs text-gray-500">{devices.mobile || 0} acessos</p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                                {Math.round(((devices.mobile || 0) / totalDevices) * 100)}%
                            </span>
                        </Card>

                        <Card className="p-5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
                                    <Tablet className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-sm text-gray-900 dark:text-white">Tablet</p>
                                    <p className="text-xs text-gray-500">{devices.tablet || 0} acessos</p>
                                </div>
                            </div>
                            <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                                {Math.round(((devices.tablet || 0) / totalDevices) * 100)}%
                            </span>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
