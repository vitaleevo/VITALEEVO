"use client";

import React, { useState } from 'react';
import {
    X,
    Package,
    User,
    MapPin,
    CreditCard,
    Calendar,
    Truck,
    CheckCircle,
    Clock,
    AlertCircle,
    ChevronDown,
    Save,
    Loader2
} from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { formatDate, formatCurrency } from "@/shared/utils/format";
import Image from 'next/image';

interface OrderDetailModalProps {
    order: any;
    isOpen: boolean;
    onClose: () => void;
}

const OrderDetailModal: React.FC<OrderDetailModalProps> = ({ order, isOpen, onClose }) => {
    const updateStatus = useMutation(api.orders.updateStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const [status, setStatus] = useState(order?.status || 'pending');

    if (!isOpen || !order) return null;

    const handleStatusUpdate = async () => {
        setIsUpdating(true);
        try {
            await updateStatus({
                orderId: order._id as Id<"orders">,
                status: status as any
            });
            // Status updated successfully, notification sent automatically by backend
        } catch (error) {
            console.error("Error updating order status:", error);
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (s: string) => {
        switch (s) {
            case 'pending': return 'text-yellow-500 bg-yellow-500/10';
            case 'paid': return 'text-blue-500 bg-blue-500/10';
            case 'processing': return 'text-purple-500 bg-purple-500/10';
            case 'shipped': return 'text-indigo-500 bg-indigo-500/10';
            case 'delivered': return 'text-green-500 bg-green-500/10';
            case 'cancelled': return 'text-red-500 bg-red-500/10';
            default: return 'text-gray-500 bg-gray-500/10';
        }
    };

    const statuses = [
        { value: 'pending', label: 'Pendente', icon: <Clock className="w-4 h-4" /> },
        { value: 'paid', label: 'Pago', icon: <CheckCircle className="w-4 h-4" /> },
        { value: 'processing', label: 'Processando', icon: <Package className="w-4 h-4" /> },
        { value: 'shipped', label: 'Enviado', icon: <Truck className="w-4 h-4" /> },
        { value: 'delivered', label: 'Entregue', icon: <CheckCircle className="w-4 h-4" /> },
        { value: 'cancelled', label: 'Cancelado', icon: <AlertCircle className="w-4 h-4" /> },
    ];

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white dark:bg-[#0b1120] w-full max-w-2xl h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 dark:text-white flex items-center gap-3">
                            Pedido <span className="text-primary">#{order.orderNumber}</span>
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Realizado em {formatDate(order.createdAt)} às {new Date(order.createdAt).toLocaleTimeString('pt-AO')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-400" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8">

                    {/* Status Management */}
                    <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-100 dark:border-white/5">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Gestão de Status</h3>
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="relative flex-1 min-w-[200px]">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full appearance-none bg-white dark:bg-surface-dark border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none focus:border-primary transition-all"
                                >
                                    {statuses.map((s) => (
                                        <option key={s.value} value={s.value}>{s.label}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                            <button
                                onClick={handleStatusUpdate}
                                disabled={isUpdating || status === order.status}
                                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark disabled:opacity-50 disabled:hover:scale-100 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95"
                            >
                                {isUpdating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span>Atualizar Status</span>
                            </button>
                        </div>
                    </div>

                    {/* Customer & Shipping Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Customer Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-4 h-4 text-primary" /> Cliente
                            </h3>
                            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl space-y-2">
                                <p className="font-bold text-gray-900 dark:text-white">{order.shippingAddress.name}</p>
                                <p className="text-sm text-gray-500">{order.guestEmail || "Cliente Registrado"}</p>
                                <p className="text-sm text-gray-500">{order.shippingAddress.phone}</p>
                                {order.shippingAddress.nif && (
                                    <p className="text-sm text-gray-400 pt-2 border-t border-gray-100 dark:border-white/5">NIF: {order.shippingAddress.nif}</p>
                                )}
                            </div>
                        </div>

                        {/* Shipping Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" /> Entrega
                            </h3>
                            <div className="bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-4 rounded-xl space-y-1">
                                <p className="text-sm font-bold text-gray-900 dark:text-white">{order.shippingAddress.city}</p>
                                <p className="text-sm text-gray-500">{order.shippingAddress.address}</p>
                                {order.shippingAddress.reference && (
                                    <p className="text-xs text-gray-400 italic">Ref: {order.shippingAddress.reference}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Package className="w-4 h-4 text-primary" /> Carrinho ({order.items.length})
                        </h3>
                        <div className="space-y-3">
                            {order.items.map((item: any, idx: number) => (
                                <div key={idx} className="flex items-center gap-4 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 p-3 rounded-2xl hover:border-primary/20 transition-all">
                                    <div className="relative h-16 w-16 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" unoptimized />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{item.name}</p>
                                        <p className="text-xs text-gray-500">{item.quantity}x {formatCurrency(item.price)}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">
                                            {formatCurrency(item.price * item.quantity)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Payment Summary */}
                    <div className="bg-gray-900 text-white rounded-[2rem] p-8 space-y-4">
                        <div className="flex items-center justify-between text-gray-400 text-sm">
                            <span className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Pagamento</span>
                            <span className="font-bold text-white uppercase tracking-widest">{order.paymentMethod}</span>
                        </div>
                        <div className="space-y-2 pt-4 border-t border-white/10 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-400">Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-400">Entrega</span>
                                <span>{formatCurrency(order.shipping)}</span>
                            </div>
                            <div className="flex justify-between pt-4 border-t border-white/10">
                                <span className="text-lg font-bold">Total</span>
                                <span className="text-2xl font-black text-primary">{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Footer sticky info */}
                <div className="p-4 bg-gray-50 dark:bg-white/5 text-center text-[10px] text-gray-400 uppercase tracking-[0.2em]">
                    Vitaleevo Admin • ID do Sistema: {order._id}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
