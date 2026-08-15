"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import  { ShoppingBag, ArrowRight, ArrowLeft, Plus }  from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export default function FeaturedProductsSlider() {
    const featuredProducts = useQuery(api.products.getFeatured, { limit: 10 });

    if (!featuredProducts || featuredProducts.length === 0) return null;

    return (
        <section className="section-pad overflow-hidden bg-white dark:bg-[#0b1120]">
            <div className="wrap">
                <div className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="eyebrow mb-4"
                        >
                            <ShoppingBag className="h-4 w-4" />
                            Tecnologia de Ponta
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-display text-4xl font-extrabold leading-tight tracking-tight text-slate-900 md:text-5xl dark:text-white"
                        >
                            Equipamentos <br /> que <span className="bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent">Impulsionam</span> o Futuro
                        </motion.h2>
                    </div>
                    <Link href="/store" className="group inline-flex items-center gap-2 font-bold text-slate-900 underline decoration-secondary/30 underline-offset-8 transition-colors hover:text-secondary dark:text-white">
                        Visitar Nossa Loja <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                </div>

<div className="group/products relative w-full !max-w-none overflow-hidden !px-6 md:!px-10">
            <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={24}
                slidesPerView={1}
                breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 },
                    1920: { slidesPerView: 5 },
                }}
                        navigation={{
                            nextEl: '.product-next',
                            prevEl: '.product-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.products-pagination',
                            bulletClass: 'w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700 cursor-pointer transition-all mx-1 inline-block',
                            bulletActiveClass: '!bg-secondary !w-6',
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        className="!pb-16"
                    >
                        {featuredProducts.map((product) => (
                            <SwiperSlide key={product._id} className="h-auto">
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="card-hover group/card flex h-full flex-col overflow-hidden"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden bg-white dark:bg-slate-800">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="h-full w-full object-contain p-8 transition-transform duration-500 group-hover/card:scale-110"
                                        />
                                        <div className="absolute right-4 top-4 flex flex-col gap-2">
                                            {product.isNew && (
                                                <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase tracking-tighter text-white shadow-lg">Novo</span>
                                            )}
                                            <span className="rounded-full border border-slate-100 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-tighter text-slate-900 shadow-lg backdrop-blur-sm dark:border-slate-700 dark:bg-slate-800/90 dark:text-white">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="flex flex-1 flex-col p-7">
                                        <h3 className="mb-2 line-clamp-2 font-bold text-lg text-slate-900 transition-colors group-hover/card:text-secondary dark:text-white">
                                            {product.name}
                                        </h3>
                                        <p className="mb-6 line-clamp-2 text-sm font-light text-slate-500 dark:text-slate-400">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div>
                                                <span className="font-display text-xl font-extrabold text-slate-900 dark:text-white">
                                                    {product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                                </span>
                                            </div>
                                            <Link
                                                href={`/store/${product.slug}`}
                                                aria-label={`Ver detalhes de ${product.name}`}
                                                className="group/btn flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-white shadow-lg transition-all hover:bg-secondary dark:hover:bg-secondary"
                                            >
                                                <Plus className="h-5 w-5 transition-transform group-hover/btn:rotate-90" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button type="button" aria-label="Produtos anteriores" className="product-prev absolute -left-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-900 opacity-0 shadow-xl transition-all hover:bg-secondary hover:text-white group-hover/products:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white xl:flex">
                        <ArrowLeft className="h-5 w-5" />
                    </button>
                    <button type="button" aria-label="Próximos produtos" className="product-next absolute -right-4 top-1/2 z-10 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-slate-100 bg-white text-slate-900 opacity-0 shadow-xl transition-all hover:bg-secondary hover:text-white group-hover/products:opacity-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white xl:flex">
                        <ArrowRight className="h-5 w-5" />
                    </button>

                    {/* Custom Pagination */}
                    <div className="products-pagination absolute bottom-0 left-1/2 z-10 flex !w-auto -translate-x-1/2 justify-center" />
                </div>
            </div>
        </section>
    );
}