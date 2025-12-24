
import React, { useState } from 'react';
import Logo from './Logo';
import { View } from '../types';

interface NavbarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, onNavigate, isDarkMode, toggleDarkMode }) => {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { label: 'Home', value: View.Home },
    { label: 'Sobre', value: View.About },
    { label: 'Serviços', value: View.Services },
    { label: 'Portfólio', value: View.Portfolio },
    { label: 'Carreiras', value: View.Careers },
    { label: 'Blog', value: View.Blog },
  ];

  return (
    <nav className="fixed w-full z-50 bg-surface-light/90 dark:bg-surface-dark/90 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0 flex items-center cursor-pointer" onClick={() => onNavigate(View.Home)}>
            <Logo />
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.value}
                onClick={() => onNavigate(item.value)}
                className={`text-sm font-semibold transition-colors ${
                  currentView === item.value 
                    ? 'text-primary' 
                    : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={() => onNavigate(View.Contact)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-primary/30 transition-all hover:scale-105"
            >
              Fale Conosco
            </button>
            <button 
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <span className="material-icons-round text-xl">
                {isDarkMode ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
          </div>

          <div className="md:hidden flex items-center gap-4">
             <button onClick={toggleDarkMode} className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
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
            <button
              key={item.value}
              onClick={() => { onNavigate(item.value); setIsOpen(false); }}
              className="block w-full text-left px-3 py-2 text-base font-semibold text-gray-700 dark:text-gray-300"
            >
              {item.label}
            </button>
          ))}
          <button 
            onClick={() => { onNavigate(View.Contact); setIsOpen(false); }}
            className="w-full bg-primary text-white py-3 rounded-xl font-bold"
          >
            Fale Conosco
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
