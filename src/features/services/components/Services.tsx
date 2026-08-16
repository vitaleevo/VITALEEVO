"use client";

import React from "react";
import Link from "next/link";
import {
  Layers,
  Calendar,
  Brush,
  Code,
  Smartphone,
  Rocket,
  Brain,
  BarChart3,
  Router,
  CheckCircle,
  ArrowRight,
  Headset,
  Zap,
  Shield,
  TrendingUp,
} from "lucide-react";
import FeaturedProjectsSlider from "@/shared/components/FeaturedProjectsSlider";
import FeaturedArticlesSlider from "@/shared/components/FeaturedArticlesSlider";
import ConceptBackdrop, { CONCEPT_IMAGES } from "@/shared/components/ConceptBackdrop";

const Services: React.FC = () => {
  const categories = [
    {
      icon: <Brush className="h-8 w-8" />,
      title: "Branding e Design",
      desc: "Criamos identidades visuais memoráveis que conectam sua marca ao coração do público.",
      items: ["Logotipos & Identidade", "UI/UX Design", "Material Gráfico", "Design Systems"],
      slug: "branding-design",
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: "Desenvolvimento Web",
      desc: "Sites e aplicações web de alta performance, seguros e otimizados para conversão.",
      items: ["Websites Institucionais", "E-commerce", "Sistemas Web (SaaS)", "Landing Pages"],
      slug: "web-development",
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Aplicações Móveis",
      desc: "Apps nativas e híbridas que colocam o seu negócio na palma da mão do cliente.",
      items: ["iOS & Android", "React Native / Flutter", "Prototipagem", "Hospedagem em Lojas"],
      slug: "mobile-apps",
    },
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "Marketing Digital",
      desc: "Estratégias baseadas em dados para escalar as suas vendas e presença online.",
      items: ["Gestão de Tráfego", "SEO & Conteúdo", "Social Media", "E-mail Marketing"],
      slug: "marketing-digital",
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "Consultoria Tech",
      desc: "Orientação especializada para modernizar processos e escolher as melhores ferramentas.",
      items: ["Transformação Digital", "Arquitetura de Software", "Auditoria de Código", "Cloud Computing"],
      slug: "tech-consulting",
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: "Data & Analytics",
      desc: "Transforme dados brutos em insights acionáveis para tomadas de decisão inteligentes.",
      items: ["Dashboards BI", "Google Analytics 4", "Rastreamento de Dados", "Relatórios Mensais"],
      slug: "data-analytics",
    },
    {
      icon: <Router className="h-8 w-8" />,
      title: "Infraestrutura e Segurança",
      desc: "Soluções robustas para proteção e conectividade do seu negócio.",
      items: ["Redes e Cabeamento", "Câmeras de Segurança (CFTV)", "Sistemas Biométricos", "Controlo de Acesso"],
      slug: "infra-security",
    },
  ];

  const differentiators = [
    { title: "Velocidade Incomparável", desc: "Sites que carregam em milissegundos, melhorando seu ranking e a satisfação do cliente.", icon: <Zap className="h-6 w-6" /> },
    { title: "Segurança Militar", desc: "Proteção contra ataques DDoS, criptografia de dados e backups automáticos diários.", icon: <Shield className="h-6 w-6" /> },
    { title: "Escalabilidade", desc: "Sistemas preparados para crescer junto com seu negócio, sem refazer tudo do zero.", icon: <TrendingUp className="h-6 w-6" /> },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ===== Hero (light) ===== */}
      <section className="relative overflow-hidden bg-background-light pt-28 pb-16 md:pt-40 md:pb-24 dark:bg-background-dark">
        <ConceptBackdrop image={CONCEPT_IMAGES.services} />
        <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-primary-glow/50 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-secondary-light/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.3]" />

        <div className="wrap relative z-10 text-center">
          <span className="eyebrow justify-center">
            <Layers className="h-4 w-4" />
            Soluções 360º
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
            Tecnologia de ponta para{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              resultados reais
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Não entregamos apenas serviços; entregamos ecossistemas digitais completos. Do
            design à infraestrutura, cuidamos de tudo para que você foque no crescimento do
            seu negócio.
          </p>
          <div className="mt-9 flex justify-center">
            <Link href="/contact" className="btn-primary group">
              <span>Agendar Consultoria</span>
              <Calendar className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== Services Grid ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, idx) => (
              <Link
                key={idx}
                href={`/services/${cat.slug}`}
                className="card-hover group flex flex-col p-7"
              >
                <span className="icon-tile mb-6 transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  {cat.icon}
                </span>
                <h3 className="mb-3 font-display text-xl font-bold text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                  {cat.title}
                </h3>
                <p className="mb-6 leading-relaxed text-slate-500 dark:text-slate-400">{cat.desc}</p>

                <ul className="mb-6 space-y-2.5 border-t border-slate-100 pt-6 dark:border-white/5">
                  {cat.items.map((item, i) => (
                    <li key={i} className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-4 w-4 shrink-0 text-secondary" />
                      {item}
                    </li>
                  ))}
                </ul>

                <span className="mt-auto inline-flex items-center gap-2 text-sm font-bold text-primary">
                  Saber mais
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Projects ===== */}
      <FeaturedProjectsSlider />

      {/* ===== Tech Stack ===== */}
      <section className="section-pad bg-background-light dark:bg-background-dark">
        <div className="wrap">
          <p className="mb-10 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Tecnologias que dominamos
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 opacity-70 transition-all duration-500 hover:opacity-100 md:gap-10">
            {["React", "Next.js", "Node.js", "TypeScript", "Tailwind", "Python", "AWS", "Flutter"].map((tech, i) => (
              <span key={i} className="font-display text-2xl font-extrabold text-slate-300 transition-colors dark:text-slate-600">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Why Choose Us ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div className="relative order-2 lg:order-1">
              <div className="absolute -inset-4 rounded-[2rem] bg-primary-faint blur-2xl" />
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 shadow-card dark:border-white/10">
                <img
                  src="https://images.unsplash.com/photo-1553877606-3c6691aac949?auto=format&fit=crop&q=80&w=800"
                  alt="Equipa VitalEvo a trabalhar"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 p-6 backdrop-blur-sm">
                  <div className="flex items-center gap-4">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white">
                      <Headset className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-bold text-white">Suporte Dedicado</p>
                      <p className="text-sm text-slate-300">Acompanhamento pós-entrega incluso.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="eyebrow">Nosso Diferencial</span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                Por que empresas líderes escolhem a{" "}
                <span className="text-primary">VitalEvo?</span>
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                Não somos apenas "fazedores de sites". Somos engenheiros de crescimento.
                Cada linha de código que escrevemos tem um propósito comercial claro.
              </p>

              <div className="mt-8 space-y-6">
                {differentiators.map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="icon-tile">{item.icon}</span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Featured Articles ===== */}
      <FeaturedArticlesSlider />

      {/* ===== Final CTA ===== */}
      <section className="section-pad bg-background-light dark:bg-background-dark">
        <div className="wrap">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              Tenha uma equipe de TI completa à sua disposição
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Por uma fração do custo de contratar internamente, você tem acesso a
              especialistas em Design, Desenvolvimento e Marketing.
            </p>
            <Link href="/contact" className="btn-primary mt-8">
              Falar com Especialistas
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;