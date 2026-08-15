"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Diamond,
  Rocket,
  Brain,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import HeroSlider from "@/shared/components/HeroSlider";
import FeaturedProjectsSlider from "@/shared/components/FeaturedProjectsSlider";
import FeaturedProductsSlider from "@/shared/components/FeaturedProductsSlider";
import FeaturedArticlesSlider from "@/shared/components/FeaturedArticlesSlider";

const Home: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const differentials = [
    { icon: <Diamond className="h-6 w-6" />, title: "Design Premium", desc: "Interfaces que encantam e fidelizam usuários desde o primeiro clique." },
    { icon: <Rocket className="h-6 w-6" />, title: "Alta Performance", desc: "Códigos otimizados para velocidade máxima e SEO de ponta." },
    { icon: <Brain className="h-6 w-6" />, title: "Estratégia IA", desc: "Inteligência artificial para otimizar campanhas e processos." },
    { icon: <ShieldCheck className="h-6 w-6" />, title: "Segurança Total", desc: "Proteção de dados e infraestrutura robusta para sua tranquilidade." },
  ];

  const faqs = [
    { q: "Quais serviços a VitalEvo oferece?", a: "Oferecemos soluções 360º: Design Gráfico, Desenvolvimento Web & Mobile, Marketing Digital, Gestão de Redes Sociais, e Infraestrutura de TI Corporativa." },
    { q: "Como posso solicitar uma proposta?", a: "Basta clicar em 'Solicitar Proposta' ou preencher o formulário na página de contacto. A nossa equipa comercial responderá pelo canal indicado no pedido." },
    { q: "A VitalEvo atende todas as províncias?", a: "Com sede em Luanda, avaliamos pedidos de todo o país e serviços remotos conforme a necessidade do projeto." },
  ];

  return (
    <div className="overflow-x-hidden">
      {/* ===== Hero (full-width slideshow) ===== */}
      <HeroSlider />

      {/* ===== Differentials ===== */}
      <section className="section-pad bg-background-light dark:bg-background-dark">
        <div className="wrap">
          <div className="section-head mx-auto max-w-3xl text-center">
            <span className="eyebrow justify-center">Serviços de Tecnologia em Angola</span>
            <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Porque escolher a VitalEvo
            </h2>
            <p className="mt-4 text-lg text-slate-500 dark:text-slate-400">
              Entregamos soluções de tecnologia de ponta para empresas em Luanda que
              buscam crescimento real através de dados e design.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {differentials.map((item, idx) => (
              <div key={idx} className="card-hover group p-7">
                <span className="icon-tile mb-5 transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-white">
                  {item.icon}
                </span>
                <h3 className="mb-2 font-display text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Featured Projects ===== */}
      <FeaturedProjectsSlider />

      {/* ===== Featured Products ===== */}
      <FeaturedProductsSlider />

      {/* ===== Featured Articles ===== */}
      <FeaturedArticlesSlider />

      {/* ===== FAQ ===== */}
      <section className="section-pad bg-white dark:bg-[#0b1120]">
        <div className="wrap max-w-3xl">
          <h2 className="mb-10 text-center font-display text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Dúvidas Frequentes
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="card overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                  id={`faq-question-${i}`}
                  aria-expanded={activeFaq === i}
                  aria-controls={`faq-answer-${i}`}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-slate-900 transition-colors hover:bg-slate-50 dark:text-white dark:hover:bg-white/5"
                >
                  {faq.q}
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${
                      activeFaq === i ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  aria-labelledby={`faq-question-${i}`}
                  className={`overflow-hidden transition-all duration-300 ${
                    activeFaq === i ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="border-t border-slate-100 p-5 pt-4 text-sm leading-relaxed text-slate-600 dark:border-white/5 dark:text-slate-400">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== Final CTA (light gradient) ===== */}
      <section className="section-pad relative overflow-hidden">
        <div className="wrap">
          <div className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-primary via-primary-dark to-primary-darker px-6 py-16 text-center shadow-lift md:px-16 md:py-20">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute -bottom-24 -left-16 h-72 w-72 rounded-full bg-secondary/30 blur-3xl" />

            <div className="relative z-10 mx-auto max-w-2xl">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-white md:text-5xl">
                Pronto para revolucionar seu negócio?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-lg font-light text-white/80">
                Conte com a VitalEvo na construção do
                seu futuro digital.
              </p>
              <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-10 py-4 font-display text-lg font-extrabold text-primary shadow-lg transition-all hover:-translate-y-1"
                >
                  Começar Agora
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/portfolio"
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-10 py-4 font-display text-lg font-extrabold text-white backdrop-blur transition-all hover:-translate-y-1 hover:bg-white/20"
                >
                  Ver Portfólio
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