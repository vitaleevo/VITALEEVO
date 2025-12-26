"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import {
    LayoutDashboard,
    ShoppingBag,
    MessageSquare,
    Package,
    FileText,
    Settings,
    Palette,
    LogOut,
    Home,
    ShieldAlert,
    Users,
    Briefcase
} from "lucide-react";
import Logo from "@/shared/components/Logo";
import { useAuth } from "@/shared/providers/AuthProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, isAuthenticated, isAdmin, isLoading, logout } = useAuth();

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [isLoading, isAuthenticated, router]);

    // Show loading while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120]">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    <p className="text-gray-500 font-medium">Verificando credenciais...</p>
                </div>
            </div>
        );
    }

    // If not authenticated, don't render (redirect will happen)
    if (!isAuthenticated) {
        return null;
    }

    // If authenticated but not admin, show access denied
    if (!isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0b1120] p-4">
                <div className="max-w-md w-full bg-white dark:bg-[#151e32] p-8 rounded-3xl border border-gray-100 dark:border-white/5 shadow-2xl text-center">
                    <div className="w-20 h-20 bg-red-100 dark:bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldAlert className="w-10 h-10 text-red-500" />
                    </div>
                    <h1 className="text-2xl font-display font-black text-gray-900 dark:text-white mb-2">
                        Acesso Negado
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-8">
                        A conta <span className="font-bold text-gray-900 dark:text-gray-200">{user?.email}</span> não tem permissões de administrador.
                    </p>
                    <div className="space-y-3">
                        <Link href="/" className="block w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-primary/25">
                            Voltar para o Início
                        </Link>
                        <button
                            onClick={logout}
                            className="block w-full text-gray-500 hover:text-red-500 font-bold py-2 transition-colors"
                        >
                            Sair da conta e trocar de usuário
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    const menuItems = [
        { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { label: "Pedidos", href: "/admin/orders", icon: ShoppingBag },
        { label: "Produtos", href: "/admin/products", icon: Package },
        { label: "Categorias", href: "/admin/categories", icon: Palette },
        { label: "Utilizadores", href: "/admin/users", icon: Users },
        { label: "Mensagens", href: "/admin/contacts", icon: MessageSquare },
        { label: "Portfólio", href: "/admin/portfolio", icon: Briefcase },
        { label: "Blog", href: "/admin/blog", icon: FileText },
        { label: "Definições", href: "/admin/settings", icon: Settings },
    ];

    const isActive = (href: string) => {
        if (href === '/admin' && pathname === '/admin') return true;
        if (href !== '/admin' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0b1120] flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-[#151e32] border-r border-gray-200 dark:border-white/5 hidden lg:flex flex-col fixed h-full z-50">
                <div className="p-6 border-b border-gray-200 dark:border-white/5">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <span className="text-xs font-bold text-primary tracking-widest uppercase mt-2 block">
                        Painel Administrativo
                    </span>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive(item.href)
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-primary dark:hover:text-white'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="p-6 border-t border-gray-200 dark:border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden min-w-0">
                            <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                                {user?.name}
                            </p>
                            <p className="text-[10px] text-gray-500 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Link
                            href="/admin/profile"
                            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 px-4 py-2 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-wider"
                        >
                            <Users className="w-3 h-3" />
                            Meu Perfil
                        </Link>
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-2 text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 px-4 py-2 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-wider"
                        >
                            <Home className="w-3 h-3" />
                            Voltar ao Site
                        </Link>
                        <button
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-colors font-bold text-[10px] uppercase tracking-wider"
                        >
                            <LogOut className="w-3 h-3" />
                            Sair
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-[#151e32] border-b border-gray-200 dark:border-white/5 px-4 py-3">
                <div className="flex items-center justify-between">
                    <Link href="/">
                        <Logo />
                    </Link>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-primary tracking-widest uppercase">
                            Admin
                        </span>
                        <button
                            onClick={logout}
                            className="p-2 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-500"
                        >
                            <LogOut className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 lg:ml-64 p-8 pt-20 lg:pt-8">
                {children}
            </main>
        </div>
    );
}
