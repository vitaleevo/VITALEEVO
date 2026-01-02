"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FeatureLayout from "@/shared/components/FeatureLayout";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function LoginPage() {
    const { login, isLoading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");
        clearError();

        if (!email || !password) {
            setLocalError("Preencha todos os campos");
            return;
        }

        try {
            await login(email, password);
            toast.success("Login realizado com sucesso!");
            router.push("/");
        } catch (err: any) {
            const message = err.message || "Erro ao fazer login";
            setLocalError(message);
            toast.error(message);
        }
    };

    const displayError = localError || error;

    return (
        <FeatureLayout>
            <div className="min-h-screen pt-32 pb-24 bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-[#0b1120] dark:via-[#0f172a] dark:to-primary/10">
                <div className="max-w-md mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
                            Bem-vindo de volta
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Entre com suas credenciais para acessar sua conta
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {displayError && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, height: 0 }}
                                    animate={{ opacity: 1, y: 0, height: "auto" }}
                                    exit={{ opacity: 0, y: -20, height: 0 }}
                                    className="mb-8 overflow-hidden"
                                >
                                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-red-600 dark:text-red-400">
                                                Dados incorretos
                                            </p>
                                            <p className="text-xs text-red-500/80 dark:text-red-400/80 leading-relaxed">
                                                {displayError}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    E-mail
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full h-14 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <div className="text-right mt-2">
                                    <Link
                                        href="/esqueci-senha"
                                        className="text-xs font-bold text-primary hover:underline"
                                    >
                                        Esqueceu a senha?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-14 bg-primary hover:bg-primary-dark disabled:bg-primary/50 text-white rounded-xl font-bold text-lg shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 group"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Entrando...
                                    </>
                                ) : (
                                    <>
                                        Entrar
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Não tem uma conta?{" "}
                                <Link href="/cadastro" className="text-primary font-bold hover:underline">
                                    Criar conta
                                </Link>
                            </p>
                        </div>
                    </div>

                    {/* Back to Home */}
                    <div className="mt-8 text-center">
                        <Link href="/" className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                            ← Voltar para o início
                        </Link>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
