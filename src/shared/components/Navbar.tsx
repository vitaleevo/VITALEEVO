"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "./Logo";
import {
  ShoppingCart,
  User,
  Sun,
  Moon,
  ArrowRight,
  LogOut,
  Settings,
  LayoutDashboard,
  Package,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useCart } from "@/shared/providers/CartProvider";
import { useAuth } from "@/shared/providers/AuthProvider";

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === "dark";
  const { totalItems } = useCart();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const close = () => setShowUserMenu(false);
    if (showUserMenu) {
      document.addEventListener("click", close);
      return () => document.removeEventListener("click", close);
    }
  }, [showUserMenu]);

  const menuItems = [
    { label: "Home", href: "/" },
    { label: "Sobre", href: "/about" },
    { label: "Serviços", href: "/services" },
    { label: "Loja", href: "/store" },
    { label: "Portfólio", href: "/portfolio" },
    { label: "Blog", href: "/blog" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-slate-200/70 bg-white/85 shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-[#0b1120]/90"
          : "border-b border-transparent bg-transparent"
      }`}
    >
      <div className="wrap">
        <div className="flex h-16 items-center justify-between gap-4 md:h-[76px]">
          {/* Logo */}
          <Link href="/" className="flex shrink-0 items-center">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-1 lg:flex">
            {menuItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                    active
                      ? "text-primary"
                      : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-primary transition-all duration-300 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Right Actions */}
          <div className="hidden items-center gap-2 lg:flex">
            {/* Cart */}
            <Link
              href="/cart"
              className="group relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Carrinho"
            >
              <ShoppingCart className="h-5 w-5 transition-transform group-hover:scale-110" />
              {totalItems > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white shadow">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* User */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu((s) => !s);
                  }}
                  className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-1.5 pl-3 pr-1.5 transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-white/5"
                >
                  <span className="max-w-[110px] truncate text-sm font-bold text-slate-700 dark:text-slate-200">
                    {user?.name?.split(" ")[0]}
                  </span>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-faint text-sm font-bold text-primary dark:bg-primary/20">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card dark:border-white/10 dark:bg-[#151e32]">
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-white/5">
                      <p className="truncate font-bold text-slate-900 dark:text-white">{user?.name}</p>
                      <p className="truncate text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <div className="p-1.5">
                      <Link
                        href="/conta"
                        className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                      >
                        <Package className="h-4 w-4" /> Minha Conta
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5"
                        >
                          <LayoutDashboard className="h-4 w-4" /> Painel Admin
                        </Link>
                      )}
                      <button
                        onClick={logout}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      >
                        <LogOut className="h-4 w-4" /> Sair
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                aria-label="Entrar"
              >
                <User className="h-5 w-5" />
              </Link>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {/* CTA */}
            <Link href="/contact" className="btn-primary ml-1 !py-3">
              <span>Fale Conosco</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Mobile: theme + account shortcuts (full menu via bottom nav) */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
              aria-label="Alternar tema"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                aria-label="Sair"
              >
                <LogOut className="h-5 w-5" />
              </button>
            ) : (
              <Link
                href="/login"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white/80 text-slate-600 backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-300"
                aria-label="Entrar"
              >
                <User className="h-5 w-5" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;