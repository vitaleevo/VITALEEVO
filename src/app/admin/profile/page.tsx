"use client";

import React, { useState } from 'react';
import { useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import {
    User,
    Mail,
    Phone,
    Key,
    Save,
    CheckCircle2,
    AlertTriangle,
    Loader2,
    Camera
} from "lucide-react";

export default function AdminProfile() {
    const { user, token } = useAuth();
    const updateProfile = useMutation(api.auth.updateProfile);
    const changePassword = useMutation(api.auth.changePassword);

    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        phone: user?.phone || "",
    });

    const [passForm, setPassForm] = useState({
        current: "",
        new: "",
        confirm: ""
    });

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await updateProfile({
                token: token!,
                name: profileForm.name,
                phone: profileForm.phone,
            });
            setMessage({ type: 'success', text: "Perfil atualizado!" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Erro ao atualizar" });
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passForm.new !== passForm.confirm) {
            setMessage({ type: 'error', text: "As novas senhas não coincidem" });
            return;
        }
        setSaving(true);
        setMessage(null);
        try {
            await changePassword({
                token: token!,
                currentPassword: passForm.current,
                newPassword: passForm.new,
            });
            setMessage({ type: 'success', text: "Senha alterada com sucesso!" });
            setPassForm({ current: "", new: "", confirm: "" });
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Senha atual incorreta" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div>
                <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                    Meu Perfil Admin
                </h1>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                    Gere os seus dados de acesso e informações pessoais.
                </p>
            </div>

            {message && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100 dark:bg-green-900/10' : 'bg-red-50 text-red-700 border border-red-100 dark:bg-red-900/10'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white">
                {/* Profile Card */}
                <div className="lg:col-span-2 space-y-6">
                    <form onSubmit={handleUpdateProfile} className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="relative group">
                                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-2xl">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </div>
                                <button className="absolute -bottom-2 -right-2 p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-white/10 text-gray-400 hover:text-primary transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 dark:text-white">{user?.name}</h3>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Nome Administrativo</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        required
                                        value={profileForm.name}
                                        onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Telemóvel</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        value={profileForm.phone}
                                        onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                                        className="w-full h-12 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary font-bold text-sm text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={saving}
                                className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {saving ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                                Atualizar Dados
                            </button>
                        </div>
                    </form>
                </div>

                {/* Password Section */}
                <div className="space-y-6">
                    <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#151e32] p-8 rounded-[32px] border border-gray-100 dark:border-white/5 shadow-sm space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Key className="w-5 h-5 text-yellow-500" />
                            <h3 className="font-black text-gray-900 dark:text-white text-sm uppercase tracking-widest">Segurança</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1">
                                <input
                                    required
                                    type="password"
                                    placeholder="Senha Atual"
                                    value={passForm.current}
                                    onChange={e => setPassForm({ ...passForm, current: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    required
                                    type="password"
                                    placeholder="Nova Senha"
                                    value={passForm.new}
                                    onChange={e => setPassForm({ ...passForm, new: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                            <div className="space-y-1">
                                <input
                                    required
                                    type="password"
                                    placeholder="Confirmar Nova Senha"
                                    value={passForm.confirm}
                                    onChange={e => setPassForm({ ...passForm, confirm: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={saving}
                            className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black dark:hover:bg-gray-100 transition-all active:scale-95 disabled:opacity-50"
                        >
                            Alterar Senha
                        </button>
                    </form>

                    <div className="p-6 bg-blue-50 dark:bg-blue-900/10 rounded-[28px] border border-blue-100 dark:border-blue-900/20">
                        <div className="flex gap-3">
                            <AlertTriangle className="w-5 h-5 text-blue-500 shrink-0" />
                            <p className="text-xs text-blue-700 dark:text-blue-400 font-medium leading-relaxed">
                                Lembre-se: Como administrador, as suas credenciais protegem todo o sistema. Use uma senha forte e única.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
