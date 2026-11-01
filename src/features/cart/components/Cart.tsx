"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FileText, Minus, Plus, ShieldCheck, ShoppingBag, Trash2 } from "lucide-react";

import { useCart } from "@/shared/providers/CartProvider";
import { formatCurrency } from "@/shared/utils/format";

const Cart: React.FC = () => {
    const { items, removeItem, updateQuantity, clearCart, subtotal, totalItems } = useCart();

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 px-4 pb-20 pt-32 dark:bg-background-dark">
                <div className="mx-auto max-w-2xl rounded-3xl border border-gray-100 bg-white p-10 text-center shadow-sm dark:border-white/5 dark:bg-surface-dark">
                    <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-primary" />
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">O seu carrinho está vazio</h1>
                    <p className="mt-3 text-gray-500 dark:text-gray-400">
                        Adicione produtos da loja para preparar um pedido de cotação.
                    </p>
                    <Link
                        href="/store"
                        className="mt-7 inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-3 font-bold text-white transition-colors hover:bg-primary-dark"
                    >
                        Ver produtos
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20 pt-28 dark:bg-background-dark">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">Seu Carrinho</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            {totalItems} {totalItems === 1 ? "item" : "itens"}. Reveja os produtos antes de solicitar a cotação.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={clearCart}
                        className="text-sm font-semibold text-red-500 transition-colors hover:text-red-600"
                    >
                        Limpar carrinho
                    </button>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">
                    <div className="flex-1 space-y-4">
                        {items.map((item) => (
                            <article
                                key={String(item.productId)}
                                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-surface-dark sm:flex-row sm:items-center"
                            >
                                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800">
                                    <Image
                                        src={item.image || "/hero-card.png"}
                                        alt={item.name}
                                        fill
                                        sizes="112px"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">{item.name}</h2>
                                    {item.sku && <p className="mt-1 text-xs text-gray-400">Ref: {item.sku}</p>}
                                    <p className="mt-2 font-semibold text-primary">{formatCurrency(item.price ?? 0)}</p>
                                </div>

                                <div className="flex items-center justify-between gap-5 sm:justify-end">
                                    <div className="flex items-center rounded-xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-background-dark">
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:text-primary"
                                            aria-label={`Diminuir quantidade de ${item.name}`}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </button>
                                        <span className="w-10 text-center text-sm font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            className="flex h-10 w-10 items-center justify-center text-gray-500 transition-colors hover:text-primary"
                                            aria-label={`Aumentar quantidade de ${item.name}`}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </button>
                                    </div>

                                    <div className="min-w-28 text-right">
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {formatCurrency((item.price ?? 0) * item.quantity)}
                                        </p>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.productId)}
                                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-500 hover:text-red-600"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Remover
                                        </button>
                                    </div>
                                </div>
                            </article>
                        ))}

                        <Link href="/store" className="inline-flex items-center gap-2 pt-3 text-sm font-semibold text-gray-500 hover:text-primary">
                            <ArrowLeft className="h-4 w-4" />
                            Continuar comprando
                        </Link>
                    </div>

                    <aside className="lg:w-96">
                        <div className="sticky top-24 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-surface-dark">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Resumo</h2>
                            <div className="mt-6 flex items-center justify-between border-b border-gray-100 pb-5 dark:border-white/10">
                                <span className="text-sm text-gray-500 dark:text-gray-400">Subtotal estimado</span>
                                <span className="text-xl font-black text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                            </div>
                            <p className="mt-4 text-xs leading-5 text-gray-500 dark:text-gray-400">
                                Disponibilidade, IVA, entrega e condições comerciais são confirmados na proposta final.
                            </p>

                            <Link
                                href="/cotacao"
                                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-bold text-white transition-all hover:bg-primary-dark active:scale-[0.99]"
                            >
                                <FileText className="h-5 w-5" />
                                Solicitar cotação
                            </Link>

                            <div className="mt-5 flex items-start gap-2 rounded-xl bg-gray-50 p-3 text-xs text-gray-500 dark:bg-white/5 dark:text-gray-400">
                                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                                <span>Não é efetuado nenhum pagamento nesta etapa.</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default Cart;
