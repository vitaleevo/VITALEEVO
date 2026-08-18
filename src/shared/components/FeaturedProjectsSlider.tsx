"use client";

import React from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { ArrowRight, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function FeaturedProjectsSlider() {
  const { data: featuredProjects } = useApiQuery<any[]>(null, { fetcher: () => api.projects.getFeatured(6) });

  if (!featuredProjects || featuredProjects.length === 0) return null;

  return (
    <section className="section-pad bg-white dark:bg-[#0b1120]">
      <div className="wrap">
        <div className="section-head flex flex-col items-end justify-between gap-4 md:flex-row">
          <div>
            <span className="eyebrow">
              <Sparkles className="h-4 w-4" />
              Impacto & Inovação
            </span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Projetos que transformam
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

        <div className="relative group/slider !mx-0 w-full overflow-hidden">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            slidesPerView={1}
            navigation={{ nextEl: ".project-next", prevEl: ".project-prev" }}
            pagination={{
              clickable: true,
              el: ".project-pagination",
              bulletClass:
                "w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-all mx-1 inline-block",
              bulletActiveClass: "!bg-primary !w-8",
            }}
            autoplay={{ delay: 6000, disableOnInteraction: false }}
            loop={true}
            className="card !rounded-none"
          >
            {featuredProjects.map((project) => (
              <SwiperSlide key={project._id}>
                <div className="relative aspect-[16/9] w-full md:aspect-[21/9] lg:aspect-[24/9]">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Readable bottom overlay on any theme */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/60 to-transparent dark:from-[#0b1120] dark:via-[#0b1120]/70 dark:to-transparent" />

                  <div className="absolute inset-x-0 bottom-0 p-8 md:p-14">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-primary dark:text-primary-light">
                        Destaque — {project.category}
                      </span>
                    </div>
                    <h3 className="mt-3 max-w-2xl font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl dark:text-white">
                      {project.title}
                    </h3>
                    <p className="mt-3 line-clamp-2 max-w-xl text-base text-slate-600 dark:text-slate-300">
                      Case de sucesso desenvolvido para {project.client}. Soluções inovadoras
                      que geram resultados reais.
                    </p>
                    <Link
                      href={`/portfolio/${project.slug}`}
                      className="btn-primary mt-6"
                    >
                      Explorar Detalhes
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          <button className="project-prev absolute left-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/70 text-slate-700 shadow-card backdrop-blur transition-all hover:bg-primary hover:text-white md:flex">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button className="project-next absolute right-5 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/70 text-slate-700 shadow-card backdrop-blur transition-all hover:bg-primary hover:text-white md:flex">
            <ArrowRight className="h-5 w-5" />
          </button>

          <div className="project-pagination absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 justify-center !w-auto" />
        </div>
      </div>
    </section>
  );
}