"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { useRouter } from "next/navigation";
import Link from "next/link";
import FeatureLayout from "@/shared/components/FeatureLayout";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowRight, UserPlus, User, Phone } from "lucide-react";
import { toast } from "sonner";

export default function CadastroPage() {
    const { register, isLoading, error, clearError, isAuthenticated } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [localError, setLocalError] = useState("");

    // Redirect if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            router.push("/");
        }
    }, [isAuthenticated, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLocalError("");
        clearError();

        if (!formData.name || !formData.email || !formData.password) {
            setLocalError("Preencha todos os campos obrigatórios");
            return;
        }

        if (formData.password.length < 6) {
            setLocalError("A senha deve ter pelo menos 6 caracteres");
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setLocalError("As senhas não coincidem");
            return;
        }

        try {
            await register(formData.email, formData.password, formData.name, formData.phone || undefined);
            toast.success("Conta criada com sucesso!");
            router.push("/");
        } catch (err: any) {
            const message = err.message || "Erro ao criar conta";
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
                            <UserPlus className="w-10 h-10 text-primary" />
                        </div>
                        <h1 className="font-display font-black text-3xl md:text-4xl text-gray-900 dark:text-white mb-3">
                            Criar Conta
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400">
                            Junte-se à VitalEvo e tenha acesso exclusivo
                        </p>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white dark:bg-[#151e32] rounded-3xl p-8 shadow-2xl border border-gray-100 dark:border-white/5">
                        {displayError && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-medium border border-red-100 dark:border-red-900/30">
                                {displayError}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Nome Completo *
                                </label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Seu nome"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    E-mail *
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="seu@email.com"
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Telefone / WhatsApp
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="+244 9XX XXX XXX"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Senha *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-12 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Confirmar Senha *
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full h-14 pl-12 pr-4 rounded-xl bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                        placeholder="Repita a senha"
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
                                        Criando conta...
                                    </>
                                ) : (
                                    <>
                                        Criar Conta
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/5 text-center">
                            <p className="text-gray-500 dark:text-gray-400 text-sm">
                                Já tem uma conta?{" "}
                                <Link href="/login" className="text-primary font-bold hover:underline">
                                    Fazer login
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
