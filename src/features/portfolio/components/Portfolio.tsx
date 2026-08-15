"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, SearchX, ArrowRight } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

const Portfolio: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('Todos');

  // Fetch projects based on category
  const projects = useQuery(api.projects.getVisibleProjects, {
    category: activeCategory === 'Todos' ? undefined : activeCategory
  });

  // Fetch featured projects for the slider
  const featuredProjects = useQuery(api.projects.getFeaturedProjects);

  const dbCategories = useQuery(api.categories.getByType, { type: "portfolio" });

  const categories = useMemo(() => {
    if (!dbCategories) return ['Todos'];
    const uniqueNames = Array.from(new Set(dbCategories.map(c => c.name)));
    const cats = ['Todos', ...uniqueNames];

    if (cats.length === 1) return ['Todos', 'Branding', 'Tech', 'Marketing', 'Design'];
    return cats;
  }, [dbCategories]);

  // Loading state
  if (!projects || !dbCategories || !featuredProjects) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-32 pb-20 dark:bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-background-light pt-28 pb-16 md:pt-40 md:pb-24 dark:bg-background-dark">
        <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-primary-glow/50 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-secondary-light/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.3]" />

        <div className="wrap relative z-10 text-center">
          <span className="eyebrow justify-center">
            <LayoutGrid className="h-4 w-4" />
            Nosso Portfólio
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
            Projetos que falam por{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              si mesmos
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Uma seleção dos trabalhos que transformaram ideias em resultados tangíveis para
            marcas em todo o mundo.
          </p>
        </div>
      </section>

      {/* ===== Featured Slider ===== */}
      {featuredProjects.length > 0 && (
        <section className="relative pb-10">
          <div className="wrap mb-8">
            <h2 className="flex items-center gap-3 text-2xl font-extrabold text-slate-900 dark:text-white">
              <span className="h-8 w-2 rounded-full bg-primary"></span>
              Destaques
            </h2>
          </div>
          <div className="mx-auto max-w-[1600px] px-4">
            <Swiper
              modules={[Autoplay, EffectFade, Pagination, Navigation]}
              effect="fade"
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="group relative h-[400px] w-full overflow-hidden rounded-[2rem] shadow-card md:h-[600px]"
            >
              {featuredProjects.map((project: any) => (
                <SwiperSlide key={project._id} className="relative bg-gray-900">
                  <div className="absolute inset-0">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover opacity-60"
                      priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
                  </div>

                  <div className="absolute inset-0 mx-auto flex max-w-5xl flex-col justify-end p-8 md:p-20">
                    <div className="slide-content-reveal translate-y-4 opacity-0 transition-all duration-700 delay-300">
                      <span className="mb-4 inline-block rounded-full border border-primary/30 bg-primary/20 px-4 py-2 text-sm font-bold uppercase tracking-wider text-primary backdrop-blur-md">
                        {project.category}
                      </span>
                      <h2 className="mb-4 font-display text-4xl font-black leading-tight text-white md:text-6xl">
                        {project.title}
                      </h2>
                      <p className="mb-8 line-clamp-2 max-w-2xl text-lg text-gray-300 md:text-xl">
                        {project.challenge || project.fullDescription}
                      </p>
                      <Link
                        href={`/portfolio/${project.slug}`}
                        className="inline-flex items-center gap-2 rounded-xl bg-white px-8 py-4 font-bold text-black shadow-xl transition-all hover:scale-105 hover:bg-primary hover:text-white"
                      >
                        Ver Projeto Completo <ArrowRight className="h-5 w-5" />
                      </Link>
                    </div>
                  </div>
                </SwiperSlide>
              ))}

              <style jsx global>{`
                .swiper-slide-active .slide-content-reveal {
                  transform: translateY(0);
                  opacity: 1;
                }
                .swiper-button-next, .swiper-button-prev {
                  color: white !important;
                  background: rgba(255,255,255,0.1);
                  width: 50px;
                  height: 50px;
                  border-radius: 50%;
                  backdrop-filter: blur(10px);
                  transition: all 0.3s;
                }
                .swiper-button-next:hover, .swiper-button-prev:hover {
                  background: rgba(255,255,255,0.2);
                  transform: scale(1.1);
                }
                .swiper-pagination-bullet {
                  background: white !important;
                  opacity: 0.5;
                  width: 10px;
                  height: 10px;
                }
                .swiper-pagination-bullet-active {
                  opacity: 1;
                  width: 24px;
                  border-radius: 10px;
                  transition: width 0.3s;
                }
              `}</style>
            </Swiper>
          </div>
        </section>
      )}

      {/* ===== Main Grid ===== */}
      <section className="relative min-h-screen py-20 bg-white dark:bg-[#0b1120]">
        <div className="wrap">
          <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-center">
            <div>
              <span className="eyebrow">Nosso Portfólio</span>
              <h2 className="mt-3 font-display text-3xl font-extrabold text-slate-900 md:text-4xl dark:text-white">
                Projetos Recentes
              </h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all duration-300 border ${activeCategory === cat
                    ? 'border-primary bg-primary text-white shadow-lg shadow-primary/25'
                    : 'border-transparent bg-gray-100 text-slate-600 hover:bg-gray-200 dark:bg-white/5 dark:text-slate-400 dark:hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-gray-50 py-20 text-center dark:border-white/5 dark:bg-white/5">
              <SearchX className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-xl font-medium text-slate-500">Nenhum projeto encontrado nesta categoria.</p>
              <button onClick={() => setActiveCategory('Todos')} className="mt-4 font-bold text-primary hover:underline">
                Ver todos os projetos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project: any) => (
                <Link
                  href={`/portfolio/${project.slug}`}
                  key={project._id}
                  className="group block"
                >
                  <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm transition-all duration-500 group-hover:-translate-y-2 group-hover:shadow-2xl group-hover:shadow-primary/10 dark:border-white/5 dark:bg-[#151e32]">
                    <div className="absolute inset-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                      />
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity group-hover:opacity-80"></div>

                    <div className="absolute left-4 top-4 rounded-lg border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-white backdrop-blur-md">
                      {project.category}
                    </div>

                    <div className="absolute inset-x-0 bottom-0 translate-y-4 p-6 transition-transform duration-500 group-hover:translate-y-0">
                      <h3 className="mb-2 font-bold text-xl leading-tight text-white">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 opacity-0 transition-opacity duration-500 delay-100 group-hover:opacity-100">
                        <span className="text-sm font-medium text-gray-300">Ver detalhes</span>
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          <div className="relative mt-24 overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary to-purple-700 p-12 text-center text-white shadow-2xl md:p-20">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
            <div className="absolute -left-1/2 -top-1/2 h-96 w-96 rounded-full bg-white/10 blur-3xl"></div>
            <div className="absolute -bottom-1/2 -right-1/2 h-96 w-96 rounded-full bg-black/20 blur-3xl"></div>

            <div className="relative z-10 mx-auto max-w-3xl">
              <h2 className="mb-6 font-display text-4xl font-black leading-tight md:text-5xl">
                Pronto para Elevar seu Negócio ao Próximo Nível?
              </h2>
              <p className="mb-10 text-lg font-light leading-relaxed text-white/90 md:text-xl">
                Cada grande jornada começa com um primeiro passo. A VitalEvo está pronta para
                transformar sua visão em uma realidade digital impactante.
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-10 py-4 text-lg font-bold text-primary shadow-xl transition-all hover:scale-105 hover:bg-gray-50"
                >
                  Iniciar Projeto
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center rounded-2xl border-2 border-white/30 px-10 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
                >
                  Nossos Serviços
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;