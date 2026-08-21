"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, Tags, Building2, Newspaper, FolderKanban, Briefcase,
    ScrollText, ShoppingCart, FileText, Inbox, Mail, Users, Upload, ShieldCheck,
    Settings, LayoutTemplate, UserCircle, Menu, X, LogOut, Sparkles, Flame,
} from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { Loading } from "@/shared/components/admin/ui";

interface NavItem {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    permission?: string;
}

interface NavSection {
    title: string;
    items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
    {
        title: "Visão Geral",
        items: [
            { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
            { href: "/admin/cms", label: "Hub CMS", icon: Sparkles },
            { href: "/admin/cms#heatmap", label: "Mapa de Calor", icon: Flame, permission: "audit:read" },
        ],
    },
    {
        title: "Loja & Vendas",
        items: [
            { href: "/admin/products", label: "Produtos", icon: Package, permission: "catalog:read" },
            { href: "/admin/orders", label: "Encomendas", icon: ShoppingCart, permission: "orders:read" },
            { href: "/admin/quotes", label: "Cotações", icon: FileText, permission: "quotes:read" },
        ],
    },
    {
        title: "Atalhos Rápidos CMS",
        items: [
            { href: "/admin/cms#blog", label: "Blog & Artigos", icon: Newspaper, permission: "content:manage" },
            { href: "/admin/cms#portfolio", label: "Portfólio & Serviços", icon: FolderKanban, permission: "content:manage" },
            { href: "/admin/cms#contacts", label: "Contactos & Newsletter", icon: Inbox, permission: "contacts:manage" },
            { href: "/admin/cms#users", label: "Utilizadores & Staff", icon: Users, permission: "users:manage" },
            { href: "/admin/cms#profile", label: "O Meu Perfil", icon: UserCircle },
        ],
    },
];

const ROLE_LABELS: Record<string, string> = {
    admin: "Super Admin",
    commercial: "Comercial",
    content: "Conteúdo",
    operations: "Operações",
    user: "Cliente",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (!isLoading && (!isAuthenticated || !user?.isStaff)) {
            router.replace("/login");
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || !user?.isStaff) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center">
                <Loading label="A verificar sessão..." />
            </div>
        );
    }

    const hasAccess = (item: NavItem) => {
        if (!item.permission) return true;
        if (user.role === "admin") return true;
        const perms: string[] = user.permissions || [];
        if (item.permission === "catalog:read" && perms.includes("catalog:manage")) return true;
        if (item.permission === "orders:read" && perms.includes("orders:manage")) return true;
        if (item.permission === "quotes:read" && perms.includes("quotes:manage")) return true;
        return perms.includes(item.permission);
    };

    const visibleSections = NAV_SECTIONS.map((section) => ({
        ...section,
        items: section.items.filter(hasAccess),
    })).filter((section) => section.items.length > 0);

    const Sidebar = (
        <div className="flex h-full flex-col">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                <Link href="/admin" className="font-display text-xl font-black text-gray-900 dark:text-white">
                    VitalEvo <span className="text-primary">Admin</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
                {visibleSections.map((section) => (
                    <div key={section.title} className="space-y-1">
                        <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            {section.title}
                        </div>
                        <div className="space-y-0.5">
                            {section.items.map((item) => {
                                const active = pathname === item.href || (item.href === "/admin/cms" && pathname.startsWith("/admin/cms"));
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => setOpen(false)}
                                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                                            active
                                                ? "bg-primary/10 text-primary font-semibold"
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                                        }`}
                                    >
                                        <item.icon className="w-4 h-4 shrink-0" />
                                        <span>{item.label}</span>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </nav>
            <div className="p-3 border-t border-gray-100 dark:border-white/5 space-y-2">
                <div className="px-3 py-1.5 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5">
                    <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white truncate">
                            {user.name || user.email}
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-primary/10 text-primary shrink-0">
                            {ROLE_LABELS[user.role] || user.role}
                        </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">{user.email}</p>
                </div>
                <button
                    onClick={() => { logout(); router.replace("/login"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Terminar Sessão
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120]">
            {/* Sidebar desktop */}
            <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-gray-100 dark:border-white/5 bg-white dark:bg-[#0f172a] lg:block">
                {Sidebar}
            </aside>

            {/* Sidebar mobile */}
            {open && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <aside className="absolute inset-y-0 left-0 w-72 bg-white dark:bg-[#0f172a] shadow-2xl animate-in slide-in-from-left duration-200">
                        <button onClick={() => setOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10">
                            <X className="w-5 h-5" />
                        </button>
                        {Sidebar}
                    </aside>
                </div>
            )}

            {/* Conteúdo */}
            <div className="lg:pl-64">
                <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-gray-100 dark:border-white/5 bg-white/80 dark:bg-[#0b1120]/80 backdrop-blur px-6 py-4 lg:hidden">
                    <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-white/10">
                        <Menu className="w-5 h-5" />
                    </button>
                    <span className="font-display font-black text-gray-900 dark:text-white">
                        VitalEvo <span className="text-primary">Admin</span>
                    </span>
                </header>
                <main className="p-6 lg:p-10 max-w-7xl">{children}</main>
            </div>
        </div>
    );
}