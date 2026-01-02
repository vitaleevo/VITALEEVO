"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useAuth } from "@/shared/providers/AuthProvider";
import { toast } from "sonner";
import { Key, Plus, Trash2, Power, PowerOff, Eye, EyeOff, Bot, Sparkles, Loader2, CheckCircle, XCircle } from "lucide-react";
import { Id } from "../../../../convex/_generated/dataModel";

const PROVIDERS = [
    { id: "gemini", name: "Google Gemini", icon: "✨", description: "Gemini Pro - Rápido e eficiente" },
    { id: "openai", name: "OpenAI", icon: "🤖", description: "GPT-3.5 Turbo - Modelo popular" },
    { id: "anthropic", name: "Anthropic Claude", icon: "🧠", description: "Claude Haiku - Seguro e preciso" },
    { id: "huggingface", name: "Hugging Face", icon: "🤗", description: "Modelos Open Source (Mistral, Llama)" },
];

export default function AdminAIPage() {
    const { token } = useAuth();
    const apiKeys = useQuery(api.apiKeys.getAllAdmin, token ? { token: token } : "skip");
    const upsertKey = useMutation(api.apiKeys.upsert);
    const deleteKey = useMutation(api.apiKeys.remove);
    const toggleActive = useMutation(api.apiKeys.toggleActive);

    const [showForm, setShowForm] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState("");
    const [apiKeyInput, setApiKeyInput] = useState("");
    const [labelInput, setLabelInput] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token || !selectedProvider || !apiKeyInput) return;

        setIsSubmitting(true);
        try {
            await upsertKey({
                token: token,
                provider: selectedProvider,
                apiKey: apiKeyInput,
                label: labelInput || undefined,
                isActive: true,
            });
            toast.success("API conectada com sucesso!");
            setShowForm(false);
            setSelectedProvider("");
            setApiKeyInput("");
            setLabelInput("");
        } catch (error: any) {
            toast.error(error.message || "Erro ao conectar API");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: Id<"apiKeys">) => {
        if (!token) return;
        if (!confirm("Tem certeza que deseja remover esta chave?")) return;

        try {
            await deleteKey({ token: token, id });
            toast.success("Chave removida!");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const handleToggle = async (id: Id<"apiKeys">) => {
        if (!token) return;
        try {
            const result = await toggleActive({ token: token, id });
            toast.success(result.isActive ? "API ativada!" : "API desativada!");
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    const getProviderInfo = (providerId: string) => {
        return PROVIDERS.find(p => p.id === providerId) || { name: providerId, icon: "🔑", description: "" };
    };

    const hasActiveKey = apiKeys?.some(k => k.isActive);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <Bot className="w-7 h-7 text-primary" />
                        Integrações de IA
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Configure as APIs de inteligência artificial para o chatbot do site.
                    </p>
                </div>
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-medium"
                >
                    <Plus className="w-5 h-5" />
                    Conectar API
                </button>
            </div>

            {/* Status Card */}
            <div className={`p-6 rounded-2xl border ${hasActiveKey ? 'bg-green-50 dark:bg-green-500/10 border-green-200 dark:border-green-500/30' : 'bg-yellow-50 dark:bg-yellow-500/10 border-yellow-200 dark:border-yellow-500/30'}`}>
                <div className="flex items-center gap-4">
                    {hasActiveKey ? (
                        <CheckCircle className="w-10 h-10 text-green-600 dark:text-green-400" />
                    ) : (
                        <XCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-400" />
                    )}
                    <div>
                        <h3 className={`font-bold ${hasActiveKey ? 'text-green-800 dark:text-green-300' : 'text-yellow-800 dark:text-yellow-300'}`}>
                            {hasActiveKey ? "Chatbot Online" : "Chatbot Offline"}
                        </h3>
                        <p className={`text-sm ${hasActiveKey ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                            {hasActiveKey
                                ? "O assistente virtual está ativo e pronto para atender clientes."
                                : "Nenhuma API ativa. Configure uma chave para ativar o chatbot."}
                        </p>
                    </div>
                </div>
            </div>

            {/* API Keys List */}
            <div className="grid gap-4">
                {apiKeys === undefined ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : apiKeys.length === 0 ? (
                    <div className="text-center py-16 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                        <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300">Nenhuma API configurada</h3>
                        <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Clique em "Conectar API" para começar.</p>
                    </div>
                ) : (
                    apiKeys.map((key) => {
                        const provider = getProviderInfo(key.provider);
                        return (
                            <div
                                key={key._id}
                                className={`p-5 bg-white dark:bg-gray-800 rounded-2xl border ${key.isActive ? 'border-green-300 dark:border-green-500/50' : 'border-gray-200 dark:border-gray-700'} shadow-sm`}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${key.isActive ? 'bg-green-100 dark:bg-green-500/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                                            {provider.icon}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                                {provider.name}
                                                {key.isActive && (
                                                    <span className="px-2 py-0.5 bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 text-xs rounded-full font-medium">
                                                        Ativo
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {key.label || provider.description}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <code className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded font-mono text-gray-600 dark:text-gray-300">
                                                    {showKeys[key._id] ? key.fullKey : key.apiKey}
                                                </code>
                                                <button
                                                    onClick={() => setShowKeys(prev => ({ ...prev, [key._id]: !prev[key._id] }))}
                                                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                                                >
                                                    {showKeys[key._id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleToggle(key._id)}
                                            className={`p-2 rounded-lg transition-colors ${key.isActive ? 'bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 hover:bg-green-200' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                                            title={key.isActive ? "Desativar" : "Ativar"}
                                        >
                                            {key.isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                                        </button>
                                        <button
                                            onClick={() => handleDelete(key._id)}
                                            className="p-2 bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-500/30 transition-colors"
                                            title="Remover"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Add API Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary/10 rounded-xl">
                                <Sparkles className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Conectar API</h2>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Adicione uma nova integração de IA</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Provider Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Provedor
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {PROVIDERS.map((p) => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => setSelectedProvider(p.id)}
                                            className={`p-3 rounded-xl border-2 text-center transition-all ${selectedProvider === p.id ? 'border-primary bg-primary/5' : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'}`}
                                        >
                                            <span className="text-2xl block mb-1">{p.icon}</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{p.name.split(' ')[0]}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* API Key Input */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Chave de API
                                </label>
                                <input
                                    type="password"
                                    value={apiKeyInput}
                                    onChange={(e) => setApiKeyInput(e.target.value)}
                                    placeholder="sk-... ou AIza..."
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                    required
                                />
                            </div>

                            {/* Label (Optional) */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nome (opcional)
                                </label>
                                <input
                                    type="text"
                                    value={labelInput}
                                    onChange={(e) => setLabelInput(e.target.value)}
                                    placeholder="Ex: Chave de Produção"
                                    className="w-full px-4 py-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                                />
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all font-medium"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !selectedProvider || !apiKeyInput}
                                    className="flex-1 px-4 py-3 bg-primary text-white rounded-xl hover:bg-primary-dark transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Conectando...
                                        </>
                                    ) : (
                                        <>
                                            <Power className="w-5 h-5" />
                                            Conectar
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
