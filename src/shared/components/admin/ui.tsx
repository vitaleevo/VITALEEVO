"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";
import { Loader2, UploadCloud, X, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/shared/utils/apiClient";
import { useAuth } from "@/shared/providers/AuthProvider";

// ── Cabeçalho de página ──────────────────────────────────────────────────
export function AdminHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
    return (
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
                <h1 className="font-display text-2xl font-black text-gray-900 dark:text-white">{title}</h1>
                {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

// ── Cartão ───────────────────────────────────────────────────────────────
export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

// ── Modal genérico ───────────────────────────────────────────────────────
export function Modal({ isOpen, onClose, title, children, wide = false }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className={`bg-white dark:bg-[#151e32] w-full ${wide ? "max-w-3xl" : "max-w-lg"} max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border border-gray-100 dark:border-white/5 animate-in fade-in zoom-in-95 duration-200`}>
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
                    <h3 className="font-bold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

// ── Campos de formulário ─────────────────────────────────────────────────
export function Field({ label, children, required = false }: { label: string; children: React.ReactNode; required?: boolean }) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {label} {required && <span className="text-red-500">*</span>}
            </span>
            {children}
        </label>
    );
}

export const inputClass =
    "w-full rounded-xl bg-gray-50 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 px-4 py-2.5 text-sm text-gray-900 dark:text-white outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all";

export function TextArea({ rows = 4, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
    return <textarea rows={rows} {...props} className={`${inputClass} resize-y`} />;
}

export function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
    return (
        <select {...props} className={`${inputClass} appearance-none`}>
            {children}
        </select>
    );
}

// ── Badge de estado ──────────────────────────────────────────────────────
const STATUS_COLORS: Record<string, string> = {
    published: "text-green-600 bg-green-500/10",
    draft: "text-gray-500 bg-gray-500/10",
    archived: "text-orange-500 bg-orange-500/10",
    pending: "text-yellow-500 bg-yellow-500/10",
    paid: "text-blue-500 bg-blue-500/10",
    processing: "text-purple-500 bg-purple-500/10",
    shipped: "text-indigo-500 bg-indigo-500/10",
    delivered: "text-green-500 bg-green-500/10",
    cancelled: "text-red-500 bg-red-500/10",
    new: "text-blue-500 bg-blue-500/10",
    in_review: "text-purple-500 bg-purple-500/10",
    proposal_sent: "text-indigo-500 bg-indigo-500/10",
    accepted: "text-green-500 bg-green-500/10",
    fulfilled: "text-emerald-500 bg-emerald-500/10",
    rejected: "text-red-500 bg-red-500/10",
};

export function Badge({ value }: { value?: string | null }) {
    const text = value ?? "—";
    const color = STATUS_COLORS[text] ?? "text-gray-500 bg-gray-500/10";
    return <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold capitalize ${color}`}>{text.replace(/_/g, " ")}</span>;
}

// ── Estados de carregamento / vazio ──────────────────────────────────────
export function Loading({ label = "A carregar..." }: { label?: string }) {
    return (
        <div className="flex items-center justify-center gap-3 py-16 text-gray-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm">{label}</span>
        </div>
    );
}

export function Empty({ label = "Sem registos" }: { label?: string }) {
    return <div className="py-16 text-center text-sm text-gray-400">{label}</div>;
}

export function ErrorBox({ message }: { message: string }) {
    return <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-600 text-sm">{message}</div>;
}

// ── Tabela ───────────────────────────────────────────────────────────────
export function Table({ headers, children }: { headers: string[]; children: React.ReactNode }) {
    return (
        <Card className="overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-100 dark:border-white/5 text-left text-xs uppercase tracking-wider text-gray-400">
                            {headers.map(h => (
                                <th key={h} className="px-4 py-3 font-bold">{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-white/5">{children}</tbody>
                </table>
            </div>
        </Card>
    );
}

export function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return <td className={`px-4 py-3 text-gray-700 dark:text-gray-300 ${className}`}>{children}</td>;
}

// ── Upload de imagem (media backend) ─────────────────────────────────────
export function ImageUpload({ value, onChange, label = "Imagem" }: { value: string; onChange: (url: string) => void; label?: string }) {
    const { token } = useAuth();
    const fileRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [showUrlInput, setShowUrlInput] = useState(false);

    const handleFile = async (file: File) => {
        if (!token) {
            toast.error("Sessão expirada. Inicie sessão novamente.");
            return;
        }
        setUploading(true);
        try {
            const res = await api.media.upload(file, token);
            onChange(res.url);
            toast.success("Imagem carregada com sucesso");
        } catch (err: any) {
            console.error("Upload falhou:", err);
            toast.error(err?.message || "Falha ao carregar imagem. Verifique o formato e tamanho.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center gap-4">
                <div className="relative h-20 w-20 rounded-xl overflow-hidden bg-gray-100 dark:bg-[#0f172a] border border-gray-200 dark:border-white/10 shrink-0">
                    {value ? (
                        <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={value} alt="" className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => onChange("")}
                                className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors z-10"
                                title="Remover imagem"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600">
                            <UploadCloud className="w-6 h-6" />
                        </div>
                    )}
                </div>
                <div className="flex-1 space-y-1.5">
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={e => {
                            const f = e.target.files?.[0];
                            if (f) handleFile(f);
                            e.target.value = "";
                        }}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                        <button
                            type="button"
                            disabled={uploading}
                            onClick={() => fileRef.current?.click()}
                            className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-white/10 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-200 hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
                        >
                            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : <UploadCloud className="w-4 h-4 text-primary" />}
                            {uploading ? "A carregar..." : label}
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowUrlInput(s => !s)}
                            className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                            <LinkIcon className="w-3.5 h-3.5" />
                            {showUrlInput ? "Ocultar URL" : "Inserir link direto"}
                        </button>
                    </div>
                    {value && !showUrlInput && <p className="text-[10px] text-gray-400 break-all">{value}</p>}
                </div>
            </div>
            {showUrlInput && (
                <div className="mt-2">
                    <input
                        type="url"
                        placeholder="https://exemplo.com/imagem.jpg"
                        value={value || ""}
                        onChange={e => onChange(e.target.value)}
                        className={inputClass}
                    />
                </div>
            )}
        </div>
    );
}