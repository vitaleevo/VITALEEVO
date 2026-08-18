"use client";

import React from "react";
import Link from "next/link";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Globe,
  Megaphone,
  Bot,
  Network,
  Sparkles,
  ShieldCheck,
  Shield,
  Camera,
  ShoppingBag,
} from "lucide-react";
import Hero from "@/shared/components/Hero";
import AnimatedCounter from "@/shared/components/AnimatedCounter";
import ConceptBackdrop, { CONCEPT_IMAGES } from "@/shared/components/ConceptBackdrop";

const socialProof = [
  { value: 150, suffix: "+", label: "Projetos Entregues" },
  { value: 80, suffix: "+", label: "Clientes Atendidos" },
  { value: 14, suffix: "+", label: "Províncias" },
  { value: 98, suffix: "%", label: "Taxa de Satisfação" },
];

const clientLogos = [
  "IPS Visão",
  "Bajaj Angola",
  "Traders Agrícola",
  "Silvaparque",
  "RCCG",
  "Motangol",
  "RTS",
  "Jondela",
  "MantechPro",
  "Eagle General Companies",
  "Haojue Internacional",
];

const serviceIconMap: Record<string, React.ReactNode> = {
  globe: <Globe className="h-6 w-6" />,
  megaphone: <Megaphone className="h-6 w-6" />,
  bot: <Bot className="h-6 w-6" />,
  network: <Network className="h-6 w-6" />,
  sparkles: <Sparkles className="h-6 w-6" />,
  shield: <Shield className="h-6 w-6" />,
  camera: <Camera className="h-6 w-6" />,
  "shopping-bag": <ShoppingBag className="h-6 w-6" />,
};

const fallbackServiceIcon = <Sparkles className="h-6 w-6" />;

const serviceGroups = [
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Desenvolvimento Web",
    tagline: "A sua vitrine digital a converter visitantes em clientes.",
    items: ["Websites", "E-commerce", "Sistemas Web"],
  },
  {
    icon: <Megaphone className="h-6 w-6" />,
    title: "Marketing Digital",
    tagline: "Tráfego qualificado e campanhas que geram vendas.",
    items: ["Gestão de Redes Sociais", "Meta Ads", "Google Ads", "SEO"],
  },
  {
    icon: <Bot className="h-6 w-6" />,
    title: "Sistemas & Automação",
    tagline: "Processos otimizados com ERP, IA e integrações.",
    items: ["ERP", "IA", "Integrações"],
  },
  {
    icon: <Network className="h-6 w-6" />,
    title: "Infraestrutura TI",
    tagline: "Redes, segurança e equipamentos para a sua operação.",
    items: ["Redes", "CCTV", "Biometria"],
  },
];

