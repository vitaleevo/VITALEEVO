"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    Home,
    Store,
    Briefcase,
    MessageCircle,
    ShoppingCart,
    Package
} from 'lucide-react';
import { useCart } from '@/shared/providers/CartProvider';

const MobileNavigation = () => {
    const pathname = usePathname();
    const { totalItems } = useCart();

    const navItems = [
        { label: 'Início', icon: Home, href: '/' },
        { label: 'Loja', icon: Store, href: '/store' },
        { label: 'Serviços', icon: Briefcase, href: '/services' },
        { label: 'Pedidos', icon: Package, href: '/account' },
        { label: 'Falar', icon: MessageCircle, href: '/contact' },
    ];

    const isActive = (href: string) => {
        if (href === '/' && pathname === '/') return true;
        if (href !== '/' && pathname.startsWith(href)) return true;
        return false;
    };

    return (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100] pb-safe">
            {/* Background Blur and Border */}
            <div className="absolute inset-0 bg-white/80 dark:bg-[#0b1120]/90 backdrop-blur-2xl border-t border-gray-200/50 dark:border-white/5 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]" />

            <nav className="relative flex items-center justify-around h-16 px-2">
                {navItems.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center justify-center flex-1 min-w-0 transition-all ${active ? 'text-primary' : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            <div className="relative">
                                <Icon className={`w-6 h-6 transition-transform ${active ? 'scale-110' : 'scale-100'}`} />
                                {item.label === 'Pedidos' && active === false && (
                                    <span className="sr-only">Meus Pedidos</span>
                                )}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 transition-all ${active ? 'opacity-100' : 'opacity-70'
                                }`}>
                                {item.label}
                            </span>

                            {/* Active Indicator Pin */}
                            {active && (
                                <div className="absolute top-0 w-12 h-1 bg-primary rounded-full blur-[2px] opacity-20 transform -translate-y-[2px]" />
                            )}
                        </Link>
                    );
                })}

                {/* Floating Cart Button for Mobile (Alternative position) */}
                <Link
                    href="/cart"
                    className="absolute -top-14 right-4 bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/40 flex items-center justify-center transform active:scale-95 transition-all"
                >
                    <div className="relative">
                        <ShoppingCart className="w-6 h-6" />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center border-2 border-primary">
                                {totalItems}
                            </span>
                        )}
                    </div>
                </Link>
            </nav>
        </div>
    );
};

export default MobileNavigation;
