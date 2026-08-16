"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, TrendingUp, Bot, BarChart3, Check } from "lucide-react";
import ConceptBackdrop, { CONCEPT_IMAGES } from "./ConceptBackdrop";

const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } },
};

const item = {
    hidden: { opacity: 0, y: 24 },
    show: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
    },
};

const bars = [34, 48, 40, 62, 54, 78, 66, 92, 74, 100, 86, 96];

export default function Hero() {
    const reduceMotion = useReducedMotion();

    const particles = useMemo(
        () =>
            Array.from({ length: 16 }, (_, i) => ({
                left: `${(i * 53 + 7) % 100}%`,
                top: `${(i * 37 + 10) % 88}%`,
                size: 3 + ((i * 7) % 5),
                delay: (i % 8) * 0.7,
                duration: 5 + (i % 6),
                opacity: 0.2 + ((i * 13) % 30) / 100,
            })),
        []
    );

    return (
        <section className="relative overflow-hidden bg-background-light pt-28 pb-16 dark:bg-background-dark md:pt-36 md:pb-24">
            {/* Fundo: conceito africano de negócio/vendas + gradiente em movimento + partículas */}
            <ConceptBackdrop image={CONCEPT_IMAGES.home} />
            <div aria-hidden className="pointer-events-none absolute inset-0">
                <motion.div
                    className="absolute -top-24 left-[15%] h-[400px] w-[400px] rounded-full bg-primary/15 blur-3xl"
                    animate={reduceMotion ? undefined : { x: [0, 44, 0], y: [0, 26, 0] }}
                    transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                    className="absolute bottom-0 right-[-6%] h-[360px] w-[360px] rounded-full bg-secondary/10 blur-3xl"
                    animate={reduceMotion ? undefined : { x: [0, -32, 0], y: [0, -22, 0] }}
                    transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
                />
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.18]" />
                {!reduceMotion &&
                    particles.map((p, i) => (
                        <motion.span
                            key={i}
                            className="absolute rounded-full bg-primary/40"
                            style={{
                                left: p.left,
                                top: p.top,
                                width: p.size,
                                height: p.size,
                                opacity: p.opacity,
                            }}
                            animate={{ y: [0, -26, 0] }}
                            transition={{
                                duration: p.duration,
                                repeat: Infinity,
                                ease: "easeInOut",
                                delay: p.delay,
                            }}
                        />
                    ))}
            </div>

            <div className="wrap relative z-10">
                <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Esquerda — mensagem principal fixa */}
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="mx-auto max-w-2xl lg:mx-0"
                    >
                        <motion.span variants={item} className="eyebrow inline-flex">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                            </span>
                            Agência de Tecnologia & Marketing — Luanda
                        </motion.span>

                        <motion.h1
                            variants={item}
                            className="mt-6 font-display text-4xl font-extrabold leading-[1.06] tracking-tight text-slate-900 sm:text-5xl md:text-6xl dark:text-white"
                        >
                            Transformamos Empresas com{" "}
                            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
                                Tecnologia, Marketing e Automação
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={item}
                            className="mt-6 max-w-xl text-lg leading-relaxed text-slate-500 dark:text-slate-400"
                        >
                            Criamos websites, sistemas empresariais e estratégias digitais
                            que aumentam vendas e produtividade.
                        </motion.p>

                        <motion.ul
                            variants={item}
                            className="mt-7 grid max-w-xl grid-cols-1 gap-x-6 gap-y-2.5 sm:grid-cols-2"
                        >
                            {[
                                "Websites Profissionais",
                                "Marketing Digital",
                                "Sistemas Empresariais",
                                "Infraestrutura TI",
                            ].map((solution) => (
                                <li key={solution} className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                                        <Check className="h-3 w-3" strokeWidth={3} />
                                    </span>
                                    {solution}
                                </li>
                            ))}
                        </motion.ul>

                        <motion.div
                            variants={item}
                            className="mt-9 flex flex-col gap-4 sm:flex-row"
                        >
                            <Link
                                href="/contact"
                                className="btn-primary group !py-4 !text-base"
                            >
                                Solicitar Proposta
                                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link href="/portfolio" className="btn-ghost !py-4 !text-base">
                                Ver Portfólio
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Direita — mockups flutuantes */}
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, scale: 0.94, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        className="relative mx-auto hidden h-[440px] w-full max-w-md lg:block"
                    >
                        {/* Card principal: mockup de dashboard */}
                        <motion.div
                            animate={reduceMotion ? undefined : { y: [0, -10, 0] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute left-0 top-6 w-[86%] rounded-3xl border border-slate-200/70 bg-white p-5 shadow-card dark:border-white/10 dark:bg-[#151e32]"
                        >
                            <div className="mb-4 flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                                <span className="ml-3 flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1 text-[10px] font-bold text-slate-400 dark:bg-white/5">
                                    <BarChart3 className="h-3 w-3" />
                                    painel.vitaleevo.ao
                                </span>
                            </div>
                            <div className="flex items-end justify-between gap-2 rounded-2xl bg-slate-50 p-4 dark:bg-black/20">
                                <div className="flex items-end gap-1.5">
                                    {bars.map((h, i) => (
                                        <motion.span
                                            key={i}
                                            className="w-2.5 rounded-t-md bg-gradient-to-t from-primary to-primary-light"
                                            animate={
                                                reduceMotion
                                                    ? undefined
                                                    : { height: [`${h * 0.5}px`, `${h * 0.9}px`, `${h * 0.5}px`] }
                                            }
                                            transition={{
                                                duration: 3.2,
                                                repeat: Infinity,
                                                ease: "easeInOut",
                                                delay: i * 0.18,
                                            }}
                                        />
                                    ))}
                                </div>
                                <motion.span
                                    className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-600 dark:bg-green-500/15 dark:text-green-400"
                                    animate={reduceMotion ? undefined : { scale: [1, 1.06, 1] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                >
                                    ▲ 127%
                                </motion.span>
                            </div>
                            <div className="mt-4 grid grid-cols-3 gap-3">
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-black/20">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Cliques
                                    </p>
                                    <p className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">
                                        48.2k
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-black/20">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        Leads
                                    </p>
                                    <p className="mt-1 font-display text-lg font-extrabold text-slate-900 dark:text-white">
                                        3.4k
                                    </p>
                                </div>
                                <div className="rounded-xl bg-slate-50 p-3 dark:bg-black/20">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                        ROI
                                    </p>
                                    <p className="mt-1 font-display text-lg font-extrabold text-primary dark:text-primary-light">
                                        6.8x
                                    </p>
                                </div>
                            </div>
                        </motion.div>

                        {/* Card flutuante: crescimento */}
                        <motion.div
                            animate={reduceMotion ? undefined : { y: [0, -14, 0] }}
                            transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
                            className="absolute -right-2 top-0 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#151e32]/95"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-500/15 text-green-500">
                                <TrendingUp className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
                                    +127%
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Crescimento médio
                                </p>
                            </div>
                        </motion.div>

                        {/* Card flutuante: automação IA */}
                        <motion.div
                            animate={reduceMotion ? undefined : { y: [0, 12, 0] }}
                            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1.4 }}
                            className="absolute bottom-6 left-2 flex items-center gap-3 rounded-2xl border border-slate-200/70 bg-white/95 p-4 shadow-card backdrop-blur dark:border-white/10 dark:bg-[#151e32]/95"
                        >
                            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                                <Bot className="h-5 w-5" />
                            </span>
                            <div>
                                <p className="font-display text-base font-extrabold text-slate-900 dark:text-white">
                                    Automação IA
                                </p>
                                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                                    Processos 10x mais rápidos
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}