"use client";

import { useState, useEffect, Suspense } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter, useSearchParams } from "next/navigation";
import FeatureLayout from "@/shared/components/FeatureLayout";
import { Lock, Eye, EyeOff, Loader2, ArrowRight, ShieldCheck, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { getErrorMessage } from "@/shared/utils/error-handler";

function RecuperarSenhaContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const resetPasswordMutation = useMutation(api.auth.resetPassword);

    useEffect(() => {
        if (!token) {
            toast.error("Token de recuperação ausente");
            router.push("/login");
        }
    }, [token, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password.length < 6) {
            toast.error("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("As senhas não coincidem");
            return;
        }

        if (!token) return;

        setIsLoading(true);
        try {
            await resetPasswordMutation({ token, newPassword: password });
            setIsSuccess(true);
            toast.success("Senha redefinida com sucesso!");

            setTimeout(() => {
                router.push("/login");
            }, 3000);
        } catch (err: any) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2">Sucesso!</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                    A sua senha foi alterada. Você será redirecionado para o login em instantes...
                </p>
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold"
                >
                    Fazer Login Agora
                </Link>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Nova Senha
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full h-14 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                    Confirmar Nova Senha
                </label>
                <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary outline-none transition-all"
                        placeholder="••••••••"
                        required
                    />
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
                        Redefinindo...
                    </>
                ) : (
                    <>
                        Redefinir Senha
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                )}
            </button>
        </form>
    );
}

export default function RecuperarSenhaPage() {
    return (
        <FeatureLayout>
            <div className="min-h-screen pt-32 pb-24 bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-[#0b1120] dark:via-[#0f172a] dark:to-primary/10">
                <div className="max-w-md mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
                            Nova Senha
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Crie uma nova senha de acesso para a sua conta
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <Suspense fallback={<div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>}>
                            <RecuperarSenhaContent />
                        </Suspense>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
