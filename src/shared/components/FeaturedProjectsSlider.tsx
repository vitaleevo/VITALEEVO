"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { ArrowRight, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

export default function FeaturedProjectsSlider() {
    const featuredProjects = useQuery(api.projects.getFeaturedProjects);

    if (!featuredProjects || featuredProjects.length === 0) return null;

    return (
        <section className="py-24 bg-gray-50 dark:bg-[#0b1120] relative overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div>
                        <motion.span
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-primary font-bold tracking-widest uppercase text-sm"
                        >
                            Impacto & Inovação
                        </motion.span>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-display font-black text-4xl md:text-6xl text-gray-900 dark:text-white mt-4 leading-tight"
                        >
                            Projetos que <br /> <span className="text-primary underline decoration-primary/30">Transformam</span>
                        </motion.h2>
                    </div>
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <Link href="/portfolio" className="group flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-primary transition-colors">
                            Ver Portfólio Completo <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </motion.div>
                </div>

                <div className="relative group/slider">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay, EffectFade]}
                        effect="fade"
                        spaceBetween={0}
                        slidesPerView={1}
                        navigation={{
                            nextEl: '.project-next',
                            prevEl: '.project-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.project-pagination',
                            bulletClass: 'w-3 h-3 rounded-full bg-gray-300 dark:bg-gray-700 cursor-pointer transition-all mx-1 inline-block',
                            bulletActiveClass: '!bg-primary !w-8',
                        }}
                        autoplay={{ delay: 6000, disableOnInteraction: false }}
                        loop={true}
                        className="rounded-3xl overflow-hidden shadow-2xl aspect-[16/9] md:aspect-[21/9]"
                    >
                        {featuredProjects.map((project) => (
                            <SwiperSlide key={project._id}>
                                <div className="relative w-full h-full">
                                    {/* Image with overlay */}
                                    <div className="absolute inset-0">
                                        <img
                                            src={project.image}
                                            alt={project.title}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/60 to-transparent" />
                                    </div>

                                    {/* Content */}
                                    <div className="relative h-full flex flex-col justify-center px-12 md:px-24">
                                        <motion.div
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.6 }}
                                            className="max-w-2xl"
                                        >
                                            <div className="flex items-center gap-2 mb-4">
                                                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                                                <span className="text-white/80 font-bold uppercase tracking-widest text-xs">
                                                    Destaque: {project.category}
                                                </span>
                                            </div>
                                            <h3 className="text-4xl md:text-7xl font-display font-black text-white mb-6 leading-none">
                                                {project.title}
                                            </h3>
                                            <p className="text-xl text-white/70 mb-10 font-light leading-relaxed max-w-lg line-clamp-3">
                                                Case de sucesso desenvolvido para {project.client}. Soluções inovadoras que geram resultados reais.
                                            </p>
                                            <Link
                                                href={`/portfolio/${project._id}`}
                                                className="inline-flex items-center gap-3 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary/30 transition-all hover:scale-105"
                                            >
                                                Explorar Detalhes <ArrowRight className="w-5 h-5" />
                                            </Link>
                                        </motion.div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button className="project-prev absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex">
                        <ArrowLeft className="w-6 h-6" />
                    </button>
                    <button className="project-next absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center hover:bg-primary hover:border-primary transition-all opacity-0 group-hover/slider:opacity-100 hidden md:flex">
                        <ArrowRight className="w-6 h-6" />
                    </button>

                    {/* Custom Pagination */}
                    <div className="project-pagination absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex justify-center !w-auto" />
                </div>
            </div>
        </section>
    );
}
