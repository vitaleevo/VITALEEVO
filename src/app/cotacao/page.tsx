"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { api, storeQuoteAccessToken } from "@/shared/utils/apiClient";
import { useCart } from "@/shared/providers/CartProvider";
import FeatureLayout from "@/shared/components/FeatureLayout";
import {
    FileText, Trash2, Minus, Plus, ArrowRight, Loader2,
    ShoppingBag, AlertCircle, MessageSquare,
} from "lucide-react";

export default function CotacaoPage() {
    const router = useRouter();
    const { items, updateQuantity, removeItem, clearCart } = useCart();

    const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", message: "" });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (items.length === 0) {
            setError("O seu pedido de cotação está vazio. Adicione produtos na loja.");
            return;
        }

        if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) {
            setError("Preencha o nome, e-mail e telefone para recebermos a sua cotação.");
            return;
        }

        setSubmitting(true);
        try {
            const result = await api.quotes.create({
                name: form.name,
                email: form.email,
                phone: form.phone,
                company: form.company || undefined,
                message: form.message || undefined,
                source: "store",
                items: items.map((item) => ({
                    name: item.name,
                    sku: item.sku,
                    image: item.image,
                    quantity: item.quantity,
                })),
            });

            clearCart();
            storeQuoteAccessToken(result.publicId, result.accessToken);
            router.push(`/cotacao/sucesso?ref=${result.publicId}`);
        } catch (err: any) {
            setError(err?.message || "Não foi possível enviar o pedido. Tente novamente.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputClass = "w-full rounded-xl bg-gray-100 dark:bg-[#151e32] border border-transparent focus:border-primary/40 focus:bg-white dark:focus:bg-[#1a2440] px-4 py-3 text-gray-900 dark:text-white outline-none transition-all";

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-10">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary mb-3">
                            <FileText className="w-4 h-4" />
                            Pedido de Cotação
                        </div>
                        <h1 className="font-display text-3xl md:text-4xl font-black text-gray-900 dark:text-white">
                            Solicite a sua cotação
                        </h1>
                        <p className="mt-3 text-gray-600 dark:text-gray-400 max-w-2xl">
                            A nossa equipa comercial entra em contacto consigo com a melhor proposta.
                        </p>
                    </div>

                    {items.length === 0 ? (
                        <div className="bg-white dark:bg-[#151e32] rounded-3xl border border-gray-100 dark:border-white/5 p-12 text-center shadow-xl">
                            <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <ShoppingBag className="w-10 h-10 text-primary" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                Ainda não tem produtos na cotação
                            </h2>
                            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
                                Explore a loja e adicione produtos ao seu pedido de cotação.
                            </p>
                            <Link
                                href="/store"
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all"
                            >
                                Ver a Loja
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                            {/* Itens */}
                            <div className="lg:col-span-3 space-y-4">
                                {items.map((item) => (
                                    <div
                                        key={item.productId}
                                        className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 p-4 flex items-center gap-4 shadow-sm"
                                    >
                                        <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                            <Image
                                                src={item.image || "/hero-card.png"}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 dark:text-white truncate">{item.name}</h3>
                                            {item.sku && (
                                                <p className="text-xs text-gray-400 mt-0.5">Ref: {item.sku}</p>
                                            )}
                                            <div className="flex items-center gap-2 mt-3">
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-10 text-center font-bold text-gray-900 dark:text-white">{item.quantity}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.productId)}
                                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                                            aria-label="Remover item"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                ))}

                                <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 p-5 shadow-sm">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        <MessageSquare className="w-4 h-4 inline mr-2 text-primary" />
                                        O preço é enviado por proposta comercial — sem compromisso.
                                    </p>
                                </div>
                            </div>

                            {/* Formulário */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-[#151e32] rounded-3xl border border-gray-100 dark:border-white/5 p-6 shadow-xl lg:sticky lg:top-28">
                                    <h2 className="font-bold text-gray-900 dark:text-white text-lg mb-5">
                                        Os seus dados
                                    </h2>
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Nome completo *"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            className={inputClass}
                                        />
                                        <input
                                            type="email"
                                            placeholder="E-mail *"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            className={inputClass}
                                        />
                                        <input
                                            type="tel"
                                            placeholder="Telefone / WhatsApp *"
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className={inputClass}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Empresa (opcional)"
                                            value={form.company}
                                            onChange={(e) => setForm({ ...form, company: e.target.value })}
                                            className={inputClass}
                                        />
                                        <textarea
                                            placeholder="Mensagem (opcional)"
                                            value={form.message}
                                            onChange={(e) => setForm({ ...form, message: e.target.value })}
                                            rows={3}
                                            className={`${inputClass} resize-none`}
                                        />
                                    </div>

                                    {error && (
                                        <div className="mt-4 flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 text-red-600 text-sm">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="mt-6 w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                A enviar...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Pedido de Cotação
                                                <ArrowRight className="w-5 h-5" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </FeatureLayout>
    );
}
