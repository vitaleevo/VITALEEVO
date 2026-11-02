"use client";

import { motion } from "framer-motion";
import {
    Bot,
    Braces,
    ChartNoAxesCombined,
    Megaphone,
    Workflow,
} from "lucide-react";

const services = [
    { label: "Web & Sistemas", icon: Braces, position: "left-[7%] top-[17%]" },
    { label: "Inteligência Artificial", icon: Bot, position: "right-[4%] top-[28%]" },
    { label: "Marketing Digital", icon: Megaphone, position: "bottom-[17%] right-[8%]" },
    { label: "Automação", icon: Workflow, position: "bottom-[9%] left-[8%]" },
];

type HeroVideoEffectProps = {
    reduceMotion: boolean;
};

export default function HeroVideoEffect({ reduceMotion }: HeroVideoEffectProps) {
    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, scale: 0.96, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative mx-auto aspect-[1.08] w-full max-w-[540px]"
            aria-label="Ecossistema digital Vitaleevo: websites, inteligência artificial, marketing e automação conectados"
        >
            <div className="absolute inset-0 overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 shadow-[0_36px_100px_-32px_rgba(15,23,42,0.65)]">
                {/* Cinematic background */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_48%_42%,rgba(134,37,210,0.38),transparent_34%),radial-gradient(circle_at_78%_18%,rgba(16,185,129,0.18),transparent_26%),linear-gradient(145deg,#0f172a_0%,#111827_48%,#090d18_100%)]" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-[length:42px_42px] opacity-[0.12] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[length:100%_4px] opacity-40" />
                <div className="absolute inset-0 shadow-[inset_0_0_90px_rgba(0,0,0,0.65)]" />

                {/* Slow camera and light movement create the video feel without a heavy media file. */}
                {!reduceMotion && (
                    <>
                        <motion.div
                            aria-hidden
                            className="absolute -left-1/3 top-[-20%] h-[150%] w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl"
                            animate={{ x: [0, 760] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "linear", repeatDelay: 1.5 }}
                        />
                        <motion.div
                            aria-hidden
                            className="absolute left-[12%] top-[12%] h-[76%] w-[76%] rounded-full border border-primary-light/20"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                        >
                            <span className="absolute left-1/2 top-[-4px] h-2 w-2 rounded-full bg-secondary shadow-[0_0_18px_5px_rgba(16,185,129,0.55)]" />
                            <span className="absolute bottom-[12%] right-[7%] h-1.5 w-1.5 rounded-full bg-primary-light shadow-[0_0_16px_4px_rgba(168,85,240,0.6)]" />
                        </motion.div>
                        <motion.div
                            aria-hidden
                            className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-secondary/70 to-transparent shadow-[0_0_18px_rgba(16,185,129,0.8)]"
                            animate={{ top: ["12%", "88%", "12%"] }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                        />
                    </>
                )}

                {/* Connected brand ecosystem */}
                <div className="absolute left-1/2 top-1/2 h-[42%] w-[42%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary-light/25">
                    <motion.div
                        className="absolute inset-[12%] flex flex-col items-center justify-center rounded-full border border-white/10 bg-slate-950/80 text-center shadow-[0_0_60px_rgba(134,37,210,0.32)] backdrop-blur-xl"
                        animate={reduceMotion ? undefined : { scale: [1, 1.035, 1], boxShadow: ["0 0 45px rgba(134,37,210,.25)", "0 0 75px rgba(134,37,210,.48)", "0 0 45px rgba(134,37,210,.25)"] }}
                        transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white shadow-lg shadow-primary/30">
                            <ChartNoAxesCombined className="h-5 w-5" />
                        </span>
                        <span className="mt-3 font-display text-[11px] font-extrabold uppercase tracking-[0.2em] text-white">
                            Vitaleevo
                        </span>
                        <span className="mt-1 text-[9px] font-medium text-slate-400">Evolução digital</span>
                    </motion.div>
                </div>

                <svg aria-hidden className="absolute inset-0 h-full w-full opacity-70" viewBox="0 0 540 500" fill="none">
                    <motion.path d="M125 115 C195 120 195 205 252 225" stroke="url(#hero-line-a)" strokeWidth="1.25" strokeDasharray="5 7" animate={reduceMotion ? undefined : { strokeDashoffset: [0, -48] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M415 165 C345 170 350 215 288 235" stroke="url(#hero-line-b)" strokeWidth="1.25" strokeDasharray="5 7" animate={reduceMotion ? undefined : { strokeDashoffset: [0, -48] }} transition={{ duration: 3.6, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M405 390 C345 350 342 298 288 275" stroke="url(#hero-line-a)" strokeWidth="1.25" strokeDasharray="5 7" animate={reduceMotion ? undefined : { strokeDashoffset: [0, -48] }} transition={{ duration: 3.3, repeat: Infinity, ease: "linear" }} />
                    <motion.path d="M128 408 C195 360 200 306 252 278" stroke="url(#hero-line-b)" strokeWidth="1.25" strokeDasharray="5 7" animate={reduceMotion ? undefined : { strokeDashoffset: [0, -48] }} transition={{ duration: 3.9, repeat: Infinity, ease: "linear" }} />
                    <defs>
                        <linearGradient id="hero-line-a"><stop stopColor="#A855F0" stopOpacity=".15" /><stop offset="1" stopColor="#A855F0" /></linearGradient>
                        <linearGradient id="hero-line-b"><stop stopColor="#10B981" stopOpacity=".15" /><stop offset="1" stopColor="#10B981" /></linearGradient>
                    </defs>
                </svg>

                {services.map(({ label, icon: Icon, position }, index) => (
                    <motion.div
                        key={label}
                        className={`absolute ${position} flex items-center gap-1.5 rounded-lg border border-white/10 bg-slate-900/75 px-2 py-2 text-white shadow-xl backdrop-blur-md sm:gap-2.5 sm:rounded-xl sm:px-3 sm:py-2.5`}
                        animate={reduceMotion ? undefined : { y: [0, index % 2 ? 7 : -7, 0] }}
                        transition={{ duration: 5 + index * 0.6, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 }}
                    >
                        <span className={`flex h-7 w-7 items-center justify-center rounded-lg sm:h-8 sm:w-8 ${index % 2 ? "bg-secondary/15 text-secondary" : "bg-primary/20 text-primary-light"}`}>
                            <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        </span>
                        <span className="whitespace-nowrap text-[8px] font-bold tracking-wide sm:text-[10px]">{label}</span>
                    </motion.div>
                ))}

                <div className="absolute inset-x-6 bottom-5 flex items-center gap-3">
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/55">Transformar</span>
                    <div className="h-0.5 flex-1 overflow-hidden rounded-full bg-white/10">
                        <motion.div
                            className="h-full origin-left bg-gradient-to-r from-primary-light to-secondary"
                            animate={reduceMotion ? { scaleX: 1 } : { scaleX: [0, 1] }}
                            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                        />
                    </div>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-secondary">Evoluir</span>
                </div>
            </div>

            <div aria-hidden className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-transparent to-secondary/20 blur-2xl" />
        </motion.div>
    );
}