const whyUs = [
  "Equipa Local",
  "Atendimento Nacional",
  "Soluções Personalizadas",
  "Suporte Técnico",
  "Marketing + Tecnologia no mesmo local",
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Home: React.FC = () => {
const { data: featuredProjects } = useApiQuery<any[]>(null, { deps: [], fetcher: () => api.projects.getFeatured(3) });

  const { data: dbServices } = useApiQuery<any[]>(null, { deps: [], fetcher: () => api.services.getAll() });
  const services: any[] = dbServices && dbServices.length > 0
    ? dbServices.map((s) => ({
        icon: serviceIconMap[s.icon] || fallbackServiceIcon,
        title: s.title,
        tagline: s.subtitle,
        items: s.features,
      }))
    : serviceGroups;

  return (
    <div className="overflow-x-hidden">
      {/* ===== 1. Hero — mensagem comercial única ===== */}
      <Hero />

      {/* ===== 2. Prova Social (números antes dos serviços) ===== */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary via-primary-dark to-primary-darker py-12">
        <ConceptBackdrop image={CONCEPT_IMAGES.analytics} overlay={false} />
        <div className="absolute -left-20 -top-20 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-secondary/25 blur-3xl" />
        <div className="wrap relative">
          <div className="grid grid-cols-2 gap-10 lg:grid-cols-4">
            {socialProof.map((stat, idx) => (
              <motion.div
                key={stat.label}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="text-center"
              >
                <p className="font-display text-4xl font-black text-white md:text-5xl">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </p>
                <p className="mt-2 text-sm font-semibold text-white/80">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 3. Empresas que confiam ===== */}
      <section className="section-pad bg-background-light py-16 dark:bg-background-dark">
        <div className="wrap">
          <p className="text-center text-xs font-black uppercase tracking-[0.2em] text-slate-400">
            Empresas que confiam na VitalEvo
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
            {clientLogos.map((name, idx) => (
              <motion.span
                key={name}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="font-display text-xl font-extrabold tracking-tight text-slate-400 transition-colors hover:text-primary md:text-2xl dark:text-slate-600 dark:hover:text-primary-light"
              >
                {name}
              </motion.span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 4. Serviços (concretos, por prioridade comercial) ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="section-head mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">O que fazemos</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Serviços que geram resultado
            </h2>
          </div>

          <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
            {services.map((group, idx) => (
              <motion.div
                key={group.title}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true }}
                custom={idx}
                variants={fadeUp}
                className="card-hover group p-8"
              >
                <div className="flex items-center gap-4">
                  <span className="icon-tile transition-all duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                    {group.icon}
                  </span>
                  <div>
                    <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
                      {group.title}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                      {group.tagline}
                    </p>
                  </div>
                </div>
                <ul className="mt-6 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  {group.items.map((item: string) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors group-hover:bg-primary/5 dark:bg-white/5 dark:text-slate-300"
                    >
                      <Check className="h-4 w-4 shrink-0 text-green-500" strokeWidth={3} />
                      {item}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== 5. Casos de Sucesso (destaque) ===== */}
      {featuredProjects && featuredProjects.length > 0 && (
        <section className="section-pad bg-background-light dark:bg-background-dark">
          <div className="wrap">
            <div className="section-head flex flex-col items-end justify-between gap-4 md:flex-row">
              <div>
                <span className="eyebrow">
                  <Sparkles className="h-4 w-4" />
                  Casos de Sucesso
                </span>
                <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                  Resultados reais para empresas reais
                </h2>
              </div>
              <Link
                href="/portfolio"
                className="group inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary dark:text-slate-200"
              >
                Ver Portfólio Completo
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
              {featuredProjects.slice(0, 4).map((project, idx) => (
                <motion.div
                  key={project._id}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={idx}
                  variants={fadeUp}
                  className="card group overflow-hidden"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white shadow-lg">
                      {project.category}
                    </span>
                  </div>
                  <div className="p-8">
                    <h3 className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                      {project.title}
                    </h3>
                    {project.client && (
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-primary-light">
                        Cliente: {project.client}
                      </p>
                    )}

                    <div className="mt-6 space-y-4 border-t border-slate-100 pt-6 dark:border-white/5">
                      {project.challenge && (
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-xs font-black uppercase tracking-wider text-red-400">Problema</span>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {project.challenge}
                          </p>
                        </div>
                      )}
                      {project.solution && (
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-xs font-black uppercase tracking-wider text-amber-500">Solução</span>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {project.solution}
                          </p>
                        </div>
                      )}
                      {project.results && project.results.length > 0 && (
                        <div className="flex gap-3">
                          <span className="mt-0.5 text-xs font-black uppercase tracking-wider text-green-500">Resultado</span>
                          <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                            {project.results[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== 6. Porque escolher a VitalEvo ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="eyebrow">A nossa diferença</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                Porque escolher a VitalEvo?
              </h2>
              <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
                Uma equipa única para todo o seu ecossistema digital — sem intermediários,
                sem atrasos.
              </p>
              <Link
                href="/contact"
                className="btn-primary mt-8 group"
              >
                Falar com a Equipa
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {whyUs.map((item, idx) => (
                <motion.li
                  key={item}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true }}
                  custom={idx}
                  variants={fadeUp}
                  className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/60 px-5 py-4 font-semibold text-slate-800 dark:border-white/5 dark:bg-white/5 dark:text-slate-200"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-green-500">
                    <Check className="h-4 w-4" strokeWidth={3} />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ===== 7. CTA Final — proposta gratuita ===== */}
      <section className="section-pad relative overflow-hidden">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary via-primary-dark to-primary-darker px-6 py-16 text-center shadow-lift md:px-16 md:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-black uppercase tracking-widest text-white">
                <ShieldCheck className="h-4 w-4" />
                Sem compromisso
              </span>
              <h2 className="mt-6 font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Receba uma Proposta Gratuita
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg font-light text-white/80">
                Analisamos o seu negócio e apresentamos uma solução personalizada para
                aumentar as suas vendas e eficiência.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 font-display text-lg font-extrabold text-primary shadow-lg transition-all hover:-translate-y-1"
                >
                  Solicitar Proposta
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;