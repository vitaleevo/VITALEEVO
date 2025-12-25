"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import FeatureLayout from '@/shared/components/FeatureLayout';

const Checkout: React.FC = () => {
    const [step, setStep] = useState(1);
    const router = useRouter();

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-8 text-center">Finalizar Compra</h1>

                    {/* Stepper */}
                    <div className="flex items-center justify-center mb-12">
                        <div className="flex items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
                            <div className={`w-16 h-1 ${step >= 2 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
                            <div className={`w-16 h-1 ${step >= 3 ? 'bg-primary' : 'bg-gray-200'}`}></div>
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>3</div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">

                            {/* Step 1: Identification */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 1 ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-gray-100 dark:border-white/5 opacity-60 pointer-events-none'}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">person</span>
                                    Dados Pessoais
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <input placeholder="Nome Completo" className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                    <input placeholder="E-mail" className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                    <input placeholder="Telefone / WhatsApp" className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                    <input placeholder="NIF (Opcional)" className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                </div>
                                {step === 1 && (
                                    <button onClick={() => setStep(2)} className="mt-6 bg-primary text-white px-8 py-3 rounded-xl font-bold w-full sm:w-auto">
                                        Continuar para Entrega
                                    </button>
                                )}
                            </div>

                            {/* Step 2: Shipping */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 2 ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-gray-100 dark:border-white/5 opacity-60 pointer-events-none'}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">local_shipping</span>
                                    Endereço de Entrega
                                </h2>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-3 gap-4">
                                        <input placeholder="CEP (Opcional)" className="col-span-1 w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                        <input placeholder="Cidade" className="col-span-2 w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                    </div>
                                    <input placeholder="Endereço (Rua, Bairro, Nº)" className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10" />
                                    <textarea placeholder="Ponto de Referência" className="w-full p-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 resize-none h-24"></textarea>
                                </div>
                                {step === 2 && (
                                    <div className="flex gap-4 mt-6">
                                        <button onClick={() => setStep(1)} className="text-gray-500 font-bold px-4">Voltar</button>
                                        <button onClick={() => setStep(3)} className="bg-primary text-white px-8 py-3 rounded-xl font-bold flex-1 sm:flex-none">
                                            Ir para Pagamento
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Step 3: Payment */}
                            <div className={`bg-white dark:bg-[#151e32] p-8 rounded-3xl border ${step === 3 ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-gray-100 dark:border-white/5 opacity-60 pointer-events-none'}`}>
                                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <span className="material-icons-round text-primary">payment</span>
                                    Pagamento
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                    <div className="border border-primary bg-primary/5 p-4 rounded-xl cursor-pointer flex items-center gap-3">
                                        <span className="material-icons-round text-primary">qr_code</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Pagamento por Referência (Multicaixa)</span>
                                    </div>
                                    <div className="border border-gray-200 dark:border-white/10 p-4 rounded-xl cursor-pointer flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-black/20">
                                        <span className="material-icons-round text-gray-400">credit_card</span>
                                        <span className="font-bold text-gray-500">Cartão de Crédito/Débito</span>
                                    </div>
                                </div>
                                <div className="bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 p-4 rounded-xl text-sm mb-6">
                                    <p className="font-bold mb-1">Nota:</p>
                                    Ao confirmar, você receberá uma referência para pagamento no seu e-mail e WhatsApp. O pedido será processado após a confirmação.
                                </div>
                                {step === 3 && (
                                    <div className="flex gap-4">
                                        <button onClick={() => setStep(2)} className="text-gray-500 font-bold px-4">Voltar</button>
                                        <button
                                            onClick={() => router.push('/checkout/success')}
                                            className="bg-green-600 hover:bg-green-500 text-white px-8 py-4 rounded-xl font-black text-lg w-full shadow-xl shadow-green-600/20 flex items-center justify-center gap-2"
                                        >
                                            Confirmar Pedido <span className="material-icons-round">check</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div>
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-3xl border border-gray-100 dark:border-white/5 sticky top-32">
                                <h3 className="font-bold text-gray-900 dark:text-white mb-6">Resumo do Pedido</h3>
                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Subtotal (2 itens)</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Kz 16.500,00</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Frete</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Kz 2.000,00</span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-white/10 pt-4 flex justify-between">
                                        <span className="font-black text-lg text-gray-900 dark:text-white">Total</span>
                                        <span className="font-black text-xl text-primary">Kz 18.500,00</span>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 text-center mb-4">Garantia de 30 dias de devolução</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </FeatureLayout>
    );
};

export default Checkout;
