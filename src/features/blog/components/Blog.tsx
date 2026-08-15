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
      <div className="flex min-h-screen items-center justify-center bg-gray-50 pt-32 pb-20 dark:bg-background-dark">
        <div className="h-12 w-12 animate-spin rounded-full border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  const featuredArticle = articles.length > 0 ? articles[0] : null;
  const otherArticles = articles.length > 1 ? articles.slice(1) : [];

  return (
    <div className="overflow-x-hidden">
      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden bg-background-light pt-28 pb-16 md:pt-40 md:pb-24 dark:bg-background-dark">
        <div className="absolute -left-40 top-0 h-[460px] w-[460px] rounded-full bg-primary-glow/50 blur-[120px]" />
        <div className="absolute -bottom-32 -right-32 h-[420px] w-[420px] rounded-full bg-secondary-light/30 blur-[100px]" />
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.3]" />

        <div className="wrap relative z-10 text-center">
          <span className="eyebrow justify-center">
            <Rss className="h-4 w-4" />
            Blog & Insights
          </span>
          <h1 className="mx-auto mt-5 max-w-3xl font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
            Conhecimento que{" "}
            <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">
              gera valor
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-500 dark:text-slate-400">
            Artigos, tutoriais e análises de mercado para manter você à frente da curva.
            Mergulhe no universo da tecnologia e inovação.
          </p>
        </div>
      </section>

      <div className="relative z-10 bg-white py-24 dark:bg-[#0b1120]">
        <div className="wrap">
          {/* Featured Article */}
          {featuredArticle && (
            <section className="mb-24">
              <div className="group relative grid grid-cols-1 items-center overflow-hidden rounded-[2rem] border border-white/10 bg-gray-900 shadow-2xl lg:grid-cols-2">
                <div className="relative min-h-[400px] h-full overflow-hidden">
                  <img
                    src={featuredArticle.image}
                    className="absolute inset-0 h-full w-full object-cover opacity-80 transition-all duration-700 ease-out group-hover:scale-105 group-hover:opacity-100"
                    alt="Featured"
                  />
                  <div className="absolute inset-0 bg-black/60 lg:hidden"></div>
                </div>

                <div className="relative z-10 space-y-8 p-8 md:p-16">
                  <div className="flex items-center gap-4">
                    <span className="rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">Destaque da Semana</span>
                    <span className="flex items-center gap-1 text-sm text-gray-400"><Clock className="h-4 w-4" /> {featuredArticle.readTime} de leitura</span>
                  </div>

                  <h2 className="font-display text-3xl font-black leading-tight text-white transition-colors group-hover:text-primary md:text-5xl">
                    {featuredArticle.title}
                  </h2>
                  <p className="text-lg leading-relaxed text-gray-300">
                    {featuredArticle.excerpt}
                  </p>

                  <Link href={`/blog/${featuredArticle.slug}`} className="inline-flex items-center gap-2 border-b-2 border-primary pb-1 font-bold text-white transition-colors hover:text-primary">
                    Ler Artigo Completo <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </section>
          )}

          {/* Latest Articles */}
          <div className="mb-12 flex flex-col gap-6 border-b border-gray-200 pb-6 dark:border-white/10">
            <h2 className="font-display text-3xl font-bold text-slate-900 dark:text-white">Últimas Publicações</h2>
            <div className="no-scrollbar flex w-full gap-2 overflow-x-auto pb-2 md:flex-wrap md:overflow-visible md:pb-0">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => handleCategoryChange(cat)}
                  className={`whitespace-nowrap flex-shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${activeCategory === cat
                    ? 'border-primary bg-primary text-white'
                    : 'border-gray-200 text-slate-600 hover:bg-gray-100 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/10'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
            {otherArticles.length > 0 ? otherArticles.map(art => (
              <Link href={`/blog/${art.slug}`} key={art._id} className="group flex h-full cursor-pointer flex-col">
                <div className="relative mb-6 aspect-video overflow-hidden rounded-3xl shadow-lg">
                  <img src={art.image} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" alt={art.title} />
                  <div className="absolute inset-0 bg-black/20 transition-colors group-hover:bg-black/40"></div>
                  <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-black backdrop-blur">
                    {art.category}
                  </span>
                </div>

                <div className="flex flex-1 flex-col">
                  <div className="mb-3 flex items-center gap-3 text-xs font-medium uppercase tracking-wider text-gray-400">
                    <span>{formatDate(art.createdAt)}</span>
                    <span className="size-1 rounded-full bg-gray-500"></span>
                    <span>{art.readTime}</span>
                  </div>

                  <h3 className="mb-3 font-bold text-xl leading-tight text-slate-900 transition-colors group-hover:text-primary dark:text-white">
                    {art.title}
                  </h3>

                  <p className="mb-4 flex-1 text-sm leading-relaxed text-slate-500 line-clamp-3 dark:text-slate-400">
                    {art.excerpt}
                  </p>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4 dark:border-white/5">
                    <span className="text-sm font-bold text-primary group-hover:underline">Ler Mais</span>
                    <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            )) : (
              <div className="py-20 text-center text-slate-500 col-span-full">
                Nenhum outro artigo encontrado nesta categoria.
              </div>
            )}
          </div>

          {/* Newsletter */}
          <div className="relative mt-24 overflow-hidden rounded-[2rem] bg-primary text-center">
            <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-30 mix-blend-overlay"></div>
            <div className="absolute -right-1/2 -top-1/2 h-[500px] w-[500px] rounded-full bg-white/20 blur-[100px]"></div>

            <div className="relative z-10 mx-auto max-w-2xl px-8 py-20 md:py-24">
              <span className="mb-6 inline-block rounded-full bg-white/20 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white backdrop-blur">Newsletter Semanal</span>
              <h2 className="mb-6 font-display text-3xl font-black text-white md:text-5xl">Fique por dentro da Inovação</h2>
              <p className="mb-10 text-lg font-light text-white/90">
                Junte-se a +5.000 profissionais que recebem nossos insights exclusivos sobre
                tecnologia e mercado diretamente no e-mail.
              </p>

              <form onSubmit={handleSubscribe} className="flex flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-lg sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-14 flex-grow rounded-xl border-none bg-transparent px-6 text-lg text-white outline-none transition-all placeholder:text-white/60 focus:ring-0"
                  placeholder="Seu melhor e-mail"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="h-14 whitespace-nowrap rounded-xl bg-white px-8 text-lg font-bold text-primary shadow-lg transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? 'Inscrevendo...' : 'Inscrever-se'}
                </button>
              </form>
              <p className="mt-4 text-xs text-white/60">Sem spam. Apenas conteúdo de valor.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;