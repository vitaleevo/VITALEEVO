"use client";

import React from "react";
import { useApiQuery } from "@/shared/hooks/useApiQuery";
import { api } from "@/shared/utils/apiClient";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { ArrowRight, ArrowLeft, Clock, User } from "lucide-react";
import Link from "next/link";
import SafeImage from "@/shared/components/SafeImage";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

export default function FeaturedArticlesSlider() {
  const { data: featuredArticles } = useApiQuery<any[]>(null, { fetcher: () => api.articles.getFeatured(6) });

  if (!featuredArticles || featuredArticles.length === 0) return null;

  return (
    <section className="section-pad bg-white dark:bg-[#0b1120]">
      <div className="wrap">
        <div className="section-head flex flex-col items-end justify-between gap-4 md:flex-row">
          <div className="max-w-xl">
            <span className="eyebrow">Insights & Tendências</span>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Blog VitalEvo
            </h2>
          </div>
          <Link
            href="/blog"
            className="group inline-flex items-center gap-2 text-sm font-bold text-slate-700 hover:text-primary dark:text-slate-200"
          >
            Ver Mais Artigos
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="relative group/articles w-full !max-w-none !px-6 md:!px-10">
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1280: { slidesPerView: 3 },
              1920: { slidesPerView: 4 },
            }}
            navigation={{ nextEl: ".article-next", prevEl: ".article-prev" }}
            pagination={{
              clickable: true,
              el: ".articles-pagination",
              bulletClass:
                "w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700 cursor-pointer transition-all mx-1 inline-block",
              bulletActiveClass: "!bg-primary !w-6",
            }}
            autoplay={{ delay: 7000, disableOnInteraction: false }}
            className="!pb-12"
          >
            {featuredArticles.map((article) => (
              <SwiperSlide key={article._id} className="h-auto">
                <Link
                  href={`/blog/${article.slug}`}
                  className="card-hover group flex h-full flex-col overflow-hidden !rounded-3xl"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <SafeImage
                      src={article.image}
                      alt={article.title}
                      sizes="(min-width:1920px) 25vw, (min-width:1280px) 33vw, (min-width:768px) 50vw, 100vw"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
                    <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm backdrop-blur">
                      {article.category}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <div className="mb-4 flex items-center gap-5 text-xs font-bold text-slate-500 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4 text-primary" />
                        {article.readTime}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4 text-primary" />
                        {article.author}
                      </span>
                    </div>
                    <h3 className="mb-3 font-display text-xl font-bold leading-tight text-slate-900 line-clamp-2 transition-colors group-hover:text-primary dark:text-white">
                      {article.title}
                    </h3>
                    <p className="mb-6 line-clamp-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                      {article.excerpt}
                    </p>
                    <span className="mt-auto inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-primary">
                      Ler Artigo Completo
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-faint transition-colors group-hover:bg-primary group-hover:text-white">
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </span>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          <div className="absolute -top-16 right-0 hidden gap-3 md:flex">
            <button className="article-prev flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-primary hover:bg-primary hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button className="article-next flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-all hover:border-primary hover:bg-primary hover:text-white dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>

          <div className="articles-pagination absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 justify-center !w-auto" />
        </div>
      </div>
    </section>
  );
}