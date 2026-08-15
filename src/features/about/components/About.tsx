"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle,
  Flag,
  Eye,
  Diamond,
  Store,
  GraduationCap,
  Globe,
  TrendingUp,
  Search,
  LayoutGrid,
  Code,
  Rocket,
  ArrowRight,
} from "lucide-react";
import FeaturedProjectsSlider from "@/shared/components/FeaturedProjectsSlider";
import FeaturedArticlesSlider from "@/shared/components/FeaturedArticlesSlider";

const About: React.FC = () => {
  const values = [
    "Inovação Constante",
    "Transparência Radical",
    "Foco no Cliente",
    "Excelência Angolana",
  ];

  const process = [
    { icon: <Search className="h-6 w-6" />, title: "Imersão", desc: "Entendemos profundamente seus objetivos e mercado." },
    { icon: <LayoutGrid className="h-6 w-6" />, title: "Estratégia", desc: "Definimos o plano de ação e cronograma." },
    { icon: <Code className="h-6 w-6" />, title: "Execução", desc: "Designers e devs trabalham juntos para dar vida." },
    { icon: <Rocket className="h-6 w-6" />, title: "Entrega", desc: "Lançamento e monitoramento contínuo." },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ===== Hero (light) ===== */}
      <section className="relative overflow-hidden bg-background-light pt-28 pb-16 md:pt-40 md:pb-24 dark:bg-background-dark">
        <div className="absolute -right-40 top-0 h-[420px] w-[420px] rounded-full bg-primary-glow/50 blur-[120px]" />
        <div className="absolute -left-32 bottom-0 h-[380px] w-[380px] rounded-full bg-secondary-light/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.3]" />

        <div className="wrap relative z-10">
          <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-16">
            {/* Image side */}
            <div className="relative order-2 mx-auto w-full max-w-lg lg:order-1">
              <div className="relative animate-float">
                <div className="absolute -inset-4 rounded-[2rem] bg-primary-faint blur-2xl" />
                <img
                  alt="Equipa VitalEvo"
                  className="relative z-10 h-[420px] w-full rounded-3xl border border-slate-200/80 object-cover shadow-card dark:border-white/10"
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=800"
                />
                <div className="card absolute -bottom-6 -right-4 z-20 hidden max-w-xs !rounded-2xl !p-6 md:block">
                  <p className="mb-1 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-secondary">
                    <span className="h-2 w-2 rounded-full bg-secondary" />
                    Experiência
                  </p>
                  <p className="font-display text-4xl font-extrabold text-slate-900 dark:text-white">10+</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Anos transformando negócios digitais em Angola.
                  </p>
                </div>
              </div>
            </div>

            {/* Text side */}
            <div className="order-1 lg:order-2">
              <span className="eyebrow">
                <CheckCircle className="h-4 w-4 text-secondary" />
                Quem Somos
              </span>
              <h1 className="mt-4 font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white">
                Nós somos a <span className="text-primary">Vitaleevo</span>
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                Mais do que uma agência digital, somos parceiros estratégicos para empresas
                que desejam liderar o mercado angolano. Unificamos criatividade, dados e
                tecnologia para construir marcas fortes e duradouras.
              </p>
              <blockquote className="mt-8 border-l-2 border-primary/40 pl-5">
                <p className="text-lg italic text-slate-600 dark:text-slate-300">
                  "Acreditamos que o potencial de Angola é ilimitado. Nossa missão é
                  desbloquear esse potencial através da transformação digital."
                </p>
              </blockquote>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Mission / Vision / Values ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="section-head mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Nossa Bússola</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Missão, Visão e Valores
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Os pilares que sustentam cada linha de código, cada pixel e cada estratégia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="card-hover group p-7">
              <span className="icon-tile mb-5 bg-blue-50 text-blue-600 transition-all group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-500/15 dark:text-blue-400">
                <Flag className="h-7 w-7" />
              </span>
              <h3 className="mb-3 font-display text-xl font-bold text-slate-900 dark:text-white">Missão</h3>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                Empoderar empresas angolanas com soluções digitais de classe mundial,
                transformando desafios locais em oportunidades globais através da inovação
                e excelência técnica.
              </p>
            </div>

            <div className="card-hover group p-7">
              <span className="icon-tile mb-5 transition-all group-hover:bg-primary group-hover:text-white">
                <Eye className="h-7 w-7" />
              </span>
              <h3 className="mb-3 font-display text-xl font-bold text-slate-900 dark:text-white">Visão</h3>
              <p className="leading-relaxed text-slate-500 dark:text-slate-400">
                Ser o principal catalisador da economia digital em Angola até 2030,
                reconhecidos como referência em qualidade, integridade e impacto real nos
                negócios.
              </p>
            </div>

            <div className="card-hover group p-7">
              <span className="icon-tile mb-5 bg-secondary-faint text-secondary transition-all group-hover:bg-secondary group-hover:text-white dark:bg-secondary/15">
                <Diamond className="h-7 w-7" />
              </span>
              <h3 className="mb-3 font-display text-xl font-bold text-slate-900 dark:text-white">Valores</h3>
              <ul className="space-y-2.5 text-slate-500 dark:text-slate-400">
                {values.map((v) => (
                  <li key={v} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary" />
                    {v}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Featured Projects ===== */}
      <FeaturedProjectsSlider />

      {/* ===== Angola Market ===== */}
      <section className="section-pad bg-background-light dark:bg-background-dark">
        <div className="wrap">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <span className="eyebrow">
                <Globe className="h-4 w-4" />
                Compromisso Nacional
              </span>
              <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                Compromisso com o mercado angolano
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                O mercado angolano é vibrante e único. Não trazemos apenas soluções prontas;
                adaptamos tecnologia de ponta à nossa realidade local para resolver problemas
                reais.
              </p>

              <div className="mt-8 space-y-6">
                {[
                  { title: "Digitalização de PMEs", desc: "Ferramentas de gestão e presença online para pequenas e médias empresas.", icon: <Store className="h-5 w-5" /> },
                  { title: "Educação Tecnológica", desc: "Capacitar equipes locais com workshops e transferência de conhecimento.", icon: <GraduationCap className="h-5 w-5" /> },
                  { title: "Conectividade Global", desc: "Plataformas que permitam produtos angolanos alcançarem mercados internacionais.", icon: <Globe className="h-5 w-5" /> },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="icon-tile">
                      {item.icon}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white">{item.title}</h4>
                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <div className="card p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Crescimento Digital (Estimado)
                    </p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold text-slate-900 dark:text-white">
                      2024 — 2030
                    </h3>
                  </div>
                  <span className="icon-tile bg-secondary-faint text-secondary dark:bg-secondary/15">
                    <TrendingUp className="h-6 w-6" />
                  </span>
                </div>
                <div className="flex h-44 items-end gap-2">
                  {[30, 45, 40, 60, 75, 65, 90, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-lg bg-primary group relative transition-all duration-300 hover:bg-primary-dark"
                      style={{ height: `${h}%` }}
                    >
                      <span className="absolute -top-7 left-1/2 -translate-x-1/2 rounded bg-slate-900 px-2 py-0.5 text-xs font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                        {h}%
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-between border-t border-slate-100 pt-4 text-xs font-medium text-slate-400 dark:border-white/5">
                  <span>Adoção Tech</span>
                  <span>Impacto Económico</span>
                  <span>Inovação</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Featured Articles ===== */}
      <FeaturedArticlesSlider />

      {/* ===== Process ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="section-head mx-auto max-w-2xl text-center">
            <span className="eyebrow justify-center">Metodologia</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Nosso processo de trabalho
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-0 right-0 top-9 hidden h-0.5 bg-slate-100 md:block dark:bg-white/5" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {process.map((step, idx) => (
                <div key={idx} className="card-hover group relative p-7 pt-12 text-center">
                  <span className="absolute left-1/2 top-0 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                    <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-lg font-extrabold text-white shadow-lift ring-4 ring-white dark:ring-[#0b1120]">
                      {idx + 1}
                    </span>
                  </span>
                  <span className="icon-tile mx-auto mb-4 transition-all group-hover:scale-110">
                    {step.icon}
                  </span>
                  <h4 className="mb-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="section-pad bg-background-light dark:bg-background-dark">
        <div className="wrap">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
              Pronto para transformar a sua empresa?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              Junte-se à VitalEvo e faça parte da revolução digital em Angola. Vamos
              construir o futuro juntos.
            </p>
            <Link href="/contact" className="btn-primary mt-8">
              Falar com um Especialista
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;