"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useAction } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { MessageSquare, X, Send, Loader2, Bot } from 'lucide-react';

// Simple type for chat messages
type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

export const AIChatWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Olá! Sou a IA da VitalEvo. Como posso ajudar o seu negócio a crescer hoje?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Convex Action
    const sendMessageToOpenAI = useAction(api.ai.chat);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');

        // Add user message to UI
        const newMessages = [...messages, { role: 'user', content: userMessage } as Message];
        setMessages(newMessages);
        setIsLoading(true);

        try {
            // Call Backend
            const response = await sendMessageToOpenAI({
                message: userMessage,
                // Send last 10 messages as history context (excluding the just added one for simplicity in UI sync, but better to include all valid ones)
                // Filtering out 'system' if purely UI, but here we keep roles.
                history: messages.slice(-6)
            });

            if (response) {
                setMessages([...newMessages, { role: 'assistant', content: response }]);
            }
        } catch (error) {
            console.error("Erro no chat:", error);
            setMessages([...newMessages, { role: 'assistant', content: 'Desculpe, estou com dificuldades de conexão no momento. Pode tentar novamente?' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Chat Window */}
            {isOpen && (
                <div className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-white/10 flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="bg-primary p-4 flex items-center justify-between text-white">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-full">
                                <Bot className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm">VitalEvo AI</h3>
                                <div className="flex items-center gap-1.5 opacity-80">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                    <span className="text-xs">Online</span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950/50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`
                                        max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm
                                        ${msg.role === 'user'
                                            ? 'bg-primary text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-white/5'}
                                    `}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-none px-4 py-3 border border-gray-100 dark:border-white/5 flex items-center gap-2">
                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                    <span className="text-xs text-gray-400">Digitando...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form onSubmit={handleSubmit} className="p-4 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Digite sua mensagem..."
                                className="w-full pl-4 pr-12 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isLoading}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                        <p className="text-[10px] text-center text-gray-400 mt-2">
                            A IA pode cometer erros. Recomenda-se verificação humana para informações críticas.
                        </p>
                    </form>
                </div>
            )}

            {/* Float Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 bg-primary rounded-full shadow-lg hover:shadow-primary/50 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 group"
                >
                    <MessageSquare className="w-7 h-7 group-hover:hidden" />
                    <Bot className="w-7 h-7 hidden group-hover:block" />

                    {/* Notification Badge */}
                    <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
                </button>
            )}
        </div>
    );
};
