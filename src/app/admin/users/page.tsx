"use client";

import React, { useState } from 'react';
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import {
    Users,
    Search,
    Plus,
    MoreVertical,
    Mail,
    Phone,
    UserPlus,
    X,
    Save,
    Trash2,
    Shield,
    CheckCircle2,
    XCircle,
    Key,
    Loader2
} from "lucide-react";
import { formatDate } from "@/shared/utils/format";

export default function UsersAdmin() {
    const users = useQuery(api.auth.getAllAdmin);
    const adminCreateUser = useMutation(api.auth.adminCreateUser);
    const adminUpdateUser = useMutation(api.auth.adminUpdateUser);
    const adminResetPassword = useMutation(api.auth.adminResetPassword);

    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "user"
    });

    const [passwordForm, setPasswordForm] = useState({
        userId: "",
        newPassword: ""
    });

    const filteredUsers = users?.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenCreate = () => {
        setEditingUser(null);
        setForm({ name: "", email: "", phone: "", password: "", role: "user" });
        setIsModalOpen(true);
    };

    const handleOpenEdit = (user: any) => {
        setEditingUser(user);
        setForm({
            name: user.name,
            email: user.email,
            phone: user.phone || "",
            password: "",
            role: user.role
        });
        setIsModalOpen(true);
    };

    const handleOpenResetPassword = (userId: string) => {
        setPasswordForm({ userId, newPassword: "" });
        setIsPasswordModalOpen(true);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            if (editingUser) {
                await adminUpdateUser({
                    userId: editingUser._id,
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    role: form.role
                });
                setMessage({ type: 'success', text: "Usuário atualizado!" });
            } else {
                await adminCreateUser({
                    name: form.name,
                    email: form.email,
                    password: form.password,
                    phone: form.phone,
                    role: form.role
                });
                setMessage({ type: 'success', text: "Usuário criado!" });
            }
            setIsModalOpen(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Erro ao salvar" });
        } finally {
            setSaving(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await adminResetPassword({
                userId: passwordForm.userId as any,
                newPassword: passwordForm.newPassword
            });
            setMessage({ type: 'success', text: "Senha alterada!" });
            setIsPasswordModalOpen(false);
        } catch (err: any) {
            setMessage({ type: 'error', text: err.message || "Erro ao resetar" });
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (user: any) => {
        try {
            await adminUpdateUser({
                userId: user._id,
                isActive: !user.isActive
            });
            setMessage({ type: 'success', text: "Status alterado!" });
        } catch (err) {
            setMessage({ type: 'error', text: "Erro ao alterar status" });
        }
    };

    if (!users) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-primary" /></div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Utilizadores
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gere as contas e permissões do sistema.
                    </p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 shadow-lg shadow-primary/25 transition-all active:scale-95"
                >
                    <UserPlus className="w-5 h-5" />
                    Novo Utilizador
                </button>
            </div>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${message.type === 'success' ? 'bg-green-100 text-green-700 dark:bg-green-900/20' : 'bg-red-100 text-red-700 dark:bg-red-900/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <span className="font-bold text-sm">{message.text}</span>
                    <button onClick={() => setMessage(null)} className="ml-auto"><X className="w-4 h-4" /></button>
                </div>
            )}

            <div className="bg-white dark:bg-[#151e32] rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-white/5">
                    <div className="relative max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Procurar por nome ou e-mail..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 h-12 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5">
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Utilizador</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contacto</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Função</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Criado em</th>
                                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                            {filteredUsers?.map((user) => (
                                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover rounded-xl" /> : user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </div>
                                            {user.phone && (
                                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                                    <Phone className="w-3 h-3" /> {user.phone}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                            }`}>
                                            <Shield className="w-3 h-3" />
                                            {user.role}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <button
                                            onClick={() => handleToggleStatus(user)}
                                            className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
                                                }`}
                                        >
                                            {user.isActive ? "Ativo" : "Bloqueado"}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleOpenResetPassword(user._id)}
                                                className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-500/10 rounded-lg transition-all"
                                                title="Resetar Senha"
                                            >
                                                <Key className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleOpenEdit(user)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                                                title="Editar"
                                            >
                                                <Plus className="w-4 h-4 rotate-45" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Create/Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#151e32] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/5">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                {editingUser ? "Editar Utilizador" : "Novo Utilizador"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-xl transition-all"><X className="w-5 h-5" /></button>
                        </div>
                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nome Completo</label>
                                    <input
                                        required
                                        type="text"
                                        value={form.name}
                                        onChange={e => setForm({ ...form, name: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">E-mail</label>
                                    <input
                                        required
                                        type="email"
                                        value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Telefone</label>
                                    <input
                                        type="text"
                                        value={form.phone}
                                        onChange={e => setForm({ ...form, phone: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold transition-all"
                                    />
                                </div>
                                {!editingUser && (
                                    <div>
                                        <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Senha Inicial</label>
                                        <input
                                            required
                                            type="password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold transition-all"
                                        />
                                    </div>
                                )}
                                <div>
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Função</label>
                                    <select
                                        value={form.role}
                                        onChange={e => setForm({ ...form, role: e.target.value })}
                                        className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold transition-all appearance-none"
                                    >
                                        <option value="user">Utilizador (Cliente)</option>
                                        <option value="admin">Administrador</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 h-12 rounded-xl font-bold bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    disabled={saving}
                                    type="submit"
                                    className="flex-1 h-12 rounded-xl font-bold bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 transition-all"
                                >
                                    {saving ? <Loader2 className="animate-spin w-5 h-5" /> : <Save className="w-5 h-5" />}
                                    {editingUser ? "Atualizar" : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Password Modal */}
            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white dark:bg-[#151e32] w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/5">
                            <h2 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Key className="w-5 h-5 text-yellow-500" />
                                Resetar Senha
                            </h2>
                        </div>
                        <form onSubmit={handleResetPassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Nova Senha</label>
                                <input
                                    required
                                    type="password"
                                    value={passwordForm.newPassword}
                                    onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                    placeholder="Mínimo 6 caracteres"
                                    className="w-full h-12 px-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-100 dark:border-white/10 outline-none focus:border-primary text-sm font-bold"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button type="button" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 h-12 text-sm font-bold text-gray-500">Voltar</button>
                                <button type="submit" disabled={saving} className="flex-1 h-12 bg-yellow-500 text-white font-bold rounded-xl shadow-lg shadow-yellow-500/20">
                                    {saving ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Confirmar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
