
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import Services from './views/Services';
import Portfolio from './views/Portfolio';
import About from './views/About';
import Contact from './views/Contact';
import Careers from './views/Careers';
import Blog from './views/Blog';
import { View } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Home);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    const root = window.document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      root.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const renderView = () => {
    switch (currentView) {
      case View.Home: return <Home onNavigate={setCurrentView} />;
      case View.Services: return <Services />;
      case View.Portfolio: return <Portfolio />;
      case View.About: return <About onNavigate={setCurrentView} />;
      case View.Contact: return <Contact />;
      case View.Careers: return <Careers />;
      case View.Blog: return <Blog />;
      default: return <Home onNavigate={setCurrentView} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isDarkMode={isDarkMode} 
        toggleDarkMode={toggleDarkMode} 
      />
      <main className="flex-grow">
        {renderView()}
      </main>
      <Footer onNavigate={setCurrentView} />
    </div>
  );
};

export default App;
