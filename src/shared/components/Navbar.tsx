"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { View } from '@/shared/types';
import { useTheme } from './ThemeProvider';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuItems = [
    { label: 'Home', icon: 'home', value: View.Home, href: '/' },
    { label: 'Sobre', icon: 'info', value: View.About, href: '/about' },
    { label: 'Serviços', icon: 'design_services', value: View.Services, href: '/services' },
    { label: 'Loja', icon: 'storefront', value: View.Store, href: '/store' },
    { label: 'Portfólio', icon: 'folder_special', value: View.Portfolio, href: '/portfolio' },
    { label: 'Blog', icon: 'article', value: View.Blog, href: '/blog' },
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
        <div className="flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer group">
            <Logo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center">
            {/* Main Menu - Pill Style */}
            <div className="flex items-center bg-gray-100/80 dark:bg-white/5 backdrop-blur-md rounded-full p-1.5 border border-gray-200/50 dark:border-white/10 shadow-inner">
              {menuItems.map((item) => (
                <Link
                  key={item.value}
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
              <span className="material-icons-round text-xl group-hover:scale-110 transition-transform">shopping_cart</span>
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-primary text-white text-[10px] font-bold items-center justify-center">2</span>
              </span>
            </Link>

            {/* Account Button */}
            <Link
              href="/account"
              className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-white/10 group"
            >
              <span className="material-icons-round text-xl group-hover:scale-110 transition-transform">person</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-3 rounded-xl bg-gray-100/80 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all border border-gray-200/50 dark:border-white/10 group"
            >
              <span className="material-icons-round text-xl group-hover:scale-110 group-hover:rotate-180 transition-all duration-500">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {/* CTA Button */}
            <Link
              href="/contact"
              className="ml-2 bg-primary hover:bg-primary-dark text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 hover:-translate-y-0.5 flex items-center gap-2 group"
            >
              <span>Fale Conosco</span>
              <span className="material-icons-round text-lg group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden flex items-center gap-3">
            <Link href="/cart" className="relative p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300">
              <span className="material-icons-round">shopping_cart</span>
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full text-white text-[10px] font-bold flex items-center justify-center">2</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300"
            >
              <span className="material-icons-round">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2.5 rounded-xl bg-primary text-white"
            >
              <span className="material-icons-round text-2xl">{isOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden absolute top-full left-0 w-full transition-all duration-500 ease-out overflow-hidden ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
        }`}>
        <div className="bg-white dark:bg-[#0b1120] border-t border-gray-200 dark:border-white/5 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-2">
            {menuItems.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold transition-all ${isActive(item.href)
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5'
                  }`}
              >
                <span className={`material-icons-round ${isActive(item.href) ? 'text-primary' : 'text-gray-400'}`}>{item.icon}</span>
                {item.label}
              </Link>
            ))}

            <div className="pt-4 border-t border-gray-100 dark:border-white/5 space-y-3">
              <Link
                href="/account"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
              >
                <span className="material-icons-round text-gray-400">person</span>
                Minha Conta
              </Link>

              <Link
                href="/contact"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-primary text-white text-center py-4 rounded-xl font-bold shadow-lg shadow-primary/20"
              >
                Fale Conosco
                <span className="material-icons-round">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
