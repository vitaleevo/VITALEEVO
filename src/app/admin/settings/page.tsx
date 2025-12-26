"use client";

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Settings,
    Globe,
    Phone,
    Mail,
    MapPin,
    Share2,
    Briefcase,
    Save,
    Loader2,
    CheckCircle2,
    AlertTriangle,
    Instagram,
    Facebook,
    Linkedin,
    Twitter,
    Truck
} from "lucide-react";

export default function SettingsAdmin() {
    const settings = useQuery(api.settings.get);
    const updateSettings = useMutation(api.settings.update);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [form, setForm] = useState<any>(null);

    useEffect(() => {
        if (settings) {
            setForm(settings);
        }
    }, [settings]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            // Remove metadata fields that are not in the mutation validator
            const { _id, _creationTime, key, updatedAt, ...updateData } = form;
            await updateSettings(updateData);
            setMessage({ type: 'success', text: "Configurações salvas!" });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({ type: 'error', text: "Erro ao salvar: " + err.message });
        } finally {
            setSaving(false);
        }
    };

    if (!form) return <div className="p-8 text-center font-bold text-gray-400">A carregar configurações...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Definições Globais
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 font-medium">
                        Configure a identidade e os parâmetros do seu negócio.
                    </p>
                </div>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in zoom-in-95 duration-300 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/10 dark:border-green-900/20' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/10 dark:border-red-900/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <AlertTriangle className="w-5 h-5 text-red-500" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
                {/* Identidade do Site */}
                <div className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-primary" />
                        Identidade do Site
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome da Marca</label>
                            <input
                                required
                                value={form.siteName}
                                onChange={e => setForm({ ...form, siteName: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Descrição Curta (SEO)</label>
                            <input
                                value={form.siteDescription}
                                onChange={e => setForm({ ...form, siteDescription: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Contactos e WhatsApp */}
                <div className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Phone className="w-5 h-5 text-green-500" />
                        Contactos e Suporte
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 leading-none">E-mail de Suporte</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    type="email"
                                    value={form.contactEmail}
                                    onChange={e => setForm({ ...form, contactEmail: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Telefone Principal</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    value={form.contactPhone}
                                    onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Número WhatsApp (Link Direto)</label>
                            <input
                                required
                                placeholder="2449XXXXXXXX"
                                value={form.whatsapp}
                                onChange={e => setForm({ ...form, whatsapp: e.target.value })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Morada Escrtitório</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    required
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Parâmetros do Negócio */}
                <div className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-orange-500" />
                        Parâmetros do Negócio
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Truck className="w-3 h-3" /> Taxa de Entrega
                            </label>
                            <input
                                type="number"
                                value={form.businessConfig.shippingFee}
                                onChange={e => setForm({ ...form, businessConfig: { ...form.businessConfig, shippingFee: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Frete Grátis acima de</label>
                            <input
                                type="number"
                                value={form.businessConfig.minOrderForFreeShipping || ""}
                                onChange={e => setForm({ ...form, businessConfig: { ...form.businessConfig, minOrderForFreeShipping: Number(e.target.value) } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Modo Manutenção</label>
                            <div className="flex items-center h-12">
                                <button
                                    type="button"
                                    onClick={() => setForm({ ...form, businessConfig: { ...form.businessConfig, maintenanceMode: !form.businessConfig.maintenanceMode } })}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${form.businessConfig.maintenanceMode ? 'bg-red-500' : 'bg-gray-200 dark:bg-white/10'}`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${form.businessConfig.maintenanceMode ? 'translate-x-5' : 'translate-x-0'}`} />
                                </button>
                                <span className="ml-3 text-sm font-bold text-gray-500">{form.businessConfig.maintenanceMode ? "Ativado" : "Desativado"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Redes Sociais */}
                <div className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm">
                    <h2 className="text-lg font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                        <Share2 className="w-5 h-5 text-blue-500" />
                        Redes Sociais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Instagram className="w-3.5 h-3.5" /> Instagram
                            </label>
                            <input
                                placeholder="https://instagram.com/..."
                                value={form.socialLinks.instagram || ""}
                                onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, instagram: e.target.value } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Facebook className="w-3.5 h-3.5" /> Facebook
                            </label>
                            <input
                                placeholder="https://facebook.com/..."
                                value={form.socialLinks.facebook || ""}
                                onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, facebook: e.target.value } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                            </label>
                            <input
                                placeholder="https://linkedin.com/..."
                                value={form.socialLinks.linkedin || ""}
                                onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, linkedin: e.target.value } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Twitter className="w-3.5 h-3.5" /> Twitter (X)
                            </label>
                            <input
                                placeholder="https://twitter.com/..."
                                value={form.socialLinks.twitter || ""}
                                onChange={e => setForm({ ...form, socialLinks: { ...form.socialLinks, twitter: e.target.value } })}
                                className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Acção de Salvar Fixo */}
                <div className="fixed bottom-8 right-8 z-50">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-primary hover:bg-primary-dark text-white px-10 py-5 rounded-[24px] font-black flex items-center gap-3 shadow-[0_20px_40px_rgba(var(--primary-rgb),0.3)] transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    >
                        {saving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                        Publicar Alterações Site
                    </button>
                </div>
            </form>
        </div>
    );
}
