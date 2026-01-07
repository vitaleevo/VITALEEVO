"use client";

import React from 'react';
import { Article } from '@/shared/types';
import Link from 'next/link';
import { Rss, Clock, ArrowRight } from "lucide-react";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { formatDate } from "@/shared/utils/format";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from 'sonner';
import { subscribeToNewsletter } from '@/app/actions/contact';

const Blog: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categoryParam = searchParams.get('category') || 'Todos';

  const [activeCategory, setActiveCategory] = React.useState(categoryParam);
  const [email, setEmail] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    setActiveCategory(categoryParam);
  }, [categoryParam]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    const params = new URLSearchParams(searchParams.toString());
    if (cat === 'Todos') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    router.push(`/blog?${params.toString()}`, { scroll: false });
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      const result = await subscribeToNewsletter(email);
      if (result.success) {
        toast.success("Inscrição confirmada! Você receberá nossas novidades em breve.");
        setEmail('');
      } else {
        toast.error("Erro ao inscrever. Tente novamente.");
      }
    } catch (error) {
      toast.error("Erro ao inscrever na newsletter.");
    } finally {
      setLoading(false);
    }
  };

  const articles = useQuery(api.articles.getPublished, {
    category: activeCategory === 'Todos' ? undefined : activeCategory
  });
  const dbCategories = useQuery(api.categories.getByType, { type: "blog" });

  const categories = React.useMemo(() => {
    if (!dbCategories) return ['Todos'];
    return ['Todos', ...dbCategories.map(c => c.name)];
  }, [dbCategories]);

  if (!articles || !dbCategories) {
    return (
      <div className="pt-32 pb-20 bg-gray-50 dark:bg-[#0f172a] min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

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
          {featuredArticle && (
            <section className="mb-24">
              <div className="group relative grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-10 items-center bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10">
                <div className="h-full min-h-[400px] relative overflow-hidden">
                  <img src={featuredArticle.image} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out opacity-80 group-hover:opacity-100" alt="Featured" />
                  <div className="absolute inset-0 bg-black/60 lg:hidden"></div>
                </div>

                <div className="p-8 md:p-16 space-y-8 relative z-10">
                  <div className="flex items-center gap-4">
                    <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Destaque da Semana</span>
                    <span className="text-gray-400 text-sm flex items-center gap-1"><Clock className="w-4 h-4" /> {featuredArticle.readTime} de leitura</span>
                  </div>

                  <h2 className="font-display font-black text-3xl md:text-5xl text-white leading-tight group-hover:text-primary transition-colors">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed">
                    {featuredArticle.excerpt}
                  </p>

                  <Link href={`/blog/${featuredArticle.slug}`} className="inline-flex items-center gap-2 text-white font-bold border-b-2 border-primary pb-1 hover:text-primary transition-colors">
                    Ler Artigo Completo <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Latest Articles Grid */}
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4 border-b border-gray-200 dark:border-white/10 pb-6">
            <h2 className="font-display font-bold text-3xl text-gray-900 dark:text-white">Últimas Publicações</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-4 py-2 border rounded-full text-sm font-medium transition-colors whitespace-nowrap ${activeCategory === cat
                    ? 'bg-primary border-primary text-white'
                    : 'border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {otherArticles.length > 0 ? otherArticles.map(art => (
              <Link href={`/blog/${art.slug}`} key={art._id} className="group cursor-pointer flex flex-col h-full">
                <div className="relative aspect-video rounded-3xl overflow-hidden mb-6 shadow-lg">
                  <img src={art.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={art.title} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors"></div>
                  <span className="absolute top-4 left-4 bg-white/90 backdrop-blur text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                    {art.category}
                  </span>
                </div>

                <div className="flex-1 flex flex-col">
                  <div className="flex items-center gap-3 text-gray-400 text-xs mb-3 font-medium uppercase tracking-wider">
                    <span>{formatDate(art.createdAt)}</span>
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
            )) : (
              <div className="col-span-full py-20 text-center text-gray-500">
                Nenhum outro artigo encontrado nesta categoria.
              </div>
            )}
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

              <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-4 p-2 bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-grow h-14 px-6 rounded-xl bg-transparent border-none text-white placeholder:text-white/60 outline-none focus:ring-0 text-lg transition-all"
                  placeholder="Seu melhor e-mail"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-white text-primary px-8 h-14 rounded-xl font-bold text-lg shadow-lg hover:bg-gray-100 transition-colors whitespace-nowrap disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {loading ? 'Inscrevendo...' : 'Inscrever-se'}
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
