"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { LayoutGrid, SearchX, ArrowRight, ExternalLink } from "lucide-react";
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
    const cats = ['Todos', ...dbCategories.map(c => c.name)];
    if (cats.length === 1) return ['Todos', 'Branding', 'Tech', 'Marketing', 'Design'];
    return cats;
  }, [dbCategories]);

  // Loading state
  if (!projects || !dbCategories || !featuredProjects) {
    return (
      <div className="pt-32 pb-20 bg-gray-50 dark:bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">

      {/* Featured Slider Section */}
      {featuredProjects.length > 0 && (
        <section className="relative pt-32 pb-10 bg-[#0f172a]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-primary rounded-full"></span>
              Destaques
            </h2>
          </div>
          <div className="max-w-[1600px] mx-auto px-4">
            <Swiper
              modules={[Autoplay, EffectFade, Pagination, Navigation]}
              effect="fade"
              spaceBetween={30}
              slidesPerView={1}
              navigation
              pagination={{ clickable: true }}
              autoplay={{ delay: 5000, disableOnInteraction: false }}
              className="rounded-[2.5rem] overflow-hidden shadow-2xl h-[400px] md:h-[600px] w-full relative group"
            >
              {featuredProjects.map((project: any) => (
                <SwiperSlide key={project._id} className="relative bg-gray-900">
                  {/* Background Image with Overlay */}
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

                  {/* Content */}
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-20 max-w-5xl mx-auto">
                    <div className="transform translate-y-4 opacity-0 transition-all duration-700 delay-300 slide-content-reveal">
                      <span className="inline-block px-4 py-2 bg-primary/20 backdrop-blur-md border border-primary/30 text-primary font-bold rounded-full mb-4 text-sm uppercase tracking-wider">
                        {project.category}
                      </span>
                      <h2 className="text-4xl md:text-6xl font-black text-white mb-4 leading-tight">
                        {project.title}
                      </h2>
                      <p className="text-lg md:text-xl text-gray-300 max-w-2xl mb-8 line-clamp-2">
                        {project.challenge || project.fullDescription}
                      </p>
                      <Link
                        href={`/portfolio/${project._id}`}
                        className="inline-flex items-center gap-2 bg-white text-black px-8 py-4 rounded-xl font-bold hover:bg-primary hover:text-white transition-all shadow-xl hover:scale-105"
                      >
                        Ver Projeto Completo <ArrowRight className="w-5 h-5" />
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

      {/* Main Grid Section */}
      <section className="py-20 bg-white dark:bg-[#0b1120] relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <LayoutGrid className="w-5 h-5 text-primary" />
                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">Nosso Portfólio</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                Projetos Recentes
              </h2>
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 border ${activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-lg shadow-primary/25'
                    : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent hover:bg-gray-200 dark:hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5">
              <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl text-gray-500 font-medium">Nenhum projeto encontrado nesta categoria.</p>
              <button onClick={() => setActiveCategory('Todos')} className="mt-4 text-primary font-bold hover:underline">
                Ver todos os projetos
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project: any, index: number) => (
                <Link
                  href={`/portfolio/${project._id}`}
                  key={project._id}
                  className="group block"
                >
                  <div className="relative overflow-hidden rounded-3xl bg-gray-100 dark:bg-[#151e32] aspect-[4/3] mb-6 border border-gray-200 dark:border-white/5 shadow-sm group-hover:shadow-2xl group-hover:shadow-primary/10 transition-all duration-500 group-hover:-translate-y-2">
                    {/* Image */}
                    <div className="absolute inset-0">
                      <Image
                        src={project.image}
                        alt={project.title}
                        fill
                        className="object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                      />
                    </div>

                    {/* Overlay Gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"></div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider">
                      {project.category}
                    </div>

                    {/* Content Overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        <span className="text-sm font-medium text-gray-300">Ver detalhes</span>
                        <ArrowRight className="w-4 h-4 text-primary" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-32 relative rounded-[3rem] overflow-hidden bg-gradient-to-br from-primary to-purple-700 text-white p-12 md:p-20 text-center shadow-2xl">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
            {/* Abstract Shapes */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-black/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="font-display font-black text-4xl md:text-5xl mb-6 leading-tight">
                Pronto para Elevar seu Negócio ao Próximo Nível?
              </h2>
              <p className="text-lg md:text-xl text-white/90 mb-10 font-light leading-relaxed">
                Cada grande jornada começa com um primeiro passo. A VitalEvo está pronta para transformar sua visão em uma realidade digital impactante.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center bg-white text-primary px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-gray-50 hover:scale-105 transition-all"
                >
                  Iniciar Projeto
                </Link>
                <Link
                  href="/services"
                  className="inline-flex items-center justify-center bg-transparent border-2 border-white/30 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all"
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
