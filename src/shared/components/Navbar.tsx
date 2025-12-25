"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Logo from './Logo';
import { View } from '@/shared/types';
import { useTheme } from './ThemeProvider';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  const menuItems = [
    { label: 'Home', value: View.Home, href: '/' },
    { label: 'Sobre', value: View.About, href: '/about' },
    { label: 'Serviços', value: View.Services, href: '/services' },
    { label: 'Loja', value: View.Store, href: '/store' },
    { label: 'Portfólio', value: View.Portfolio, href: '/portfolio' },
    { label: 'Blog', value: View.Blog, href: '/blog' },
  ];

  const isActive = (href: string) => {
    if (href === '/' && pathname === '/') return true;
    if (href !== '/' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className="fixed w-full z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex-shrink-0 flex items-center cursor-pointer">
            <Logo />
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <Link
                key={item.value}
                href={item.href}
                className={`text-sm font-semibold transition-colors ${isActive(item.href)
                  ? 'text-primary'
                  : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                  }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/contact"
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105"
            >
              Fale Conosco
            </Link>
            {/* Cart Button */}
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors relative group">
              <span className="material-icons-round">shopping_cart</span>
              <span className="absolute top-2 right-2 h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
            </Link>

            {/* Account Button */}
            <Link href="/account" className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/5 text-gray-600 dark:text-gray-300 transition-colors">
              <span className="material-icons-round">person</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="material-icons-round text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <span className="material-icons-round text-xl">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 dark:text-gray-300">
              <span className="material-icons-round text-3xl">{isOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-800 px-4 py-6 space-y-4">
          {menuItems.map((item) => (
            <Link
              key={item.value}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={`block w-full text-left px-3 py-2 text-base font-semibold ${isActive(item.href) ? 'text-primary' : 'text-gray-700 dark:text-gray-300'
                }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/contact"
            onClick={() => setIsOpen(false)}
            className="block w-full bg-primary text-white text-center py-3 rounded-xl font-bold"
          >
            Fale Conosco
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
