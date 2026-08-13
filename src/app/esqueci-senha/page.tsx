"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { sendPasswordResetEmail } from "../actions/contact";
import FeatureLayout from "@/shared/components/FeatureLayout";
import { Mail, Loader2, ArrowRight, ShieldCheck, CheckCircle, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import { getErrorMessage } from "@/shared/utils/error-handler";

export default function EsqueciSenhaPage() {
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);

    const requestReset = useMutation(api.auth.requestPasswordReset);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast.error("Por favor, insira o seu e-mail");
            return;
        }

        setIsLoading(true);
        try {
            const result = await requestReset({ email });

            // Send email via Server Action
            const emailResult = await sendPasswordResetEmail(email, result.name, result.resetToken);

            if (emailResult.success) {
                setIsSent(true);
                toast.success("E-mail de recuperação enviado!");
            } else {
                toast.error("Erro ao enviar e-mail. Tente novamente mais tarde.");
            }
        } catch (err: any) {
            toast.error(getErrorMessage(err));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <FeatureLayout>
            <div className="min-h-screen pt-32 pb-24 bg-gradient-to-br from-gray-50 via-white to-primary/5 dark:from-[#0b1120] dark:via-[#0f172a] dark:to-primary/10">
                <div className="max-w-md mx-auto px-4">
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                            <ShieldCheck className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
                            Recuperar Senha
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            {isSent
                                ? "Verifique a sua caixa de entrada para redefinir a senha"
                                : "Insira o seu e-mail para receber um link de recuperação"
                            }
                        </p>
                    </div>

                    <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-white/5 relative overflow-hidden">
                        <AnimatePresence mode="wait">
                            {isSent ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-center py-6"
                                >
                                    <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle className="w-8 h-8 text-green-500" />
                                    </div>
                                    <h2 className="font-bold text-xl text-gray-900 dark:text-white mb-2">E-mail Enviado!</h2>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">
                                        Enviamos as instruções para <strong>{email}</strong>. <br />
                                        Não esqueça de verificar a pasta de spam.
                                    </p>
                                    <Link
                                        href="/login"
                                        className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
                                    >
                                        Voltar para o Login
                                    </Link>
                                </motion.div>
                            ) : (
                                <form onSubmit={handleSubmit} className="space-y-6">
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
                                                Enviando...
                                            </>
                                        ) : (
                                            <>
                                                Enviar Link
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>

                                    <div className="text-center pt-2">
                                        <Link href="/login" className="text-gray-500 dark:text-gray-400 text-sm hover:text-primary transition-colors">
                                            Voltar para o login
                                        </Link>
                                    </div>
                                </form>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </FeatureLayout>
    );
}
