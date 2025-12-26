"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import { products } from "@/features/store/data";
import { useCart } from "@/shared/providers/CartProvider";
import FeatureLayout from "@/shared/components/FeatureLayout";
import Link from "next/link";

interface Props {
    params: Promise<{ id: string }>;
}

export default function ProductPage({ params }: Props) {
    const { id } = use(params);
    const productId = parseInt(id);
    const product = products.find((p) => p.id === productId);
    const { addItem } = useCart();
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    if (!product) {
        notFound();
    }

    const handleAddToCart = () => {
        addItem(
            {
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
            },
            quantity
        );
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <FeatureLayout>
            <div className="pt-32 pb-20 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
                        <Link href="/store" className="hover:text-primary transition-colors">
                            Loja
                        </Link>
                        <span className="material-icons-round text-xs">chevron_right</span>
                        <span className="text-gray-900 dark:text-white font-medium truncate">
                            {product.name}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
                        {/* Image Gallery Section */}
                        <div className="space-y-4">
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-lg relative overflow-hidden group">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                                />
                                {product.isNew && (
                                    <span className="absolute top-6 left-6 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                        Novo Lançamento
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Product Info Section */}
                        <div className="flex flex-col">
                            <h1 className="text-3xl md:text-4xl font-display font-black text-gray-900 dark:text-white mb-4 leading-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex items-center text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`material-icons-round ${i < Math.floor(product.stars) ? "" : "text-gray-300 dark:text-gray-600"}`}
                                        >
                                            star
                                        </span>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">({product.rating} avaliações)</span>
                            </div>

                            <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8">
                                {product.fullDescription || product.description}
                            </p>

                            <div className="mb-8 p-6 bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5">
                                <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-4">
                                    Especificações
                                </span>
                                <div className="space-y-3">
                                    {product.specs ? (
                                        product.specs.map((spec, i) => (
                                            <div
                                                key={i}
                                                className="flex justify-between border-b border-gray-100 dark:border-white/5 pb-2 last:border-0 last:pb-0"
                                            >
                                                <span className="text-gray-600 dark:text-gray-400">{spec.label}</span>
                                                <span className="font-medium text-gray-900 dark:text-white">{spec.value}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-gray-500 italic">Especificações detalhadas indisponíveis.</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-auto pt-8 border-t border-gray-200 dark:border-white/10">
                                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
                                    <div>
                                        <p className="text-sm text-gray-500 mb-1">Preço Total</p>
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-4xl font-black text-gray-900 dark:text-white">
                                                Kz {product.price.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                            </span>
                                            {product.oldPrice && (
                                                <span className="text-xl text-gray-400 line-through">
                                                    Kz {product.oldPrice.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="flex items-center bg-gray-100 dark:bg-[#151e32] rounded-xl border border-gray-200 dark:border-white/10">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="w-12 h-14 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 rounded-l-xl transition-colors"
                                        >
                                            <span className="material-icons-round">remove</span>
                                        </button>
                                        <span className="w-12 text-center font-bold text-gray-900 dark:text-white text-lg">
                                            {quantity}
                                        </span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="w-12 h-14 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 rounded-r-xl transition-colors"
                                        >
                                            <span className="material-icons-round">add</span>
                                        </button>
                                    </div>
                                    <button
                                        onClick={handleAddToCart}
                                        disabled={added}
                                        className={`flex-1 h-14 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-2 ${added
                                            ? "bg-green-500 text-white shadow-green-500/20"
                                            : "bg-primary hover:bg-primary-dark text-white shadow-primary/20 hover:-translate-y-1"
                                            }`}
                                    >
                                        {added ? (
                                            <>
                                                <span className="material-icons-round">check</span>
                                                Adicionado!
                                            </>
                                        ) : (
                                            <>
                                                <span className="material-icons-round">shopping_cart</span>
                                                Adicionar ao Carrinho
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
