
import React from 'react';
import { Article } from '../types';

const Blog: React.FC = () => {
  const articles: Article[] = [
    {
      id: '1',
      title: 'Princípios de UX para SaaS B2B',
      category: 'Design',
      date: 'Out 24, 2023',
      readTime: '5 min',
      excerpt: 'O design para empresas requer uma mentalidade diferente. Aprenda a focar na eficiência.',
      image: 'https://picsum.photos/600/400?random=30'
    },
    {
      id: '2',
      title: 'Dominando CSS Grid em 2024',
      category: 'Tech',
      date: 'Out 18, 2023',
      readTime: '8 min',
      excerpt: 'Pare de brigar com floats e flexbox. Descubra o poder do grid moderno.',
      image: 'https://picsum.photos/600/400?random=31'
    },
    {
      id: '3',
      title: 'SEO para Startups de Tecnologia',
      category: 'Marketing',
      date: 'Out 12, 2023',
      readTime: '6 min',
      excerpt: 'Visibilidade é tudo. Aprenda táticas de SEO que não exigem orçamentos milionários.',
      image: 'https://picsum.photos/600/400?random=32'
    },
  ];

  return (
    <div className="pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Featured Article */}
        <section className="mb-20">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center bg-gray-50 dark:bg-surface-dark rounded-3xl overflow-hidden shadow-sm">
             <div className="h-full min-h-[400px]">
               <img src="https://picsum.photos/1200/800?random=40" className="w-full h-full object-cover" alt="Featured" />
             </div>
             <div className="p-8 md:p-12 space-y-6">
                <span className="text-primary font-bold uppercase tracking-widest text-sm">Artigo em Destaque</span>
                <h1 className="font-display font-black text-3xl md:text-5xl dark:text-white leading-tight">
                  O Futuro do Frontend: Por que performance importa em 2024
                </h1>
                <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                  Exploramos como otimizar a arquitetura impulsiona o engajamento e as taxas de conversão no cenário moderno.
                </p>
                <button className="bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">
                  Ler Artigo Completo
                </button>
             </div>
           </div>
        </section>

        {/* Latest Articles */}
        <div className="mb-12 flex justify-between items-center">
          <h2 className="font-display font-bold text-2xl md:text-3xl dark:text-white">Últimos Artigos</h2>
          <div className="flex gap-2">
             <button className="px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full font-bold text-sm">Filtros</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map(art => (
            <article key={art.id} className="group cursor-pointer">
              <div className="relative aspect-video rounded-2xl overflow-hidden mb-6">
                <img src={art.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={art.title} />
                <span className="absolute top-4 left-4 bg-secondary text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase">
                  {art.category}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-500 text-xs mb-3 font-medium">
                <span>{art.date}</span>
                <span className="size-1 rounded-full bg-gray-300"></span>
                <span>{art.readTime} de leitura</span>
              </div>
              <h3 className="text-xl font-bold mb-3 dark:text-white group-hover:text-primary transition-colors leading-tight">
                {art.title}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed line-clamp-2">
                {art.excerpt}
              </p>
              <button className="mt-4 text-primary font-bold text-sm flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                Ler Artigo <span className="material-icons-round text-sm">arrow_forward</span>
              </button>
            </article>
          ))}
        </div>
        
        {/* Newsletter */}
        <div className="mt-20 bg-primary rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="font-display font-bold text-3xl mb-4">Inscreva-se na nossa Newsletter</h2>
            <p className="mb-8 text-white/80">Receba insights semanais sobre design e tecnologia direto no seu e-mail.</p>
            <form className="flex flex-col sm:flex-row gap-4">
              <input className="flex-grow h-12 px-6 rounded-xl bg-white/20 border border-white/30 text-white placeholder:text-white/60 outline-none focus:bg-white/30 transition-all" placeholder="Seu melhor e-mail" />
              <button className="bg-white text-primary px-8 h-12 rounded-xl font-bold shadow-lg hover:scale-105 transition-all">Assinar Agora</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
