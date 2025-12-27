"use client";

import { ConvexReactClient } from "convex/react";
import { ConvexProvider } from "convex/react";
import { ReactNode } from "react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl as string) : null;

export function ConvexClientProvider({ children }: { children: ReactNode }) {
    if (!convex) {
        if (process.env.NODE_ENV === "development") {
            return (
                <div className="p-10 bg-red-50 border-4 border-red-500 rounded-3xl m-10 text-red-900">
                    <h1 className="text-2xl font-black mb-4 uppercase">Erro de Configuração</h1>
                    <p className="font-bold">A variável <code className="bg-red-100 px-2 py-1 rounded">NEXT_PUBLIC_CONVEX_URL</code> não foi encontrada.</p>
                    <p className="mt-4">Por favor, verifique o seu arquivo <code className="bg-red-100 px-2 py-1 rounded">.env.local</code> ou as definições da Vercel.</p>
                </div>
            );
        }
        // In production, we'll return children and hope the developer sees the console error,
        // but we should still try to provide a "broken" client to avoid hook crashes if possible.
        // However, ConvexProvider NEEDS a client.
        return <>{children}</>;
    }

    return (
        <ConvexProvider client={convex}>
            {children}
        </ConvexProvider>
    );
}
