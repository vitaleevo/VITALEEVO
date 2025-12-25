"use client";

import React, { useState } from 'react';
import { Project } from '@/shared/types';
import Link from 'next/link';

import { projects } from '../data';

const Portfolio: React.FC = () => {
  const [filter, setFilter] = useState('Todos');

  const categories = ['Todos', 'Branding', 'Tech', 'Marketing', 'Design'];

  const filteredProjects = filter === 'Todos' ? projects : projects.filter(p => p.category === filter);

  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#0f172a]">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none">
          <div className="absolute top-20 right-20 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow"></div>
          <div className="absolute bottom-0 left-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-white font-medium text-sm tracking-wider uppercase shadow-lg shadow-purple-500/10 mb-8">
            <span className="material-icons-round text-sm text-secondary">view_quilt</span>
            Nossos Trabalhos
          </div>

          <h1 className="font-display font-black text-4xl md:text-6xl lg:text-7xl leading-tight text-white mb-8">
            Transformando Ideias em <br className="hidden md:block" />
            <span className="text-primary">Realidade Digital</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
            Explore nossa galeria de soluções inovadoras. Cada projeto é uma história de sucesso, combinando design estratégico e tecnologia de ponta.
          </p>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 md:gap-4 justify-center">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-6 py-3 rounded-full font-bold text-sm md:text-base transition-all duration-300 border ${filter === cat
                  ? 'bg-white text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105'
                  : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects Grid Section */}
      <section className="py-24 bg-white dark:bg-[#0b1120] relative min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

          {filteredProjects.length === 0 ? (
            <div className="text-center py-20">
              <span className="material-icons-round text-6xl text-gray-300 mb-4">search_off</span>
              <p className="text-xl text-gray-500">Nenhum projeto encontrado nesta categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProjects.map((project, index) => (
                <Link href={`/portfolio/${project.id}`} key={project.id} className="group cursor-pointer perspective-1000 animate-fade-in-up block" style={{ animationDelay: `${index * 100}ms` }}>
                  <div className="relative overflow-hidden rounded-[2rem] bg-gray-100 dark:bg-[#151e32] aspect-[4/3] mb-6 shadow-md transition-all duration-500 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-2 border border-gray-200 dark:border-white/5">
                    {/* Image */}
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                    />

                    {/* Overlay on Hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                      <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                          Ver Detalhes <span className="material-icons-round text-sm">arrow_forward</span>
                        </span>
                      </div>
                    </div>

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 bg-black/50 backdrop-blur-md border border-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {project.category}
                    </div>
                  </div>

                  <div className="space-y-2 px-2">
                    <h3 className="text-2xl font-display font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {project.tags.map((tag, i) => (
                        <span key={i} className="text-sm font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* CTA Banner */}
          <div className="mt-20 p-12 rounded-[2.5rem] bg-primary relative overflow-hidden text-center text-white shadow-2xl">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full blur-[80px]"></div>

            <div className="relative z-10">
              <h2 className="font-display font-black text-3xl md:text-4xl mb-6">Gostou do que viu?</h2>
              <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                Seu projeto pode ser o próximo case de sucesso da VitalEvo. Vamos conversar sobre como podemos ajudar.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-white text-primary px-10 py-4 rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-transform"
              >
                Solicitar Orçamento
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Portfolio;
