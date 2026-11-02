"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import ConceptBackdrop, { CONCEPT_IMAGES } from "./ConceptBackdrop";
import HeroVideoEffect from "./HeroVideoEffect";

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

                    {/* Direita — efeito cinematográfico exclusivo do hero da home */}
                    <HeroVideoEffect reduceMotion={Boolean(reduceMotion)} />
                </div>
            </div>
        </section>
    );
}
