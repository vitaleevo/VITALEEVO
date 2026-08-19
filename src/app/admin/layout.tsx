"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard, Package, Tags, Building2, Newspaper, FolderKanban, Briefcase,
    ScrollText, ShoppingCart, FileText, Inbox, Mail, Users, Upload, ShieldCheck,
    Settings, LayoutTemplate, UserCircle, Menu, X, LogOut, Bot,
} from "lucide-react";
import { useAuth } from "@/shared/providers/AuthProvider";
import { Loading } from "@/shared/components/admin/ui";

const NAV = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/products", label: "Produtos", icon: Package },
    { href: "/admin/categories", label: "Categorias", icon: Tags },
    { href: "/admin/brands", label: "Marcas", icon: Building2 },
    { href: "/admin/blog", label: "Blog", icon: Newspaper },
    { href: "/admin/portfolio", label: "Portfólio", icon: FolderKanban },
    { href: "/admin/services", label: "Serviços", icon: Briefcase },
    { href: "/admin/legal", label: "Documentos Legais", icon: ScrollText },
    { href: "/admin/orders", label: "Encomendas", icon: ShoppingCart },
    { href: "/admin/quotes", label: "Cotações", icon: FileText },
    { href: "/admin/contacts", label: "Contactos", icon: Inbox },
    { href: "/admin/newsletter", label: "Newsletter", icon: Mail },
    { href: "/admin/users", label: "Utilizadores", icon: Users },
    { href: "/admin/import", label: "Importar Excel", icon: Upload },
    { href: "/admin/audit", label: "Auditoria", icon: ShieldCheck },
    { href: "/admin/settings", label: "Configurações", icon: Settings },
    { href: "/admin/site", label: "Páginas do Site", icon: LayoutTemplate },
    { href: "/admin/ai", label: "IA", icon: Bot },
    { href: "/admin/profile", label: "Perfil", icon: UserCircle },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, isLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex items-center justify-center">
                <Loading label="A verificar sessão..." />
            </div>
        );
    }

    if (!isAuthenticated || !user?.isStaff) {
        router.replace("/login");
        return null;
    }

    const Sidebar = (
        <div className="flex h-full flex-col">
            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5">
                <Link href="/admin" className="font-display text-xl font-black text-gray-900 dark:text-white">
                    VitalEvo <span className="text-primary">Admin</span>
                </Link>
            </div>
            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
                {NAV.map(item => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                                active
                                    ? "bg-primary/10 text-primary"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            <item.icon className="w-4 h-4 shrink-0" />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
            <div className="p-3 border-t border-gray-100 dark:border-white/5">
                <div className="px-3 py-2 text-xs text-gray-400">
                    {user?.firstName || user?.email}
                </div>
                <button
                    onClick={() => { logout(); router.replace("/login"); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
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