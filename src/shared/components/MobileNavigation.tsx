"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Store, Briefcase, Package, MessageCircle, ShoppingCart } from "lucide-react";
import { useCart } from "@/shared/providers/CartProvider";

const MobileNavigation = () => {
  const pathname = usePathname();
  const { totalItems } = useCart();

  const navItems = [
    { label: "Início", icon: Home, href: "/" },
    { label: "Loja", icon: Store, href: "/store" },
    { label: "Serviços", icon: Briefcase, href: "/services" },
    { label: "Conta", icon: Package, href: "/conta" },
    { label: "Falar", icon: MessageCircle, href: "/contact" },
  ];

  const isActive = (href: string) => {
    if (href === "/" && pathname === "/") return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <div className="pb-safe fixed inset-x-0 bottom-0 z-[100] lg:hidden">
      <div className="absolute inset-0 border-t border-slate-200/70 bg-white/90 backdrop-blur-2xl dark:border-white/10 dark:bg-[#0b1120]/95" />

      {totalItems > 0 && (
        <Link
          href="/cotacao"
          className="absolute -top-14 right-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-white shadow-lift transition-transform active:scale-95"
          aria-label="Ver pedido de cotação"
        >
          <ShoppingCart className="h-6 w-6" />
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
            {totalItems}
          </span>
        </Link>
      )}

      <nav className="relative flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 min-w-0 flex-col items-center justify-center gap-0.5 transition-colors ${
                active ? "text-primary" : "text-slate-500 dark:text-slate-400"
              }`}
            >
              <Icon className={`h-[22px] w-[22px] transition-transform ${active ? "scale-110" : ""}`} />
              <span className={`text-[10px] font-bold ${active ? "opacity-100" : "opacity-70"}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileNavigation;