"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import {
  ShoppingCart,
  User,
  Sun,
  Moon,
  ArrowRight,
  Menu,
  X,
  Home as HomeIcon,
  Info,
  Palette,
  Store,
  Briefcase,
  FileText,
  LogIn
} from "lucide-react";
import { View } from '@/shared/types';
import { useTheme } from './ThemeProvider';
import { useCart } from '@/shared/providers/CartProvider';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { isSignedIn, isLoaded } = useUser();
  const { totalItems } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', icon: <HomeIcon className="w-4 h-4" />, value: View.Home, href: '/' },
    { label: 'Sobre', icon: <Info className="w-4 h-4" />, value: View.About, href: '/about' },
    { label: 'Serviços', icon: <Palette className="w-4 h-4" />, value: View.Services, href: '/services' },
    { label: 'Loja', icon: <Store className="w-4 h-4" />, value: View.Store, href: '/store' },
    { label: 'Portfólio', icon: <Briefcase className="w-4 h-4" />, value: View.Portfolio, href: '/portfolio' },
    { label: 'Blog', icon: <FileText className="w-4 h-4" />, value: View.Blog, href: '/blog' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ${scrolled
      ? 'py-2 bg-white/80 dark:bg-[#0b1120]/90 backdrop-blur-xl shadow-lg shadow-black/5 border-b border-gray-200/50 dark:border-white/5'
      : 'py-4 bg-transparent'
      }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer group">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center flex-1 justify-center">
            {/* Main Menu - Pill Style */}
            <div className="flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-full p-1.5 border border-gray-200/50 dark:border-white/10 shadow-inner">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${isActive(item.href)
                    ? 'bg-white dark:bg-primary text-primary dark:text-white shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-white/5'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="hidden lg:flex items-center gap-2">

            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-white/10 group"
            >
              <ShoppingCart className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-white text-[10px] font-bold items-center justify-center">{totalItems}</span>
                </span>
              )}
            </Link>

            {/* Account / User Button */}
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <div className="p-1.5 rounded-xl bg-gray-100/80 dark:bg-white/5 border border-gray-200/50 dark:border-white/10">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-9 h-9",
                        }
                      }}
                    />
                  </div>
                ) : (
                  <Link
                    href="/sign-in"
                    className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-white/10 group"
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  </Link>
                )}
              </>
            )}

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-white/10 group"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5 group-hover:scale-110 transition-all duration-500" />
              ) : (
                <Moon className="w-5 h-5 group-hover:scale-110 transition-all duration-500" />
              )}
            </button>

            {/* CTA Button */}
            <Link
              href="/contact"
              className="ml-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <span>Fale Conosco</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {isLoaded && isSignedIn && (
              <div className="p-1 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/50 dark:border-white/5">
                <UserButton
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    }
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

    </nav>
  );
};

export default Navbar;
