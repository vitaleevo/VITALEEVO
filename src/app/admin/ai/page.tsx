"use client";

import React, { useState } from "react";
import { Send, Bot, User as UserIcon, AlertTriangle } from "lucide-react";
import { api } from "@/shared/utils/apiClient";
import { AdminHeader, Card, Loading } from "@/shared/components/admin/ui";

type Msg = { role: "user" | "assistant"; content: string };

export default function AdminAiPage() {
    const [messages, setMessages] = useState<Msg[]>([]);
    const [input, setInput] = useState("");
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const send = async () => {
        const text = input.trim();
        if (!text || sending) return;
        const history = messages.map(m => ({ role: m.role, content: m.content }));
        setMessages(msgs => [...msgs, { role: "user", content: text }]);
        setInput("");
        setSending(true);
        setError(null);
        try {
            const { reply } = await api.ai.chat(text, history);
            setMessages(msgs => [...msgs, { role: "assistant", content: reply }]);
        } catch (err: any) {
            const msg = err?.message || "Falha na resposta";
            setError(msg);
            setMessages(msgs => [...msgs, { role: "assistant", content: `⚠ ${msg}` }]);
        } finally {
            setSending(false);
        }
    };

    return (
        <div>
            <AdminHeader title="Assistente IA" subtitle="Teste do endpoint /ai/chat (OpenAI)" />

            {error && (
                <div className="mb-6 flex items-center gap-2 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/20 px-4 py-3 text-sm font-bold text-yellow-700 dark:text-yellow-400">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    {error === "IA não configurada" ? "OPENAI_API_KEY não definida no servidor — o endpoint devolve 503." : error}
                </div>
            )}

            <Card className="p-6 max-w-3xl">
                <div className="space-y-4 min-h-72 max-h-[28rem] overflow-y-auto mb-6">
                    {!messages.length && (
                        <p className="text-center text-sm text-gray-400 pt-16">
                            Escreva uma mensagem para testar o assistente.
                        </p>
                    )}
                    {messages.map((m, i) => (
                        <div key={i} className={`flex gap-3 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                            {m.role === "assistant" && (
                                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                    <Bot className="w-4 h-4 text-primary" />
                                </div>
                            )}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                                m.role === "user"
                                    ? "bg-primary text-white rounded-br-sm"
                                    : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-200 rounded-bl-sm"
                            }`}>
                                {m.content}
                            </div>
                            {m.role === "user" && (
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center shrink-0">
                                    <UserIcon className="w-4 h-4 text-gray-400" />
                                </div>
                            )}
                        </div>
                    ))}
                    {sending && (
                        <div className="flex justify-start">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                                <Bot className="w-4 h-4 text-primary" />
                            </div>
                            <div className="rounded-2xl bg-gray-100 dark:bg-white/5 px-4 py-3 ml-3"><Loading /></div>
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => { if (e.key === "Enter") send(); }}
                        placeholder="Pergunte algo sobre a VitalEvo..."
                        className="flex-1 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-black/20 px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
                    />
                    <button
                        onClick={send}
                        disabled={!input.trim() || sending}
                        className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary-dark disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-4 h-4" /> Enviar
                    </button>
                </div>
            </Card>
        </div>
    );
}