"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "@/shared/components/ThemeProvider";
import { ReactNode } from "react";

const clerkPtBR = {
    signIn: {
        start: {
            title: "Entrar na sua conta",
            subtitle: "Bem-vindo de volta! Faça login para continuar.",
            actionText: "Não tem uma conta?",
            actionLink: "Criar conta",
        },
    },
    signUp: {
        start: {
            title: "Criar sua conta",
            subtitle: "Junte-se a nós para ter acesso exclusivo.",
            actionText: "Já tem uma conta?",
            actionLink: "Fazer login",
        },
    },
    userButton: {
        action__manageAccount: "Gerenciar conta",
        action__signOut: "Sair",
    },
};

export function AuthProvider({ children }: { children: ReactNode }) {
    const { theme } = useTheme();
    const isDark = theme === "dark";

    return (
        <ClerkProvider
            appearance={{
                baseTheme: isDark ? dark : undefined,
                variables: {
                    colorPrimary: "#8625d2",
                    colorBackground: isDark ? "#151e32" : "#ffffff",
                    colorInputBackground: isDark ? "#0b1120" : "#f9fafb",
                    colorInputText: isDark ? "#ffffff" : "#1f2937",
                    borderRadius: "0.75rem",
                },
                elements: {
                    formButtonPrimary:
                        "bg-primary hover:bg-primary-dark shadow-lg shadow-primary/25",
                    card: "shadow-xl border border-gray-100 dark:border-white/5",
                    headerTitle: "font-display font-bold",
                    headerSubtitle: "text-gray-500",
                    socialButtonsBlockButton:
                        "border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5",
                    formFieldInput:
                        "rounded-xl border-gray-200 dark:border-white/10 focus:border-primary focus:ring-primary",
                    footerActionLink: "text-primary hover:text-primary-dark font-bold",
                },
            }}
            localization={clerkPtBR}
        >
            {children}
        </ClerkProvider>
    );
}
