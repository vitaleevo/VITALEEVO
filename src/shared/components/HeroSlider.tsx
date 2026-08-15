"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, Navigation } from "swiper/modules";
import { ArrowRight, TrendingUp, Sparkles, Rocket } from "lucide-react";
import Link from "next/link";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";
import "swiper/css/navigation";

const slides = [
  {
    image: "/logos/novo logo-01.png",
    eyebrow: "Conectando Possibilidades",
    title: (
      <>
        Maior Agência de{" "}
        <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          Marketing Digital & Automação
        </span>{" "}
        em Angola
      </>
    ),
    text: "Combinamos design, tecnologia e estratégia baseada em dados para criar experiências digitais que impulsionam o mercado angolano.",
    cta: "/contact",
    ctaLabel: "Solicitar Proposta",
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    image: "/logos/novo logo-02.png",
    eyebrow: "Design Premium",
    title: (
      <>
        Identidades que{" "}
        <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          elevam o seu negócio
        </span>{" "}
        ao próximo nível
      </>
    ),
    text: "Do branding ao desenvolvimento completo, criamos ecossistemas digitais que transformam visitantes em clientes fiéis.",
    cta: "/portfolio",
    ctaLabel: "Ver Portfólio",
    icon: <Sparkles className="h-5 w-5" />,
  },
  {
    image: "/logos/novo logo-03.png",
    eyebrow: "Tecnologia de Ponta",
    title: (
      <>
        Soluções digitais{" "}
        <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
          para crescer sem limites
        </span>
      </>
    ),
    text: "Sites de alta performance, apps móveis, e-commerce e automação sob medida para o mercado angolano.",
    cta: "/services",
    ctaLabel: "Explorar Serviços",
    icon: <Rocket className="h-5 w-5" />,
  },
];

export default function HeroSlider() {
  return (
    <section className="relative w-full overflow-hidden bg-background-light pt-24 dark:bg-background-dark md:pt-28">
      <Swiper
        modules={[Autoplay, EffectFade, Pagination, Navigation]}
        effect="fade"
        loop={true}
        speed={900}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        pagination={{
          clickable: true,
          el: ".hero-pagination",
          bulletClass:
          "w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-all mx-1.5 inline-block",
          bulletActiveClass: "!bg-primary !w-9",
        }}
        className="hero-slider w-full"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative w-full">
              {/* Brand backdrop */}
              <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                <img
                  src={slide.image}
                  alt=""
                  aria-hidden
                  className="h-[380px] w-[380px] object-contain opacity-[0.07] blur-sm md:h-[560px] md:w-[560px]"
                />
              </div>
              {/* Ambient glows */}
              <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-primary-glow/50 blur-[120px]" />
              <div className="absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-secondary-light/30 blur-[100px]" />
              <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.35]" />

              <div className="wrap relative z-10 pb-20 pt-16 md:pb-28 md:pt-24 lg:min-h-[560px] lg:pt-28">
                <div className="mx-auto max-w-3xl text-center">
                  <span className="eyebrow justify-center">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
                    </span>
                    {slide.eyebrow}
                  </span>

                  <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-6xl dark:text-white">
                    {slide.title}
                  </h1>

                  <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
                    {slide.text}
                  </p>

                  <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                    <Link href={slide.cta} className="btn-primary group w-full !py-4 !text-base sm:w-auto">
                      <span>{slide.ctaLabel}</span>
                      {slide.icon}
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link href="/portfolio" className="btn-ghost w-full !py-4 !text-base sm:w-auto">
                      Ver Portfólio
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="hero-pagination pointer-events-auto absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 justify-center !w-auto pb-1" />
    </section>
  );
}