"use client";

import React from 'react';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { ShoppingBag, ArrowRight, ArrowLeft, Star, Plus } from 'lucide-react';
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
        <section className="py-24 bg-white dark:bg-[#0f172a] overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
                    <div className="max-w-xl">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-2 text-secondary font-bold tracking-widest uppercase text-sm mb-4"
                        >
                            <ShoppingBag className="w-4 h-4" />
                            Tecnologia de Ponta
                        </motion.div>
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="font-display font-black text-4xl md:text-5xl text-gray-900 dark:text-white leading-tight"
                        >
                            Equipamentos <br /> que <span className="text-secondary">Impulsionam</span> o Futuro
                        </motion.h2>
                    </div>
                    <Link href="/store" className="group flex items-center gap-2 text-gray-900 dark:text-white font-bold hover:text-secondary transition-colors underline underline-offset-8 decoration-secondary/30">
                        Visitar Nossa Loja <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                <div className="relative group/products">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={1}
                        breakpoints={{
                            640: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                            1280: { slidesPerView: 4 },
                        }}
                        navigation={{
                            nextEl: '.product-next',
                            prevEl: '.product-prev',
                        }}
                        pagination={{
                            clickable: true,
                            el: '.products-pagination',
                            bulletClass: 'w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-800 cursor-pointer transition-all mx-1 inline-block',
                            bulletActiveClass: '!bg-secondary !w-6',
                        }}
                        autoplay={{ delay: 5000, disableOnInteraction: false }}
                        className="!pb-16"
                    >
                        {featuredProducts.map((product) => (
                            <SwiperSlide key={product._id} className="h-auto">
                                <motion.div
                                    whileHover={{ y: -10 }}
                                    className="h-full flex flex-col bg-gray-50 dark:bg-white/5 rounded-3xl border border-gray-100 dark:border-white/5 overflow-hidden group/card transition-all"
                                >
                                    {/* Image Container */}
                                    <div className="relative aspect-square overflow-hidden bg-white dark:bg-gray-900">
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="w-full h-full object-contain p-8 group-hover/card:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-4 right-4 flex flex-col gap-2">
                                            {product.isNew && (
                                                <span className="bg-primary text-white text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg">Novo</span>
                                            )}
                                            <span className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm text-gray-900 dark:text-white text-[10px] font-bold uppercase tracking-tighter px-3 py-1 rounded-full shadow-lg border border-gray-100 dark:border-gray-700">
                                                {product.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="flex items-center gap-1 text-amber-500 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={`w-3.5 h-3.5 ${i < 4 ? 'fill-current' : ''}`} />
                                            ))}
                                            <span className="text-xs text-gray-400 font-bold ml-1">4.5</span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover/card:text-secondary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 font-light">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between">
                                            <div>
                                                <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                    {product.price.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                                                </span>
                                            </div>
                                            <Link
                                                href={`/product/${product.slug}`}
                                                className="w-12 h-12 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 flex items-center justify-center hover:bg-secondary dark:hover:bg-secondary transition-all group/btn"
                                            >
                                                <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" />
                                            </Link>
                                        </div>
                                    </div>
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>

                    {/* Navigation Buttons */}
                    <button className="product-prev absolute -left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white flex items-center justify-center hover:bg-secondary hover:text-white transition-all opacity-0 group-hover/products:opacity-100 hidden xl:flex">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <button className="product-next absolute -right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full bg-white dark:bg-gray-800 shadow-xl border border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white flex items-center justify-center hover:bg-secondary hover:text-white transition-all opacity-0 group-hover/products:opacity-100 hidden xl:flex">
                        <ArrowRight className="w-5 h-5" />
                    </button>

                    {/* Custom Pagination */}
                    <div className="products-pagination absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex justify-center !w-auto" />
                </div>
            </div>
        </section>
    );
}
