"use client";

import { useCart } from "@/shared/providers/CartProvider";
import FeatureLayout from "@/shared/components/FeatureLayout";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Trash2, Minus, Plus } from "lucide-react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, subtotal, totalItems, clearCart } = useCart();

    const shipping = 2000; // Kz 2.000 de frete
    const total = subtotal + shipping;

    if (items.length === 0) {
        return (
            <FeatureLayout>
                <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                        <div className="w-32 h-32 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-8">
                            <ShoppingCart className="w-16 h-16 text-gray-400" />
                        </div>
                        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white mb-4">
                            Seu carrinho está vazio
                        </h1>
                        <p className="text-gray-500 mb-8">Adicione produtos ao seu carrinho para continuar.</p>
                        <Link
                            href="/store"
                            className="inline-block bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg transition-all"
                        >
                            Ir para a Loja
                        </Link>
                    </div>
                </div>
            </FeatureLayout>
        );
    }

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between mb-8">
                        <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
                            Carrinho ({totalItems} {totalItems === 1 ? "item" : "itens"})
                        </h1>
                        <button
                            onClick={clearCart}
                            className="text-red-500 hover:text-red-600 font-bold text-sm flex items-center gap-2"
                        >
                            <Trash2 className="w-5 h-5" />
                            Limpar Carrinho
                        </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 flex gap-6"
                                >
                                    <div className="w-24 h-24 bg-gray-100 dark:bg-black/20 rounded-xl overflow-hidden shrink-0">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white mb-1 truncate">
                                            {item.name}
                                        </h3>
                                        <p className="text-lg font-black text-primary mb-4">
                                            Kz {item.price.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center bg-gray-100 dark:bg-black/20 rounded-lg">
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 rounded-l-lg transition-colors"
                                                >
                                                    <Minus className="w-5 h-5" />
                                                </button>
                                                <span className="w-12 text-center font-bold text-gray-900 dark:text-white">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-white/10 rounded-r-lg transition-colors"
                                                >
                                                    <Plus className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => removeItem(item.productId)}
                                                className="text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xl font-black text-gray-900 dark:text-white">
                                            Kz {(item.price * item.quantity).toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 sticky top-32">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">
                                    Resumo do Pedido
                                </h3>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Kz {subtotal.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Frete Estimado</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Kz {shipping.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-white/10 pt-4 flex justify-between">
                                        <span className="font-black text-lg text-gray-900 dark:text-white">
                                            Total
                                        </span>
                                        <span className="font-black text-xl text-primary">
                                            Kz {total.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>

                                <Link
                                    href="/checkout"
                                    className="block w-full bg-primary hover:bg-primary-dark text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:-translate-y-1"
                                >
                                    Ir para Pagamento
                                </Link>

                                <Link
                                    href="/store"
                                    className="block w-full text-center text-primary font-bold mt-4 hover:underline"
                                >
                                    Continuar Comprando
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
