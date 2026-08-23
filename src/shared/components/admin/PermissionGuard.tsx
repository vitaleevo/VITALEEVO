"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { hasCapability } from "@/shared/auth/capabilities";

interface PermissionGuardProps {
    permission?: string;
    permissions?: string[];
    requireAll?: boolean;
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export function AccessDenied({ role, requirement }: { role?: string; requirement?: string }) {
    return (
        <div className="min-h-[55vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center p-8 rounded-3xl bg-white dark:bg-[#151e32] border border-gray-100 dark:border-white/5 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto mb-4">
                    <ShieldAlert aria-hidden="true" className="w-8 h-8" />
                </div>
                <h2 className="font-display font-bold text-xl text-gray-900 dark:text-white mb-2">
                    Acesso Restrito
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                    A sua conta ({role || "colaborador"}) não possui acesso a este módulo{requirement ? ` (${requirement})` : ""}.
                </p>
                <Link
                    href="/admin"
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-white hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
                >
                    <ArrowLeft aria-hidden="true" className="w-4 h-4" /> Voltar ao Painel Principal
                </Link>
            </div>
        </div>
    );
}

export function hasUserCapability(user: any, capability: string): boolean {
    return hasCapability(user, capability);
}

export function useCapability(capability: string): boolean {
    const { user } = useAuth();
    return hasUserCapability(user, capability);
}

export function PermissionGuard({
    permission,
    permissions,
    requireAll = false,
    children,
    fallback,
}: PermissionGuardProps) {
    const { user } = useAuth();

    let allowed = true;

    if (permission) {
        allowed = hasUserCapability(user, permission);
    } else if (permissions && permissions.length > 0) {
        if (requireAll) {
            allowed = permissions.every(p => hasUserCapability(user, p));
        } else {
            allowed = permissions.some(p => hasUserCapability(user, p));
        }
    }

    if (allowed) {
        return <>{children}</>;
    }

    if (fallback !== undefined) {
        return <>{fallback}</>;
    }

    return <AccessDenied role={user?.role} requirement={permission || permissions?.join(", ")} />;
}
