"use client";

import { useQuery } from "convex/react";
import { useParams, useRouter } from "next/navigation";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import FeatureLayout from "@/shared/components/FeatureLayout";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useCart } from "@/shared/providers/CartProvider";
import {
    Package,
    Calendar,
    MapPin,
    Truck,
    CreditCard,
    ChevronLeft,
    RefreshCw,
    CheckCircle2,
    Clock,
    AlertCircle,
    Download,
    Phone,
    User,
    ArrowRight,
    Copy,
    Check,
    MessageSquare
} from "lucide-react";
import { formatDate, formatCurrency } from "@/shared/utils/format";
import Link from "next/link";
import { useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function OrderDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user, isAuthenticated, isLoading: authLoading } = useAuth();
    const { addItem } = useCart();

    const [isRepeating, setIsRepeating] = useState(false);
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const orderId = params.id as string;
    const order = useQuery(api.orders.getById, { orderId: orderId as Id<"orders"> });

    if (authLoading || (order === undefined)) {
        return (
            <FeatureLayout>
                <div className="min-h-screen pt-32 pb-24 flex items-center justify-center text-gray-500">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-10 h-10 text-primary animate-spin" />
                        <p className="font-medium">Carregando detalhes do pedido...</p>
                    </div>
                </div>
            </FeatureLayout>
        );
    }

    if (!order) {
        return (
            <FeatureLayout>
                <div className="min-h-screen pt-32 pb-24 text-center">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Pedido não encontrado</h1>
                    <p className="text-gray-500 mb-8">O pedido que você procura não existe ou você não tem permissão para vê-lo.</p>
                    <Link href="/conta" className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold">
                        Voltar para minha conta
                    </Link>
                </div>
            </FeatureLayout>
        );
    }

    const copyToClipboard = (text: string, field: string) => {
        navigator.clipboard.writeText(text);
        setCopiedField(field);
        setTimeout(() => setCopiedField(null), 2000);
    };

    const handleRepeatOrder = () => {
        setIsRepeating(true);
        order.items.forEach(item => {
            addItem({
                id: item.productId as any,
                name: item.name,
                price: item.price,
                image: item.image
            }, item.quantity);
        });

        setTimeout(() => {
            router.push("/cart");
        }, 800);
    };

    const shareToWhatsApp = () => {
        generatePDF();
        const message = `Olá VitalEvo! 👋\n\nAcabei de baixar o meu recibo do Pedido *#${order.orderNumber}*.\n\nFiz o pagamento de *${formatCurrency(order.total)}* e estou enviando o PDF em anexo para confirmar.`;
        const encodedMessage = encodeURIComponent(message);
        window.open(`https://wa.me/244923456789?text=${encodedMessage}`, '_blank');
    };

    const generatePDF = () => {
        const doc = new jsPDF();

        // Header
        doc.setFontSize(22);
        doc.setTextColor(23, 163, 74); // Primary color
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
        doc.text(`Status: ${order.status.toUpperCase()}`, 14, 57);

        // Customer Info
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Cliente:", 14, 70);
        doc.setFont("helvetica", "normal");
        doc.text(order.shippingAddress.name, 14, 76);
        doc.text(order.shippingAddress.phone, 14, 81);
        doc.text(order.shippingAddress.address, 14, 86);
        doc.text(order.shippingAddress.city, 14, 91);
        if (order.shippingAddress.nif) doc.text(`NIF: ${order.shippingAddress.nif}`, 14, 96);

        // Table
        const tableData = order.items.map(item => [
            item.name,
            item.quantity,
            formatCurrency(item.price),
            formatCurrency(item.price * item.quantity)
        ]);

        autoTable(doc, {
            startY: 105,
            head: [['Produto', 'Qtd', 'Preço Unit.', 'Subtotal']],
            body: tableData,
            foot: [
                ['', '', 'Subtotal:', formatCurrency(order.subtotal)],
                ['', '', 'Frete:', formatCurrency(order.shipping)],
                ['', '', 'TOTAL:', formatCurrency(order.total)]
            ],
            theme: 'striped',
            headStyles: { fillColor: [23, 163, 74] },
            footStyles: { fontStyle: 'bold', fillColor: [245, 245, 245], textColor: [0, 0, 0] }
        });

        // Payment Info
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Dados para Pagamento (Transferência):", 14, finalY);
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("Banco: VITALEEVO COMÉRCIO SERVIÇOS LDA", 14, finalY + 7);
        doc.text(`NIB: 2904 9935 1 10 001`, 14, finalY + 12);
        doc.text(`IBAN: 0040 0000 9049 9351 1012 1`, 14, finalY + 17);

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text("Este documento serve como comprovativo de intenção de compra.", 14, finalY + 30);

        doc.save(`recibo-vitaleevo-${order.orderNumber}.pdf`);
    };

    const getStatusInfo = (status: string) => {
        switch (status) {
            case "pending":
                return { label: "Pendente", icon: Clock, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" };
            case "paid":
                return { label: "Pago", icon: CheckCircle2, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" };
            case "processing":
                return { label: "Em Processamento", icon: RefreshCw, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" };
            case "shipped":
                return { label: "Enviado", icon: Truck, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-500/10" };
            case "delivered":
                return { label: "Entregue", icon: CheckCircle2, color: "text-green-500", bg: "bg-green-50 dark:bg-green-500/10" };
            case "cancelled":
                return { label: "Cancelado", icon: AlertCircle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-500/10" };
            default:
                return { label: status, icon: Clock, color: "text-gray-500", bg: "bg-gray-50 dark:bg-white/5" };
        }
    };

    const statusInfo = getStatusInfo(order.status);
    const StatusIcon = statusInfo.icon;

    const timeline = [
        { status: "pending", label: "Pedido Realizado", date: order.createdAt },
        { status: "paid", label: "Pagamento Confirmado", date: (order.status !== "pending" && order.status !== "cancelled") ? order.updatedAt : null },
        { status: "processing", label: "Preparando Envio", date: ["processing", "shipped", "delivered"].includes(order.status) ? order.updatedAt : null },
        { status: "shipped", label: "Em Trânsito", date: ["shipped", "delivered"].includes(order.status) ? order.updatedAt : null },
        { status: "delivered", label: "Entregue", date: order.status === "delivered" ? order.updatedAt : null },
    ];

    return (
        <FeatureLayout>
            <div className="min-h-screen pt-32 pb-24 bg-gray-50 dark:bg-[#0b1120]">
                <div className="max-w-5xl mx-auto px-4 sm:px-6">

                    {/* Breadcrumbs / Back */}
                    <Link href="/conta" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 group">
                        <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Voltar para Minha Conta
                    </Link>

                    {/* Header Action Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="font-display font-black text-3xl text-gray-900 dark:text-white">
                                    Pedido #{order.orderNumber}
                                </h1>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${statusInfo.bg} ${statusInfo.color}`}>
                                    <StatusIcon className="w-3 h-3" />
                                    {statusInfo.label}
                                </span>
                            </div>
                            <p className="text-gray-500 flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {formatDate(order.createdAt)}</span>
                                <span className="flex items-center gap-1"><Package className="w-4 h-4" /> {order.items.length} itens</span>
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={handleRepeatOrder}
                                disabled={isRepeating}
                                className="bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/25"
                            >
                                {isRepeating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                                Repetir Pedido
                            </button>
                            <button
                                onClick={generatePDF}
                                className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-white/10 transition-all"
                            >
                                <Download className="w-5 h-5" />
                                Recibo PDF
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Main Content (Items & Timeline) */}
                        <div className="lg:col-span-2 space-y-8">

                            {/* Bank Transfer Details (Special Info) */}
                            {order.status === "pending" && (
                                <div className="bg-primary/5 dark:bg-primary/10 border border-primary/20 rounded-3xl p-8 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-24 h-24 text-primary" />
                                    </div>
                                    <div className="relative z-10">
                                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                            <CheckCircle2 className="w-6 h-6 text-primary" />
                                            Aguardando Pagamento
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 leading-relaxed">
                                            Para agilizar o processamento do seu pedido, realize a transferência para a conta abaixo e envie o comprovativo pelo nosso WhatsApp.
                                        </p>

                                        <div className="space-y-4 max-w-md">
                                            <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border border-primary/10">
                                                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Beneficiário</p>
                                                <p className="font-bold text-gray-900 dark:text-white text-sm">VITALEEVO COMÉRCIO SERVIÇOS LDA</p>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border border-primary/10 flex flex-col gap-1 relative group/copy">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">NIB</p>
                                                    <p className="font-mono text-sm font-bold text-gray-900 dark:text-white">2904 9935 1 10 001</p>
                                                    <button
                                                        onClick={() => copyToClipboard("29049935110001", "nib")}
                                                        className="absolute right-3 bottom-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                                                    >
                                                        {copiedField === "nib" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-black/20 rounded-2xl border border-primary/10 flex flex-col gap-1 relative group/copy">
                                                    <p className="text-[10px] font-bold text-primary uppercase tracking-widest">IBAN</p>
                                                    <p className="font-mono text-xs font-bold text-gray-900 dark:text-white break-all">0040 0000 9049 9351 1012 1</p>
                                                    <button
                                                        onClick={() => copyToClipboard("004000009049935110121", "iban")}
                                                        className="absolute right-3 bottom-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 text-gray-400 transition-colors"
                                                    >
                                                        {copiedField === "iban" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Order Timeline */}
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-primary" />
                                    Acompanhamento
                                </h3>

                                <div className="relative">
                                    <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-100 dark:bg-white/5" />
                                    <div className="space-y-10 relative text-sm">
                                        {timeline.map((step, index) => {
                                            const isDone = step.date !== null;
                                            const isLast = index === timeline.length - 1;
                                            const isCurrent = order.status === step.status;

                                            return (
                                                <div key={step.status} className="flex gap-6">
                                                    <div className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center transition-all ${isDone ? "bg-primary text-white scale-110 shadow-lg shadow-primary/30" : "bg-gray-100 dark:bg-white/5 text-gray-400"
                                                        }`}>
                                                        {isDone ? <CheckCircle2 className="w-6 h-6" /> : <div className="w-3 h-3 rounded-full bg-current" />}
                                                    </div>
                                                    <div className="flex-1 pt-2">
                                                        <h4 className={`font-bold ${isDone ? "text-gray-900 dark:text-white" : "text-gray-400"}`}>
                                                            {step.label}
                                                        </h4>
                                                        {isDone && (
                                                            <p className="text-gray-500 mt-0.5">
                                                                {formatDate(step.date)}
                                                            </p>
                                                        )}
                                                        {isCurrent && !isLast && (
                                                            <p className="text-xs text-primary font-bold mt-2 animate-pulse flex items-center gap-1">
                                                                <RefreshCw className="w-3 h-3 animate-spin" /> Em progresso...
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                                    <Package className="w-5 h-5 text-primary" />
                                    Produtos
                                </h3>

                                <div className="divide-y divide-gray-100 dark:divide-white/5">
                                    {order.items.map((item) => (
                                        <div key={item.productId} className="py-6 first:pt-0 last:pb-0 flex gap-6">
                                            <div className="w-20 h-20 bg-gray-50 dark:bg-black/20 rounded-2xl overflow-hidden shrink-0 border border-gray-100 dark:border-white/5">
                                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h4 className="font-bold text-gray-900 dark:text-white truncate pr-4 text-sm md:text-base">
                                                        {item.name}
                                                    </h4>
                                                    <p className="font-bold text-gray-900 dark:text-white text-sm md:text-base">
                                                        {formatCurrency(item.price * item.quantity)}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {item.quantity}x {formatCurrency(item.price)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-100 dark:border-white/5 space-y-4">
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Subtotal</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.subtotal)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-gray-500">
                                        <span>Taxa de Entrega</span>
                                        <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(order.shipping)}</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-gray-50 dark:bg-white/5 p-4 md:p-6 rounded-2xl">
                                        <span className="font-black text-gray-900 dark:text-white md:text-lg">Total do Pedido</span>
                                        <span className="font-black text-xl md:text-2xl text-primary">{formatCurrency(order.total)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar (Shipping & Payment) */}
                        <div className="space-y-8">
                            {/* Shipping Details */}
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-primary" />
                                    Entrega
                                </h3>
                                <div className="space-y-4 text-sm">
                                    <div className="flex gap-3">
                                        <User className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <p className="text-gray-900 dark:text-gray-300 font-bold">{order.shippingAddress.name}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <Phone className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <p className="text-gray-900 dark:text-gray-300 font-medium">{order.shippingAddress.phone}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="text-gray-900 dark:text-gray-300 font-medium leading-relaxed">{order.shippingAddress.address}</p>
                                            <p className="text-gray-500 mt-1 font-bold">{order.shippingAddress.city}</p>
                                            {order.shippingAddress.reference && (
                                                <div className="mt-3 bg-gray-50 dark:bg-white/5 p-3 rounded-xl">
                                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Referência</p>
                                                    <p className="text-xs text-gray-600 dark:text-gray-400 italic">"{order.shippingAddress.reference}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details */}
                            <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 border border-gray-100 dark:border-white/5 shadow-xl">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-primary" />
                                    Pagamento
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 bg-gray-50 dark:bg-white/5 p-4 rounded-xl">
                                        <div className="w-10 h-10 rounded-lg bg-white dark:bg-[#151e32] flex items-center justify-center text-primary shadow-sm">
                                            <CreditCard className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">
                                                {order.paymentMethod === "multicaixa" ? "Multicaixa" : "Transferência"}
                                            </p>
                                            <p className="text-[10px] text-gray-500">MÉTODO ESCOLHIDO</p>
                                        </div>
                                    </div>

                                    {order.notes && (
                                        <div className="pt-4 border-t border-gray-100 dark:border-white/5 text-sm">
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Observações</p>
                                            <p className="text-gray-600 dark:text-gray-400 italic">"{order.notes}"</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Support Card */}
                            <div className="bg-gradient-to-br from-primary to-primary-dark rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl shadow-primary/30">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <MessageSquare className="w-24 h-24" />
                                </div>
                                <div className="relative z-10">
                                    <h4 className="font-bold text-xl mb-2">Suporte 24/7</h4>
                                    <p className="text-white/80 text-sm mb-6">Qualquer dúvida sobre o seu pedido, fale conosco agora.</p>
                                    <button
                                        onClick={shareToWhatsApp}
                                        className="inline-flex items-center gap-2 bg-white text-primary px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition-colors shadow-lg"
                                    >
                                        Enviar Comprovativo
                                        <ArrowRight className="w-4 h-4" />
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


