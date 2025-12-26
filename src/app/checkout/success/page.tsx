"use client";

import { useSearchParams } from 'next/navigation';
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from 'next/link';
import FeatureLayout from '@/shared/components/FeatureLayout';
import { CheckCircle, Download, ShoppingBag, Home, ArrowRight, RefreshCw, AlertCircle, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/shared/utils/format";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatDate } from "@/shared/utils/format";

export default function OrderSuccessPage() {
    const searchParams = useSearchParams();
    const orderNumber = searchParams.get('order');

    const order = useQuery(api.orders.getByOrderNumber, orderNumber ? { orderNumber } : "skip");

    const shareToWhatsApp = () => {
        if (!order) return;
        generatePDF();
        const message = `Olá VitalEvo! 👋\n\nAcabei de realizar o Pedido *#${order.orderNumber}* no site.\n\nBaixei o recibo e estou enviando em anexo para confirmar o pagamento de *${formatCurrency(order.total)}*.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/244923456789?text=${encodedMessage}`, '_blank');
    };

    const generatePDF = () => {
        if (!order) return;
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(23, 163, 74);
        doc.text("VITALEEVO", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Comércio e Serviços, Lda", 14, 26);
        doc.text("Luanda, Angola", 14, 31);

        doc.setFontSize(18);
        doc.setTextColor(0);
        doc.text(`Recibo do Pedido #${order.orderNumber}`, 14, 45);

        doc.setFontSize(10);
        doc.text(`Data: ${formatDate(order.createdAt)}`, 14, 52);

        // Customer Info
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Cliente:", 14, 70);
        doc.setFont("helvetica", "normal");
        doc.text(order.shippingAddress.name, 14, 76);
        doc.text(order.shippingAddress.phone, 14, 81);
        doc.text(order.shippingAddress.address, 14, 86);

        // Table
        const tableData = order.items.map(item => [
            item.name,
            item.quantity,
            formatCurrency(item.price),
            formatCurrency(item.price * item.quantity)
        ]);

        autoTable(doc, {
            startY: 100,
            head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
            body: tableData,
            foot: [
                ['', '', 'Subtotal:', formatCurrency(order.subtotal)],
                ['', '', 'TOTAL:', formatCurrency(order.total)]
            ],
            theme: 'striped',
            headStyles: { fillColor: [23, 163, 74] }
        });

        // Payment Info
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Dados para Pagamento:", 14, finalY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Beneficiário: VITALEEVO COMÉRCIO SERVIÇOS LDA", 14, finalY + 7);
        doc.text(`NIB: 2904 9935 1 10 001`, 14, finalY + 12);
        doc.text(`IBAN: 0040 0000 9049 9351 1012 1`, 14, finalY + 17);

        doc.save(`recibo-${order.orderNumber}.pdf`);
    };

    return (
        <FeatureLayout>
            <div className="pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120] min-h-screen flex items-center justify-center">
                <div className="max-w-md w-full px-4 text-center">

                    <div className="w-24 h-24 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce transition-all">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                    </div>

                    <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-4">
                        Pedido Confirmado!
                    </h1>

                    <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
                        Obrigado pela sua compra. Seu pedido foi recebido com sucesso e estamos aguardando o pagamento via transferência.
                    </p>

                    {order === undefined ? (
                        <div className="flex justify-center p-8">
                            <RefreshCw className="w-8 h-8 text-primary animate-spin" />
                        </div>
                    ) : order ? (
                        <div className="bg-white dark:bg-[#151e32] p-6 rounded-2xl border border-gray-100 dark:border-white/5 mb-8 text-left shadow-xl">
                            <div className="flex justify-between mb-3">
                                <span className="text-sm text-gray-500">Número do Pedido:</span>
                                <span className="font-bold text-gray-900 dark:text-white">#{order.orderNumber}</span>
                            </div>
                            <div className="flex justify-between mb-3 text-lg">
                                <span className="text-sm text-gray-500 self-center">Total a Pagar:</span>
                                <span className="font-black text-primary">{formatCurrency(order.total)}</span>
                            </div>
                            <div className="pt-4 border-t border-gray-100 dark:border-white/5 mt-4">
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 text-primary">Dados para Transferência</p>
                                <div className="space-y-2 text-xs">
                                    <p className="font-bold text-gray-900 dark:text-white">VITALEEVO COMÉRCIO SERVIÇOS LDA</p>
                                    <p className="font-mono text-gray-600 dark:text-gray-400">NIB: 2904 9935 1 10 001</p>
                                    <p className="font-mono text-gray-600 dark:text-gray-400 break-all">IBAN: 0040 0000 9049 9351 1012 1</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button
                                    onClick={generatePDF}
                                    className="py-3 px-4 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 border border-gray-100 dark:border-white/10 rounded-xl flex items-center justify-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    PDF
                                </button>
                                <button
                                    onClick={shareToWhatsApp}
                                    className="py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all shadow-lg shadow-green-500/20"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    WhatsApp
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-4 bg-red-50 dark:bg-red-900/10 rounded-xl mb-8 border border-red-100 dark:border-red-900/20 text-red-600 flex items-center gap-2 justify-center">
                            <AlertCircle className="w-5 h-5" />
                            <span className="text-sm font-medium">Não conseguimos carregar os dados do pedido.</span>
                        </div>
                    )}

                    <div className="space-y-3">
                        <Link
                            href="/store"
                            className="flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold transition-all shadow-lg shadow-primary/25 hover:-translate-y-1"
                        >
                            <ShoppingBag className="w-5 h-5" />
                            Continuar Comprando
                        </Link>

                        <div className="grid grid-cols-2 gap-3">
                            <Link
                                href="/conta"
                                className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold transition-colors text-sm"
                            >
                                Ver Minha Conta
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                href="/"
                                className="flex items-center justify-center gap-2 bg-white dark:bg-white/5 hover:bg-gray-50 dark:hover:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 py-4 rounded-xl font-bold transition-colors text-sm"
                            >
                                <Home className="w-4 h-4" />
                                Início
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
