"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useCart } from '@/shared/providers/CartProvider';
import { normalizeText } from '@/shared/utils/format';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ShoppingCart,
    User,
    ChevronRight,
    CheckCircle,
    Star,
    ChevronDown,
    Heart,
    Plus,
    SearchX,
    Loader2,
    X
} from "lucide-react";
import WishlistButton from '@/shared/components/WishlistButton';

const Store: React.FC = () => {
    const convexProducts = useQuery(api.products.getAll, {});
    const settings = useQuery(api.settings.get);
    const dbCategories = useQuery(api.categories.getByType, { type: "store" });
    const dbBrands = useQuery(api.brands.getAll);
    const { addItem, totalItems } = useCart();

    // Filters State
    const [searchQuery, setSearchQuery] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todos');
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [priceRange, setPriceRange] = useState({ min: 0, max: 10000000 }); // Default max 10M Kz
    const [sortBy, setSortBy] = useState('Relevantes');

    const handleAddToCart = (e: React.MouseEvent, product: any) => {
        e.preventDefault();
        e.stopPropagation();
        addItem({
            id: product._id,
            name: product.name,
            price: product.price,
            image: product.image,
        });
    };

    const toggleBrand = (brand: string) => {
        setSelectedBrands(prev =>
            prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
        );
    };

    const clearFilters = () => {
        setActiveCategory('Todos');
        setSelectedBrands([]);
        setPriceRange({ min: 0, max: 10000000 });
        setSearchQuery('');
    };

    const categories = useMemo(() => {
        if (!dbCategories) return ['Todos'];
        return ['Todos', ...dbCategories.map(c => c.name)];
    }, [dbCategories]);
    const brands = useMemo(() => {
        if (!dbBrands) return [];
        return dbBrands.map(b => b.name);
    }, [dbBrands]);

    // Filtering Logic
    const filteredProducts = useMemo(() => {
        if (!convexProducts) return [];

        let result = convexProducts.filter(product => {
            const searchNormalized = normalizeText(searchQuery);
            const nameNormalized = normalizeText(product.name);
            const descNormalized = normalizeText(product.description || "");

            const matchesSearch = searchNormalized === "" ||
                nameNormalized.includes(searchNormalized) ||
                descNormalized.includes(searchNormalized);

            const matchesCategory = activeCategory === 'Todos' || product.category === activeCategory;
            const matchesBrand = selectedBrands.length === 0 || (product.brand && selectedBrands.includes(product.brand));
            const matchesPrice = product.price >= priceRange.min && product.price <= priceRange.max;

            return matchesSearch && matchesCategory && matchesBrand && matchesPrice;
        });

        // Sorting Logic
        const sorted = [...result];
        if (sortBy === 'Menor Preço') {
            sorted.sort((a, b) => a.price - b.price);
        } else if (sortBy === 'Maior Preço') {
            sorted.sort((a, b) => b.price - a.price);
        }

        return sorted;
    }, [convexProducts, searchQuery, activeCategory, selectedBrands, priceRange, sortBy]);

    if (!convexProducts || !dbCategories || !dbBrands) {
        return (
            <div className="pt-24 pb-20 bg-gray-50 dark:bg-background-dark min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-primary animate-spin" />
            </div>
        );
    }

    return (
        <div className="pt-24 pb-20 bg-gray-50 dark:bg-background-dark min-h-screen">
            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">

                {/* Breadcrumb */}
                <div className="flex items-center gap-2 py-4 mb-4 text-sm text-gray-500">
                    <Link href="/" className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-gray-900 dark:text-white font-semibold">Loja</span>
                </div>

                {/* Store Header & Search */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-white/5 sticky top-[80px] lg:top-[96px] z-30">
                    <div className="flex-1 max-w-2xl relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="O que você está procurando hoje?"
                            className="w-full pl-12 pr-12 py-3 rounded-xl bg-gray-100 dark:bg-background-dark/50 border-2 border-transparent focus:border-primary/50 focus:bg-white dark:focus:bg-surface-dark transition-all text-gray-900 dark:text-white outline-none"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    <div className="flex gap-3">
                        <Link href="/cart" className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-white dark:bg-background-dark text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm">
                            <ShoppingCart className="w-5 h-5" />
                            {totalItems > 0 && (
                                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white text-[11px] font-bold shadow-lg shadow-primary/40 animate-pulse">
                                    {totalItems}
                                </span>
                            )}
                        </Link>
                        <Link href="/account" className="flex items-center justify-center h-12 w-12 rounded-xl bg-white dark:bg-background-dark text-gray-700 dark:text-gray-200 border border-gray-100 dark:border-white/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm">
                            <User className="w-5 h-5" />
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">

                    {/* Sidebar / Filters */}
                    <aside className={`w-full lg:w-72 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
                        <div className="bg-white dark:bg-surface-dark rounded-3xl p-6 border border-gray-100 dark:border-white/5 shadow-xl shadow-gray-200/50 dark:shadow-none space-y-8 sticky top-48">

                            {/* Header Sidebar */}
                            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-white/5">
                                <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">Filtros</h3>
                                <button
                                    onClick={clearFilters}
                                    className="text-xs font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-widest"
                                >
                                    Limpar
                                </button>
                            </div>

                            {/* Categorias */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Categorias</h4>
                                <div className="space-y-2">
                                    {categories.map((cat) => (
                                        <button
                                            key={cat}
                                            onClick={() => setActiveCategory(cat)}
                                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${activeCategory === cat
                                                ? 'bg-primary/10 text-primary border border-primary/20'
                                                : 'hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-400'
                                                }`}
                                        >
                                            <span className="text-sm font-medium">{cat}</span>
                                            {activeCategory === cat && <CheckCircle className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Marcas */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Marcas</h4>
                                <div className="grid grid-cols-1 gap-2">
                                    {brands.map((brand) => (
                                        <label key={brand} className="flex items-center gap-3 p-2 rounded-xl border border-transparent hover:border-gray-100 dark:hover:border-white/5 transition-all cursor-pointer group">
                                            <div className="relative flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand)}
                                                    onChange={() => toggleBrand(brand)}
                                                    className="peer h-5 w-5 opacity-0 absolute cursor-pointer"
                                                />
                                                <div className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${selectedBrands.includes(brand)
                                                    ? 'bg-primary border-primary'
                                                    : 'border-gray-300 dark:border-gray-600'
                                                    }`}>
                                                    {selectedBrands.includes(brand) && <CheckCircle className="w-3 h-3 text-white" />}
                                                </div>
                                            </div>
                                            <span className={`text-sm transition-colors ${selectedBrands.includes(brand) ? 'text-primary font-bold' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {brand}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Preço */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Faixa de Preço</h4>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-gray-100 dark:bg-background-dark p-2 rounded-lg border border-transparent focus-within:border-primary/30 transition-all">
                                        <span className="text-[10px] text-gray-400 uppercase block">Min (Kz)</span>
                                        <input
                                            type="number"
                                            value={priceRange.min}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, min: Number(e.target.value) }))}
                                            className="bg-transparent border-none text-sm w-full outline-none font-bold"
                                        />
                                    </div>
                                    <span className="text-gray-300">/</span>
                                    <div className="flex-1 bg-gray-100 dark:bg-background-dark p-2 rounded-lg border border-transparent focus-within:border-primary/30 transition-all">
                                        <span className="text-[10px] text-gray-400 uppercase block">Max (Kz)</span>
                                        <input
                                            type="number"
                                            value={priceRange.max}
                                            onChange={(e) => setPriceRange(prev => ({ ...prev, max: Number(e.target.value) }))}
                                            className="bg-transparent border-none text-sm w-full outline-none font-bold"
                                        />
                                    </div>
                                </div>
                            </div>

                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="flex-1">

                        {/* Results Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-2">
                            <div>
                                <h2 className="text-2xl font-bold font-display text-gray-900 dark:text-white flex items-center gap-2">
                                    {filteredProducts.length} <span className="text-gray-400 font-normal text-base md:text-2xl">resultados</span>
                                </h2>
                                <button
                                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                                    className="lg:hidden mt-2 text-primary font-bold text-sm flex items-center gap-1 bg-primary/10 px-3 py-1.5 rounded-lg"
                                >
                                    <Plus className={`w-4 h-4 transition-transform ${showMobileFilters ? 'rotate-45' : ''}`} />
                                    {showMobileFilters ? 'Fechar Filtros' : 'Filtrar Busca'}
                                </button>
                            </div>

                            <div className="flex items-center gap-4">
                                <span className="text-sm text-gray-500">Ordenar por:</span>
                                <div className="relative">
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="appearance-none bg-white dark:bg-surface-dark border-none shadow-sm text-gray-900 dark:text-white text-sm rounded-xl pl-4 pr-10 py-2.5 focus:ring-2 focus:ring-primary/20 cursor-pointer min-w-[160px]"
                                    >
                                        <option>Relevantes</option>
                                        <option>Menor Preço</option>
                                        <option>Maior Preço</option>
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredProducts.map(product => (
                                    <motion.div
                                        key={product._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link href={`/store/${product._id}`} className="group flex flex-col h-full bg-white dark:bg-surface-dark rounded-3xl overflow-hidden border border-gray-100 dark:border-white/5 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500">
                                            {/* Image Container */}
                                            <div className="relative aspect-[4/3] overflow-hidden bg-gray-100 dark:bg-gray-800">
                                                {product.isNew && (
                                                    <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/40">Novo</div>
                                                )}
                                                <WishlistButton
                                                    productId={product._id}
                                                    className="absolute top-4 right-4 z-10"
                                                />
                                                <Image
                                                    src={product.image || '/hero-card.png'}
                                                    alt={product.name}
                                                    fill
                                                    className="object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            </div>

                                            {/* Details */}
                                            <div className="flex flex-col flex-1 p-6">
                                                <div className="flex items-center justify-between mb-3">
                                                    <span className="text-[10px] font-bold text-primary uppercase tracking-widest">{product.category}</span>
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                        <span className="text-xs font-bold text-gray-500">{product.rating}</span>
                                                    </div>
                                                </div>

                                                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                                                    {product.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-6 font-medium">
                                                    {product.description}
                                                </p>

                                                <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
                                                    <div>
                                                        <p className="text-2xl font-black text-gray-900 dark:text-white">
                                                            <span className="text-sm font-bold mr-1">{settings?.businessConfig?.currency || "Kz"}</span>
                                                            {product.price.toLocaleString('pt-AO', { minimumFractionDigits: 2 })}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleAddToCart(e, product)}
                                                        className="flex items-center justify-center h-12 w-12 rounded-2xl bg-primary hover:bg-primary-dark text-white transition-all shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 group/btn"
                                                    >
                                                        <ShoppingCart className="w-5 h-5 group-hover/btn:rotate-12 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* No Results Fallback */}
                        {filteredProducts.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex flex-col items-center justify-center py-20 text-center"
                            >
                                <div className="h-20 w-20 rounded-full bg-gray-100 dark:bg-surface-dark flex items-center justify-center mb-6">
                                    <SearchX className="w-10 h-10 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Nenhum produto encontrado</h3>
                                <p className="text-gray-500 max-w-xs mb-8">Tente ajustar seus filtros ou buscar por algo mais genérico.</p>
                                <button
                                    onClick={clearFilters}
                                    className="px-8 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/25 hover:bg-primary-dark transition-all"
                                >
                                    Limpar todos os filtros
                                </button>
                            </motion.div>
                        )}

                    </div>
                </div>

            </div>
        </div>
    );
};

export default Store;
