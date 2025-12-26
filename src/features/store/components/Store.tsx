"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '../data';
import { useCart } from '@/shared/providers/CartProvider';

const Store: React.FC = () => {
    const [activeCategory, setActiveCategory] = useState('Todos');
    const { addItem, totalItems } = useCart();

    const handleAddToCart = (e: React.MouseEvent, product: typeof products[0]) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
        });
    };


    const categories = ['Todos', 'Câmeras de Segurança', 'Redes & Wi-Fi', 'Hardware', 'Cabos e Conectores'];

    return (
        <div className="pt-24 pb-20 bg-gray-50 dark:bg-background-dark min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb - Style adapted */}
                <div className="flex flex-wrap gap-2 py-4 mb-4 text-sm">
                    <a className="text-gray-500 hover:text-primary transition-colors font-medium leading-normal" href="/">Home</a>
                    <span className="text-gray-500 font-medium leading-normal">/</span>
                    <span className="text-gray-900 dark:text-white font-medium leading-normal">Loja</span>
                </div>

                {/* Store Toolbar (Search and Filter for Mobile) */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-white/5">
                    <div className="flex-1 max-w-2xl relative">
                        <span className="material-icons-round absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">search</span>
                        <input
                            type="text"
                            placeholder="Buscar produtos..."
                            className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-100 dark:bg-background-dark border-none focus:ring-1 focus:ring-primary text-gray-900 dark:text-white placeholder:text-gray-400"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Link href="/cart" className="relative flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 dark:bg-background-dark text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <span className="material-icons-round">shopping_cart</span>
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <Link href="/account" className="flex items-center justify-center h-10 w-10 rounded-lg bg-gray-100 dark:bg-background-dark text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
                            <span className="material-icons-round">person</span>
                        </Link>
                    </div>
                </div>

                {/* Hero Section */}
                <div className="w-full rounded-2xl overflow-hidden relative mb-10 group">
                    <div className="flex min-h-[320px] md:min-h-[400px] flex-col gap-6 bg-cover bg-center bg-no-repeat items-start justify-center px-8 md:px-16 relative" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDhivXhF6WT-HoRL7PKibZdZqY-9wrE_KqsyRn7eR2Yo5PQmBVhVdwl7uY7TB6DjTo3nN_lRaho85QasPLyTeGODxt70fwWrrIxCHsYlyprRuudnWjN1KsxtpDzmnlRE-iIDOAj120lrNEMyEzGfLTUHMZR1k1RFHW5WubixdSXQA2W7hRYHv-MC6kgPmDvu0mCbTWX-wh3PXERNBTnDsrbtbBuv0NvH8r5RU8cHroVIxjxHSLvdD4hPLcddpQgedjc5zQOxvy5SAH4")' }}>
                        <div className="absolute inset-0 bg-gray-900/70"></div>
                        <div className="flex flex-col gap-4 text-left max-w-2xl relative z-10">
                            <span className="inline-block px-3 py-1 bg-primary/20 border border-primary/30 text-blue-200 rounded-full text-xs font-bold tracking-wider uppercase backdrop-blur-sm w-fit">
                                Oferta Exclusiva
                            </span>
                            <h1 className="text-white text-4xl md:text-5xl font-bold leading-tight tracking-tight font-display">
                                Tecnologia de Ponta para sua Segurança
                            </h1>
                            <p className="text-gray-200 text-base md:text-lg font-normal leading-relaxed max-w-lg">
                                Encontre as melhores câmeras IP, sistemas de DVR e equipamentos de rede com até 20% de desconto para empresas.
                            </p>
                            <div className="pt-4 flex gap-4">
                                <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-primary hover:bg-primary-dark text-white text-base font-bold transition-all shadow-lg hover:shadow-primary/50">
                                    Ver Ofertas
                                </button>
                                <button className="flex items-center justify-center rounded-lg h-12 px-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm text-base font-bold transition-all">
                                    Saiba Mais
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-10">

                    {/* Sidebar */}
                    <aside className="w-full lg:w-64 shrink-0 space-y-8">
                        <div className="lg:hidden mb-4">
                            <button className="w-full flex items-center justify-between p-3 bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-white/5">
                                <span className="font-bold">Filtros</span>
                                <span className="material-icons-round">filter_list</span>
                            </button>
                        </div>

                        <div className="hidden lg:block space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Categorias</h3>
                            <div className="space-y-2">
                                {categories.map((cat, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5 bg-transparent"
                                            checked={activeCategory === cat}
                                            onChange={() => setActiveCategory(cat)}
                                        />
                                        <span className={`text-sm group-hover:text-primary transition-colors ${activeCategory === cat ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-300'}`}>
                                            {cat}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="hidden lg:block space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Preço</h3>
                            <div className="flex items-center gap-4">
                                <input className="w-full rounded-lg bg-gray-100 dark:bg-background-dark border-none text-sm p-2 text-gray-900 dark:text-white" placeholder="Min" type="number" />
                                <span className="text-gray-400">-</span>
                                <input className="w-full rounded-lg bg-gray-100 dark:bg-background-dark border-none text-sm p-2 text-gray-900 dark:text-white" placeholder="Max" type="number" />
                            </div>
                            <div className="relative pt-2">
                                <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full w-full">
                                    <div className="absolute h-1 bg-primary rounded-full left-0 w-1/2"></div>
                                </div>
                                <div className="absolute top-0 left-1/2 -ml-2 h-5 w-5 rounded-full border-2 border-primary bg-white cursor-pointer shadow"></div>
                            </div>
                        </div>

                        <div className="hidden lg:block space-y-4">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-white/10 pb-2">Marcas</h3>
                            <div className="space-y-2">
                                {['Intelbras', 'TP-Link', 'Ubiquiti', 'Hikvision'].map((brand, i) => (
                                    <label key={i} className="flex items-center gap-3 cursor-pointer group">
                                        <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary h-5 w-5 bg-transparent" />
                                        <span className="text-sm text-gray-600 dark:text-gray-300 group-hover:text-primary transition-colors">{brand}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                            <h2 className="text-gray-900 dark:text-white text-2xl font-bold leading-tight font-display">Catálogo de Produtos</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500 whitespace-nowrap">Ordenar por:</span>
                                <div className="relative">
                                    <select className="appearance-none bg-transparent border border-gray-300 dark:border-white/10 text-gray-900 dark:text-white text-sm rounded-lg pl-3 pr-8 py-2 focus:ring-primary focus:border-primary cursor-pointer">
                                        <option>Mais Relevantes</option>
                                        <option>Menor Preço</option>
                                        <option>Maior Preço</option>
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-900 dark:text-white">
                                        <span className="material-icons-round text-sm">expand_more</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Filters Horizontal */}
                        <div className="flex gap-2 flex-wrap mb-8">
                            <button className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-primary text-white pl-4 pr-3 transition-colors shadow-sm text-sm font-medium">
                                Todos <span className="material-icons-round text-sm">check</span>
                            </button>
                            {['Câmeras IP', 'Roteadores Mesh', 'Switches'].map(f => (
                                <button key={f} className="flex h-8 items-center justify-center gap-x-2 rounded-lg bg-gray-100 dark:bg-surface-dark hover:bg-gray-200 dark:hover:bg-white/10 pl-4 pr-3 transition-colors text-gray-900 dark:text-white text-sm font-medium">
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Products Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                            {products.map(product => (
                                <Link href={`/store/${product.id}`} key={product.id} className="group flex flex-col bg-white dark:bg-surface-dark rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 block">
                                    <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        {product.isNew && (
                                            <span className="absolute top-3 left-3 z-10 px-2 py-1 rounded bg-green-500 text-white text-xs font-bold uppercase shadow-sm">Novo</span>
                                        )}
                                        <span className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-white/80 dark:bg-black/50 text-gray-400 hover:text-red-500 cursor-pointer backdrop-blur-sm transition-colors">
                                            <span className="material-icons-round text-sm">favorite</span>
                                        </span>
                                        <img
                                            className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
                                            src={product.image}
                                            alt={product.name}
                                        />
                                    </div>

                                    <div className="flex flex-col flex-1 p-5">
                                        <div className="flex items-center gap-1 mb-2">
                                            {[...Array(5)].map((_, i) => (
                                                <span key={i} className={`material-icons-round text-sm ${i < Math.floor(product.stars) ? 'text-yellow-400' : 'text-gray-300'}`}>star</span>
                                            ))}
                                            <span className="text-xs text-gray-500 ml-1">({product.rating})</span>
                                        </div>

                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-primary transition-colors">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 font-light">
                                            {product.description}
                                        </p>

                                        <div className="mt-auto flex items-end justify-between">
                                            <div>
                                                {product.oldPrice && <p className="text-xs text-gray-400 line-through">Kz {product.oldPrice.toFixed(2)}</p>}
                                                <p className="text-xl font-bold text-gray-900 dark:text-white">Kz {product.price.toFixed(2)}</p>
                                            </div>
                                            <button
                                                onClick={(e) => handleAddToCart(e, product)}
                                                className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary text-white hover:bg-primary-dark transition-colors shadow-lg shadow-primary/30 hover:scale-110"
                                            >
                                                <span className="material-icons-round">add_shopping_cart</span>
                                            </button>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="flex justify-center mt-12">
                            <nav className="flex items-center gap-2">
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <span className="material-icons-round">chevron_left</span>
                                </button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white font-bold shadow-md">1</button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">2</button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors">3</button>
                                <button className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-surface-dark text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <span className="material-icons-round">chevron_right</span>
                                </button>
                            </nav>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Store;
