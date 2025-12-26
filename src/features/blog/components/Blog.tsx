"use client";

import React from 'react';
import { Article } from '@/shared/types';
import Link from 'next/link';
import { Rss, Clock, ArrowRight } from "lucide-react";

import { articles } from '../data';

const Blog: React.FC = () => {

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-1/2 translate-x-1/2 w-[800px] h-[400px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10 mb-8">
            <Rss className="w-4 h-4 text-secondary" />
            Blog & Insights
          </div>

          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-8">
            Conhecimento que <br className="hidden md:block" />
            <span className="text-primary">Gera Valor</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
            Artigos, tutoriais e análises de mercado para manter você à frente da curva. Mergulhe no universo da tecnologia e inovação.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0b1120] relative z-10 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Featured Article */}
          <section className="mb-24">
            <div className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 items-center bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
              <div className="h-full min-h-[400px] relative overflow-hidden">
                <img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" alt="Featured" />
                <div className="absolute inset-0 bg-black/60 lg:hidden"></div>
              </div>

              <div className="p-8 md:p-16 space-y-8 relative z-10">
                <div className="flex items-center gap-4">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Destaque da Semana</span>
                  <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> 12 min de leitura</span>
                </div>

                <h2 className="font-display font-black text-3xl md:text-5xl text-white leading-tight group-hover:text-primary transition-colors">
                  O Futuro do Frontend: Performance First
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed">
                  Exploramos como otimizar a arquitetura impulsiona o engajamento e as taxas de conversão no cenário moderno. Core Web Vitals, Hydration e muito mais.
                </p>

                <button className="flex items-center gap-2 text-white font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                  Ler Artigo Completo <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </section>

          {/* Latest Articles Grid */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Últimas Publicações</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['Todos', 'Design', 'Tech', 'Marketing', 'Business'].map(cat => (
                <button key={cat} className="px-4 py-2 border border-gray-200 dark:border-white/10 rounded-full text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors whitespace-nowrap">
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {articles.map(art => (
              <Link href={`/blog/${art.id}`} key={art.id} className="group cursor-pointer flex flex-col h-full block">
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-lg">
                  <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {art.category}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-gray-400 text-xs mb-3 font-medium uppercase tracking-wider">
                    <span>{art.date}</span>
                    <span className="size-1 rounded-full bg-gray-500"></span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white group-hover:text-primary transition-colors leading-tight">
                    {art.title}
                  </h3>

                  <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-1">
                    {art.excerpt}
                  </p>

                  <div className="pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <span className="text-sm font-bold text-primary group-hover:underline">Ler Mais</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Newsletter Section - Premium */}
          <div className="mt-32 relative rounded-[3rem] overflow-hidden bg-primary text-center">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30 mix-blend-overlay"></div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>

            <div className="relative z-10 px-8 py-20 md:py-32 max-w-2xl mx-auto">
              <span className="inline-block bg-white/20 backdrop-blur px-4 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider mb-6">Newsletter Semanal</span>
              <h2 className="font-display font-black text-3xl md:text-5xl text-white mb-6">Fique por dentro da Inovação</h2>
              <p className="mb-10 text-white/90 text-lg font-light">
                Junte-se a +5.000 profissionais que recebem nossos insights exclusivos sobre tecnologia e mercado diretamente no e-mail.
              </p>

              <form className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                <input
                  type="email"
                  className="flex-grow h-14 px-6 rounded-xl bg-transparent border-none text-white placeholder:text-white/60 outline-none focus:ring-0 text-lg transition-all"
                  placeholder="Seu melhor e-mail"
                />
                <button className="bg-white text-primary px-8 h-14 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap">
                  Inscrever-se
                </button>
              </form>
              <p className="mt-4 text-white/60 text-xs">Sem spam. Apenas conteúdo de valor.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Blog;
