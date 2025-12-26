"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import {
    MessageSquare,
    Search,
    Trash2,
    Eye,
    Mail,
    Phone,
    Building2,
    Calendar,
    X,
    CheckCircle,
    User
} from "lucide-react";
import { useState } from "react";
import { formatDate } from "@/shared/utils/format";

export default function AdminContactsPage() {
    const messages = useQuery(api.contacts.getAll);
    const markAsRead = useMutation(api.contacts.markAsRead);
    const removeMessage = useMutation(api.contacts.remove);

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedMessage, setSelectedMessage] = useState<any>(null);

    if (!messages) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    const filteredMessages = messages.filter(msg =>
        msg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleViewMessage = async (msg: any) => {
        setSelectedMessage(msg);
        if (!msg.isRead) {
            await markAsRead({ id: msg._id, isRead: true });
        }
    };

    const handleDelete = async (id: Id<"contacts">) => {
        if (confirm("Tem certeza que deseja apagar esta mensagem?")) {
            await removeMessage({ id });
            if (selectedMessage?._id === id) {
                setSelectedMessage(null);
            }
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Mensagens
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Gerencie as mensagens recebidas pelo formulário de contato.
                    </p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">{messages.length}</p>
                            <p className="text-sm text-gray-500">Total de Mensagens</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white dark:bg-[#151e32] p-6 rounded-xl border border-gray-100 dark:border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-500/10 rounded-xl flex items-center justify-center">
                            <Mail className="w-6 h-6 text-yellow-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-gray-900 dark:text-white">
                                {messages.filter(m => !m.isRead).length}
                            </p>
                            <p className="text-sm text-gray-500">Não Lidas</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white dark:bg-[#151e32] p-4 rounded-xl border border-gray-100 dark:border-white/5">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Buscar por nome, email ou assunto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                </div>
            </div>

            {/* Messages List */}
            <div className="bg-white dark:bg-[#151e32] rounded-2xl border border-gray-100 dark:border-white/5 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50 dark:bg-white/5 border-b border-gray-200 dark:border-white/5">
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Status</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Remetente</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Assunto</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Data</th>
                                <th className="px-6 py-4 font-bold text-gray-500 text-xs uppercase tracking-wider text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {filteredMessages.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Nenhuma mensagem encontrada.
                                    </td>
                                </tr>
                            ) : (
                                filteredMessages.map((msg) => (
                                    <tr
                                        key={msg._id}
                                        className={`hover:bg-gray-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!msg.isRead ? 'bg-primary/5 dark:bg-primary/10' : ''}`}
                                        onClick={() => handleViewMessage(msg)}
                                    >
                                        <td className="px-6 py-4">
                                            {!msg.isRead ? (
                                                <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                                    Nova
                                                </span>
                                            ) : (
                                                <span className="text-xs font-bold text-gray-400">Lida</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-sm ${!msg.isRead ? 'font-black text-gray-900 dark:text-white' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                                                {msg.name}
                                            </p>
                                            <p className="text-xs text-gray-500">{msg.email}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className={`text-sm line-clamp-1 ${!msg.isRead ? 'font-bold text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>
                                                {msg.subject}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 text-xs text-gray-500">
                                            {formatDate(msg.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => handleViewMessage(msg)}
                                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 text-gray-500 hover:text-primary transition-colors"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(msg._id)}
                                                    className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-gray-500 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Message Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-[#151e32] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between bg-gray-50 dark:bg-white/5">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {selectedMessage.subject}
                                </h2>
                                <p className="text-sm text-gray-500">
                                    Enviado em {new Date(selectedMessage.createdAt).toLocaleString('pt-AO')}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-8 overflow-y-auto space-y-8">
                            {/* Sender Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <User className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Nome</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedMessage.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Mail className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Email</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedMessage.email}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Phone className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Telefone</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedMessage.phone || 'Não informado'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 text-gray-600 dark:text-gray-400">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-xs uppercase font-bold tracking-wider text-gray-400">Empresa</p>
                                            <p className="font-bold text-gray-900 dark:text-white">{selectedMessage.company || 'Não informado'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Message Content */}
                            <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/5">
                                <p className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-4">Mensagem</p>
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {selectedMessage.message}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 dark:border-white/5 flex justify-between bg-gray-50 dark:bg-white/5">
                            <button
                                onClick={() => handleDelete(selectedMessage._id)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                            >
                                <Trash2 className="w-5 h-5" />
                                Apagar Mensagem
                            </button>
                            <button
                                onClick={() => setSelectedMessage(null)}
                                className="bg-primary hover:bg-primary/90 text-white px-8 py-2.5 rounded-xl font-bold transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
