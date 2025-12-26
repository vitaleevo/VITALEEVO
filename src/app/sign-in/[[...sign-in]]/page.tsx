"use client";

import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden bg-[#0b1120]">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-[20000ms] animate-slow-zoom"
                style={{ backgroundImage: "url('/login-bg.png')" }}
            />
            <div className="absolute inset-0 z-10 bg-gradient-to-br from-[#0b1120]/95 via-[#0b1120]/80 to-primary/30 backdrop-blur-[1px]" />

            {/* Floating Glows */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[120px] animate-pulse-slow" style={{ animationDelay: '2s' }} />

            {/* Back Button */}
            <Link
                href="/"
                className="absolute top-8 left-8 z-20 flex items-center gap-2 text-white/70 hover:text-white transition-all group px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 shadow-lg"
            >
                <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                <span className="font-medium text-sm">Voltar ao Início</span>
            </Link>

            <div className="relative z-20 w-full max-w-md animate-fade-in-up">
                {/* Branding */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-white text-[10px] font-bold uppercase tracking-[0.2em] mb-4 shadow-inner shadow-primary/20">
                        VitalEvo Digital Ecosystem
                    </div>
                    <h1 className="text-4xl md:text-5xl font-display font-black text-white mb-3 tracking-tight">
                        Bem-vindo de <span className="text-primary drop-shadow-[0_0_15px_rgba(134,37,210,0.5)]">Volta</span>
                    </h1>
                    <p className="text-gray-400 font-light text-base">
                        Acesse sua conta para continuar sua jornada digital conosco.
                    </p>
                </div>

                {/* Clerk SignIn Container */}
                <div className="relative group perspective-1000">
                    {/* Animated Glow Border */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary via-purple-500 to-secondary rounded-[2.5rem] blur-xl opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-500 animate-pulse" />

                    <div className="relative transform-gpu transition-all duration-500 group-hover:scale-[1.01]">
                        <SignIn
                            appearance={{
                                elements: {
                                    rootBox: "w-full",
                                    card: "bg-surface-dark/40 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] rounded-[2.5rem] border border-white/10 overflow-hidden",
                                    headerTitle: "hidden",
                                    headerSubtitle: "hidden",
                                    socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 text-white transition-all duration-300 py-3 rounded-xl",
                                    socialButtonsBlockButtonText: "text-white font-semibold text-sm",
                                    socialButtonsProviderIcon: "w-5 h-5",
                                    formButtonPrimary: "bg-primary hover:bg-primary/90 text-white font-black text-base py-3 transition-all duration-300 shadow-[0_10px_30px_-10px_rgba(134,37,210,0.6)] rounded-xl uppercase tracking-wider",
                                    formFieldInput: "bg-white/5 border-white/10 text-white rounded-xl py-3 focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all",
                                    formFieldLabel: "text-gray-300 font-medium text-xs uppercase tracking-widest mb-1.5",
                                    footerActionLink: "text-primary hover:text-primary-light font-black transition-colors",
                                    dividerLine: "bg-white/10",
                                    dividerText: "text-gray-500 font-bold text-[10px] uppercase",
                                    formResendCodeLink: "text-primary hover:text-primary-light font-bold",
                                    footer: "bg-transparent",
                                    identityPreviewText: "text-white font-medium",
                                    identityPreviewEditButtonIcon: "text-white",
                                    formFieldSuccessText: "text-secondary",
                                    formFieldErrorText: "text-red-400 text-xs font-medium",
                                    alertText: "text-white text-xs",
                                },
                            }}
                            path="/sign-in"
                            routing="path"
                            signUpUrl="/sign-up"
                            forceRedirectUrl="/account"
                        />
                    </div>
                </div>

                {/* Bottom Links/Info */}
                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="h-px w-12 bg-white/10" />
                    <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-medium">
                        © {new Date().getFullYear()} VitalEvo Technology Group
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes slow-zoom {
                    0%, 100% { transform: scale(1.05); }
                    50% { transform: scale(1.15) rotate(1deg); }
                }
                .animate-slow-zoom {
                    animation: slow-zoom 30s ease-in-out infinite;
                }
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
}
