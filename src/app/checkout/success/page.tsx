import Link from 'next/link';
import FeatureLayout from '@/shared/components/FeatureLayout';
import { CheckCircle } from "lucide-react";

export default function OrderSuccessPage() {
    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full px-4 text-center">

                    <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
                        Pedido Confirmado!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Obrigado pela sua compra. Enviamos um e-mail com os detalhes do seu pedido e a referência de pagamento.
                    </p>

                    <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 mb-8 text-left">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Número do Pedido:</span>
                            <span className="font-bold text-gray-900 dark:text-white">#VE-88392</span>
                        </div>
                        <div className="flex justify-between mb-2">
                            <span className="text-sm text-gray-500">Total a Pagar:</span>
                            <span className="font-bold text-primary">Kz 18.500,00</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500">Previsão de Entrega:</span>
                            <span className="font-bold text-gray-900 dark:text-white">2 - 4 Dias Úteis</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <Link
                            href="/store"
                            className="block w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1"
                        >
                            Continuar Comprando
                        </Link>

                        <Link
                            href="/"
                            className="block w-full bg-gray-200 dark:bg-white/5 hover:bg-gray-300 dark:hover:bg-white/10 text-gray-900 dark:text-white py-4 rounded-xl font-bold transition-colors"
                        >
                            Voltar ao Início
                        </Link>
                    </div>

                </div>
            </div>
        </FeatureLayout>
    );
}
