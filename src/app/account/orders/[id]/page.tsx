import FeatureLayout from '@/shared/components/FeatureLayout';
import Link from 'next/link';
import { ArrowLeft, QrCode, RefreshCw } from "lucide-react";
import { products } from '@/features/store/data';

interface Props {
    params: { id: string };
}

export default async function OrderDetailPage({ params }: Props) {
    const { id } = await params;

    // Mock order data
    const order = {
        id: id,
        date: '22 Dez 2024',
        status: 'Entregue',
        paymentMethod: 'Multicaixa Referência',
        shippingAddress: 'Bairro Benfica, Rua Principal, Casa 45, Luanda',
        items: [products[0], products[1]],
        subtotal: 838.90,
        shipping: 2000.00,
        total: 18500.00,
    };

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/account/orders" className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-500" />
                        </Link>
                        <div>
                            <h1 className="font-display font-black text-2xl text-gray-900 dark:text-white">Pedido #{order.id}</h1>
                            <p className="text-sm text-gray-500">Realizado em {order.date}</p>
                        </div>
                        <span className="ml-auto px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400">
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">

                            {/* Items */}
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Itens do Pedido</h3>
                                <div className="space-y-4">
                                    {order.items.map(item => (
                                        <div key={item.id} className="flex gap-4 pb-4 border-b border-gray-100 dark:border-white/5 last:border-0 last:pb-0">
                                            <div className="w-20 h-20 bg-gray-100 dark:bg-black/20 rounded-xl overflow-hidden shrink-0">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-gray-900 dark:text-white">{item.name}</p>
                                                <p className="text-sm text-gray-500">Qtd: 1</p>
                                            </div>
                                            <p className="font-bold text-gray-900 dark:text-white">Kz {item.price.toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Shipping Info */}
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Endereço de Entrega</h3>
                                <p className="text-gray-600 dark:text-gray-400">{order.shippingAddress}</p>
                            </div>

                        </div>

                        {/* Sidebar Summary */}
                        <div className="space-y-6">
                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6">Resumo</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Kz {order.subtotal.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Frete</span>
                                        <span className="font-bold text-gray-900 dark:text-white">Kz {order.shipping.toFixed(2)}</span>
                                    </div>
                                    <div className="border-t border-gray-100 dark:border-white/10 pt-3 flex justify-between">
                                        <span className="font-black text-gray-900 dark:text-white">Total</span>
                                        <span className="font-black text-xl text-primary">Kz {order.total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Pagamento</h3>
                                <p className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
                                    <QrCode className="w-5 h-5 text-primary" />
                                    {order.paymentMethod}
                                </p>
                            </div>

                            <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                                <RefreshCw className="w-5 h-5" />
                                Comprar Novamente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
