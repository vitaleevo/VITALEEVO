"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { Calendar, ArrowRight, ArrowLeft, Clock, User } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function FeaturedArticlesSlider() {
    const featuredArticles = useQuery(api.articles.getFeatured, { limit: 6 });

    if (!featuredArticles || featuredArticles.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b1120] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-primary font-bold tracking-widest uppercase text-sm mb-4"
                        >
                            <Calendar className="w-4 h-4" />
                            Insights & Tendências
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white leading-tight"
                        >
                            Blog <br /> VitalEvo em <span className="text-primary italic">Foco</span>
                        </motion.h2>
                    </div>
                    <Link href="/blog" className="group flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-primary transition-colors underline underline-offset-8 decoration-primary/30">
                        Ver Mais Artigos <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="relative group/articles">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={40}
                        slidesPerView={1}
                        breakpoints={{
                            768: { slidesPerView: 2 },
                            1280: { slidesPerView: 3 },
                        }}
                        navigation={{
                            nextEl: '.article-next',
                            prevEl: '.article-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.articles-pagination',
                            bulletClass: 'w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer transition-all mx-1 inline-block',
                            bulletActiveClass: '!bg-primary !w-8',
                        }}
                        autoplay={{ delay: 7000, disableOnInteraction: false }}
                        className="!pb-16"
                    >
                        {featuredArticles.map((article) => (
                            <SwiperSlide key={article._id} className="h-auto">
                                <motion.div
                                    whileHover={{ y: -12 }}
                                    className="h-full flex flex-col bg-white dark:bg-white/5 rounded-[40px] border border-gray-100 dark:border-white/5 overflow-hidden group/card shadow-sm hover:shadow-2xl transition-all duration-500"
                                >
                                    {/* Image */}
                                    <div className="relative aspect-[16/10] overflow-hidden">
                                        <img
                                            src={article.image}
                                            alt={article.title}
                                            className="w-full h-full object-cover group-hover/card:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute top-6 left-6">
                                            <span className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-md text-primary px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                                                {article.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-10 flex flex-col flex-1">
                                        <div className="flex items-center gap-6 mb-6 text-xs font-bold text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                {article.readTime}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-primary" />
                                                {article.author}
                                            </div>
                                        </div>

                                        <h3 className="font-display font-black text-2xl text-gray-900 dark:text-white mb-4 line-clamp-2 leading-tight group-hover/card:text-primary transition-colors">
                                            {article.title}
                                        </h3>

                                        <p className="text-gray-500 dark:text-gray-400 line-clamp-3 mb-10 font-light leading-relaxed">
                                            {article.excerpt}
                                        </p>

                                        <Link
                                            href={`/blog/${article.slug}`}
                                            className="mt-auto group/link flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs"
                                        >
                                            Ler Artigo Completo
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/link:bg-primary group-hover/link:text-white transition-all">
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                        </Link>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <div className="absolute -top-16 right-0 flex gap-4">
                        <button className="article-prev w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <button className="article-next w-12 h-12 rounded-full border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 hover:bg-primary hover:text-white hover:border-primary transition-all">
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Custom Pagination */}
                    <div className="articles-pagination absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex justify-center !w-auto" />
                </div>
            </div>
        </section>
    );
}
