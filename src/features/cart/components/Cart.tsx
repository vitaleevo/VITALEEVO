"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import {
    AlertTriangle,
    Minus,
    Plus,
    Trash2,
    ArrowLeft,
    ArrowRight,
    Lock,
    ShieldCheck,
    CreditCard
} from "lucide-react";

const Cart: React.FC = () => {
    // Mock Cart Data
    const [items, setItems] = useState([
        {
            id: 1,
            name: "Canon EOS R5 Mirrorless",
            status: "In Stock",
            type: "Pro Camera Body",
            price: 2500000,
            quantity: 1,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLmPx3Pv47EgysWgI79t5DuweYg3IR7aAQjdwsI5JWFVml8xcD60EqcA_1rOXnqTeQADYwxHD5nLVM96mvr12bAjf_xs7go_kEnu9L3_Wa3JP9PMoHvwxCphbd7ph4nN2stgPMjOpZfzgnc6CONTyvVZUhsplxVd7T8qfcxj9U1KlTK-RB7eydGIGQlDfRzwxpSJ-hXNWsoueXvxFmP-Xk3fX6YMJBj39jlL1BGRVLBVs-RQiI07UFEyKzv_hmEjHcyKChOBFWQ-dg"
        },
        {
            id: 2,
            name: "Cisco Catalyst 9200",
            status: "In Stock",
            type: "48-Port PoE+ Switch",
            price: 850000,
            quantity: 2,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLC6n8hOsTRy5SNMf35QwTRgo_sUzYhyXC-tH-MzTK_FZoyJtue98bcxJMR0h2ExvVMZRLi5CKfkizHfFr1VaMJN0rv96sn25ss5bHcmxdOqi4-oncK2q8ODjdGzyRX-Abu3pKeRz7NDgMRYzMclYTKsUjkhgyqzkdU3pASOQW703UgU99PqiiXx8XrxJKnZ4h5zPCVm1qkp73TqEoFxKRJWereFyefk97i_SZ9ykimX1xNx_sc7UkLPr4rCW7Gm6br-9FyAaU8Z6f"
        },
        {
            id: 3,
            name: "Sony Alpha a7 III Body",
            status: "Low Stock",
            type: "Full-frame Mirrorless",
            price: 1200000,
            quantity: 1,
            isLowStock: true,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDmgxfqxh-vU4pVzIgg0BA_dErBKHzvbPQnWOAbAxQwPxxA-_oMnf7j6Xop83o8bP9YQZganeDBspO5YAcPjvTMLIVQmn-xtoeR1oyS02i29wzguWAZJB4pZ4KpKwISGW2bmSkAmmXH1p4fBTXuX-9i6Hir8YcO0shiM2qmMQ5IoPwkRKnNDau747F_9R0F-1p4c_OQ-RY_tFgp1AQtqLVzy0Dh8DdLQTnzvEq6thf6otEpaNJbjXIdegVqMmZUo6i7wyG1FkorrMAN"
        }
    ]);

    const updateQuantity = (id: number, delta: number) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const newQuantity = Math.max(1, item.quantity + delta);
                return { ...item, quantity: newQuantity };
            }
            return item;
        }));
    };

    const removeItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    // Calculations
    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const tax = subtotal * 0.14; // 14% VAT
    const total = subtotal + tax;

    const recommendedItems = [
        {
            name: "Mechanical Keyboard RGB",
            price: 45000,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNlMKpVYcl4dTJpC4oT5tRj7meEfgWG_JoVdbN8R1Zcsn0KY84b2aL9b2nXyea4Pvy-QGdOT7HCeWVk6jj8ZxdmKbqaG0L-h_OEI798XsQ7kAbUC--lQpSNyxc4iOCtl26E4TEwjCdxynoRvUeMHSxsRZatpZVtUzZbYcwf4tqrVvuXfZV4hUCUMJYIWUv3h6rUQyQ0_Wcuv-wSFg6094UbHx-qbUMFE_cLR1lZmaC_SmdkgFMw-G5zmLKUB2beUF3vEGq4jsw9Fzk"
        },
        {
            name: "Logitech MX Master 3",
            price: 60000,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDJIV80zHDhHfCpZjwmA4_mvKaztbyweVYD9W-Gm-63wEAgOKrt-e1G5siNHlsgUtVkqfrRtyCJtPPtGPU50BX72bBpgnjkjebum_W5bWbBs5kltDU2RVKVuvwxfLtY3fdCWtX8eMScU9-8-nk2xEVCDsSBjct50WJ9u4DhpJXAFd8LIAMDMLDFa55lUFYQNwPm9TFNTcPlutT8zAtv0uJuJoPIYsHuO0YW4L_ToUeEIai9AaPUdXCVUXKBfsRz4ij2CYwid3L2tcTj"
        },
        {
            name: "Laptop Stand Aluminum",
            price: 25000,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDRIz3d_ccrpc4pNEcKIOz8-5pg2DM2su1T8F8NcOSEwS02UKxUZd9Q2FGkIinK9WK7Hu_J-zeZA-wbbD5COTzgVELdHryWc2tHGs0p-8OOKy3xSJhXbOFLYBs6J82rtuXFMHBa8Tzw1uOJBX0P3VbBKhmzyaUuFBJQuo0JAjRZDdCCvatK0omJPK8NGGo_-1mUQ2YkrL6KrFdzmx24YFQZdVyov4JOO-hG169yfCO8IH_DyWFbCSKI5WBJyq7JOsFSs0gMbj6Bm0MH"
        },
        {
            name: "Samsung T7 SSD 1TB",
            price: 95000,
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDtuUNZMlS7Z1wHVu4vqLxmpSpcbd9KoooncxXLvpnmvw_9FvmP76cfdzZWeyTN0WH2qjaYBO6GMDK5zISJ23QCF8Ix7mVfw9IWHFqWboH5nY-4dkNC9aH-vBe4_8yp66HWUQePf4Xe8Rl8SIjoJxQtaD3eFI0ZPEpGJ1t_a6Zk-hjrLuCSXURlfyv55t7eBJOlSwNSpWJPWsw-rf3bEMbHO4It5deNzrndJN3PpxYf1kO8KNlqCdQ_HvBTBMtyKc1lOArwLwyzrwjP"
        }
    ];

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(val).replace('AOA', 'Kz');
    }

    return (
        <div className="pt-28 pb-20 bg-gray-50 dark:bg-background-dark min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Page Title */}
                <div className="mb-8 flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl font-display">Seu Carrinho</h1>
                    <p className="text-gray-500 dark:text-gray-400">Revise seus equipamentos de TI e prossiga para o checkout seguro.</p>
                </div>

                <div className="flex flex-col gap-8 lg:flex-row">

                    {/* Left Column: Cart Items */}
                    <div className="flex-1 space-y-4">
                        <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-white/10">
                            <span className="text-sm font-medium text-gray-500">Produto</span>
                            <span className="hidden sm:block text-sm font-medium text-gray-500">Quantidade & Preço</span>
                        </div>

                        {items.map(item => (
                            <div key={item.id} className="group relative flex flex-col gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm transition-all hover:shadow-md border border-gray-100 dark:border-white/5 sm:flex-row sm:items-center">
                                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex flex-1 flex-col justify-between sm:flex-row sm:items-center">
                                    <div className="space-y-1 pr-4">
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">{item.name}</h3>
                                        {item.isLowStock ? (
                                            <p className="text-sm text-yellow-500 flex items-center gap-1 font-medium">
                                                <AlertTriangle className="w-4 h-4" />
                                                Estoque Baixo
                                            </p>
                                        ) : (
                                            <p className="text-sm text-primary font-medium">{item.status}</p>
                                        )}
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.type}</p>
                                    </div>
                                    <div className="mt-4 flex items-center justify-between gap-6 sm:mt-0">
                                        <div className="flex items-center rounded-lg border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-background-dark px-1">
                                            <button
                                                onClick={() => updateQuantity(item.id, -1)}
                                                className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                            >
                                                <Minus className="w-4 h-4" />
                                            </button>
                                            <input
                                                className="w-12 bg-transparent text-center text-sm font-medium focus:outline-none border-none p-0 text-gray-900 dark:text-white"
                                                readOnly
                                                type="number"
                                                value={item.quantity}
                                            />
                                            <button
                                                onClick={() => updateQuantity(item.id, 1)}
                                                className="flex h-8 w-8 items-center justify-center text-gray-500 hover:text-primary transition-colors"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg whitespace-nowrap text-gray-900 dark:text-white">{formatCurrency(item.price)}</p>
                                            {item.quantity > 1 && (
                                                <p className="text-xs text-gray-400">Total: {formatCurrency(item.price * item.quantity)}</p>
                                            )}
                                            <button
                                                onClick={() => removeItem(item.id)}
                                                className="text-xs text-red-500 hover:text-red-600 hover:underline flex items-center justify-end gap-1 mt-1 ml-auto"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                                Remover
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Back Button */}
                        <div className="pt-4">
                            <Link href="/store" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-primary transition-colors">
                                <ArrowLeft className="w-4 h-4" />
                                Continuar Comprando
                            </Link>
                        </div>
                    </div>

                    {/* Right Column: Summary */}
                    <div className="lg:w-96">
                        <div className="sticky top-24 rounded-xl bg-white dark:bg-surface-dark p-6 shadow-sm border border-gray-100 dark:border-white/5">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Resumo do Pedido</h2>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Frete</span>
                                    <span className="font-medium text-primary">Grátis</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 dark:text-gray-400">Impostos (14% IVA)</span>
                                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(tax)}</span>
                                </div>

                                {/* Promo Code */}
                                <div className="pt-4 pb-2">
                                    <label className="sr-only" htmlFor="promo">Código Promocional</label>
                                    <div className="flex gap-2">
                                        <input
                                            id="promo"
                                            type="text"
                                            placeholder="Cupom de Desconto"
                                            className="flex-1 rounded-lg border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-background-dark text-sm focus:border-primary focus:ring-primary text-gray-900 dark:text-white"
                                        />
                                        <button className="rounded-lg bg-gray-100 dark:bg-white/10 px-3 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-gray-900 dark:text-white">Aplicar</button>
                                    </div>
                                </div>

                                <div className="border-t border-gray-200 dark:border-white/10 pt-4 mt-4">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <span className="text-base font-bold text-gray-900 dark:text-white">Total Geral</span>
                                        <span className="text-2xl font-black text-gray-900 dark:text-white">{formatCurrency(total)}</span>
                                    </div>
                                    <p className="text-xs text-right text-gray-500 dark:text-gray-400 mb-6">Incluindo IVA</p>

                                    <button className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-4 text-base font-bold text-white hover:bg-primary-dark active:scale-[0.98] transition-all shadow-[0_4px_14px_0_rgba(19,236,91,0.39)]">
                                        Ir para Pagamento
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Trust Signals */}
                                <div className="mt-6 flex flex-col gap-3 text-center">
                                    <p className="text-xs text-gray-400 dark:text-gray-500">Pagamento Seguro via VitalEvo Pay</p>
                                    <div className="flex justify-center gap-4 text-gray-300 dark:text-gray-600">
                                        <Lock className="w-6 h-6" />
                                        <ShieldCheck className="w-6 h-6" />
                                        <CreditCard className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                {/* You might also like */}
                <div className="mt-16 border-t border-gray-200 dark:border-white/10 pt-12">
                    <h3 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Você também pode gostar</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedItems.map((item, i) => (
                            <div key={i} className="group rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-white/10 p-4 transition-all">
                                <div className="aspect-square w-full rounded-lg bg-gray-100 dark:bg-gray-800 mb-3 overflow-hidden">
                                    <img
                                        src={item.image}
                                        alt={item.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <h4 className="font-bold text-sm truncate text-gray-900 dark:text-white">{item.name}</h4>
                                <p className="text-primary text-sm font-medium mt-1">{formatCurrency(item.price)}</p>
                                <button className="mt-3 w-full rounded bg-gray-100 dark:bg-white/10 py-1.5 text-xs font-bold hover:bg-primary hover:text-white transition-colors text-gray-700 dark:text-gray-200">Adicionar ao Carrinho</button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Cart;
