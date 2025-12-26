"use client";

import { useState } from "react";
import { useCart } from "@/shared/providers/CartProvider";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import FeatureLayout from "@/shared/components/FeatureLayout";
import Link from "next/link";

export default function CheckoutPage() {
    const { items, subtotal, clearCart } = useCart();
    const { user, isSignedIn } = useUser();
    const router = useRouter();

    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.fullName || "",
        email: user?.primaryEmailAddress?.emailAddress || "",
        phone: "",
        nif: "",
        city: "Luanda",
        address: "",
        reference: "",
        paymentMethod: "multicaixa",
    });

    const shipping = 2000;
    const total = subtotal + shipping;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmitOrder = async () => {
        setIsLoading(true);

        // Simulate order creation (will be replaced with Convex mutation)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Clear cart and redirect to success
        clearCart();
        router.push("/checkout/success");
    };

    if (items.length === 0) {
        return (
            <FeatureLayout>
                <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen text-center">
                    <div className="max-w-md mx-auto px-4">
                        <span className="material-icons-round text-6xl text-gray-400 mb-4">shopping_cart</span>
                        <h1 className="font-display font-bold text-2xl text-gray-900 dark:text-white mb-4">
                            Seu carrinho está vazio
                        </h1>
                        <Link href="/store" className="text-primary font-bold hover:underline">
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
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-8 text-center">
                        Finalizar Compra
                    </h1>

                    {/* Stepper */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                                1
                            </div>
                            <div className={`w-16 h-1 ${step >= 2 ? "bg-primary" : "bg-gray-200"}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                                2
                            </div>
                            <div className={`w-16 h-1 ${step >= 3 ? "bg-primary" : "bg-gray-200"}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}>
                                3
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            {/* Step 1: Identification */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 1 ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-gray-100 dark:border-white/5 opacity-60 pointer-events-none"}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">person</span>
                                    Dados Pessoais
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nome Completo"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="E-mail"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Telefone / WhatsApp"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                    />
                                    <input
                                        name="nif"
                                        value={formData.nif}
                                        onChange={handleChange}
                                        placeholder="NIF (Opcional)"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                    />
                                </div>
                                {step === 1 && (
                                    <button
                                        onClick={() => setStep(2)}
                                        className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold w-full sm:w-auto"
                                    >
                                        Continuar para Entrega
                                    </button>
                                )}
                            </div>

                            {/* Step 2: Shipping */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 2 ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-gray-100 dark:border-white/5 opacity-60 pointer-events-none"}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">local_shipping</span>
                                    Endereço de Entrega
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <select
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            className="col-span-3 sm:col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                        >
                                            <option value="Luanda">Luanda</option>
                                            <option value="Benguela">Benguela</option>
                                            <option value="Huambo">Huambo</option>
                                            <option value="Cabinda">Cabinda</option>
                                        </select>
                                    </div>
                                    <input
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="Endereço (Rua, Bairro, Nº)"
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white"
                                    />
                                    <textarea
                                        name="reference"
                                        value={formData.reference}
                                        onChange={handleChange}
                                        placeholder="Ponto de Referência"
                                        className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 resize-none h-24 text-gray-900 dark:text-white"
                                    ></textarea>
                                </div>
                                {step === 2 && (
                                    <div className="flex gap-4 mt-6">
                                        <button onClick={() => setStep(1)} className="text-gray-500 font-bold px-4">
                                            Voltar
                                        </button>
                                        <button
                                            onClick={() => setStep(3)}
                                            className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex-1 sm:flex-none"
                                        >
                                            Ir para Pagamento
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Payment */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 3 ? "border-primary shadow-lg ring-1 ring-primary/20" : "border-gray-100 dark:border-white/5 opacity-60 pointer-events-none"}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">payment</span>
                                    Pagamento
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div
                                        onClick={() => setFormData({ ...formData, paymentMethod: "multicaixa" })}
                                        className={`border p-4 rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === "multicaixa" ? "border-primary bg-primary/5" : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-black/20"}`}
                                    >
                                        <span className={`material-icons-round ${formData.paymentMethod === "multicaixa" ? "text-primary" : "text-gray-400"}`}>
                                            qr_code
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">Multicaixa (Referência)</span>
                                    </div>
                                    <div
                                        onClick={() => setFormData({ ...formData, paymentMethod: "transferencia" })}
                                        className={`border p-4 rounded-xl cursor-pointer flex items-center gap-3 ${formData.paymentMethod === "transferencia" ? "border-primary bg-primary/5" : "border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-black/20"}`}
                                    >
                                        <span className={`material-icons-round ${formData.paymentMethod === "transferencia" ? "text-primary" : "text-gray-400"}`}>
                                            account_balance
                                        </span>
                                        <span className="font-bold text-gray-900 dark:text-white">Transferência Bancária</span>
                                    </div>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm mb-6">
                                    <p className="font-bold mb-1">Nota:</p>
                                    Ao confirmar, você receberá os dados de pagamento no seu e-mail e WhatsApp. O pedido será processado após a confirmação do pagamento.
                                </div>
                                {step === 3 && (
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(2)} className="text-gray-500 font-bold px-4">
                                            Voltar
                                        </button>
                                        <button
                                            onClick={handleSubmitOrder}
                                            disabled={isLoading}
                                            className="bg-green-600 hover:bg-green-500 disabled:bg-green-600/50 text-white px-8 py-4 rounded-xl font-black text-lg w-full shadow-xl shadow-green-600/20 flex items-center justify-center gap-2"
                                        >
                                            {isLoading ? (
                                                <>
                                                    <span className="animate-spin material-icons-round">refresh</span>
                                                    Processando...
                                                </>
                                            ) : (
                                                <>
                                                    Confirmar Pedido <span className="material-icons-round">check</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-3xl border border-gray-100 dark:border-white/5 sticky top-32">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Resumo do Pedido</h3>

                                <div className="space-y-3 mb-6">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex gap-3 text-sm">
                                            <div className="w-12 h-12 bg-gray-100 dark:bg-black/20 rounded-lg overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-gray-900 dark:text-white truncate">{item.name}</p>
                                                <p className="text-gray-500">Qtd: {item.quantity}</p>
                                            </div>
                                            <p className="font-bold text-gray-900 dark:text-white shrink-0">
                                                Kz {(item.price * item.quantity).toLocaleString("pt-AO")}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-3 border-t border-gray-100 dark:border-white/10 pt-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Kz {subtotal.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Frete</span>
                                        <span className="font-bold text-gray-900 dark:text-white">
                                            Kz {shipping.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-white/10 pt-4 flex justify-between">
                                        <span className="font-black text-lg text-gray-900 dark:text-white">Total</span>
                                        <span className="font-black text-xl text-primary">
                                            Kz {total.toLocaleString("pt-AO", { minimumFractionDigits: 2 })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
