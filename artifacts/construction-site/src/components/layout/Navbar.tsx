import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSiteData } from '@/contexts/SiteDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Sun, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FlagCR = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" aria-label="Español">
    <rect width="22" height="16" fill="#002B7F" rx="2" />
    <rect y="3.56" width="22" height="8.88" fill="#FFFFFF" />
    <rect y="5.34" width="22" height="5.32" fill="#CE1126" />
  </svg>
);

const FlagUS = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" aria-label="English">
    <rect width="22" height="16" fill="#B22234" rx="2" />
    <rect y="1.23" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="3.69" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="6.15" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="8.61" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="11.08" width="22" height="1.23" fill="#FFFFFF" />
    <rect y="13.54" width="22" height="1.23" fill="#FFFFFF" />
    <rect width="9" height="8.61" fill="#3C3B6E" rx="2" />
  </svg>
);

export const Navbar = () => {
  const { siteData } = useSiteData();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLabels: Record<string, string> = {
    '/': t.nav.home,
    '/catalog': t.nav.catalog,
    '/lots': t.nav.lots,
    '/financiamiento': t.nav.financing,
    '/providers': t.nav.providers,
    '/contact': t.nav.contact,
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-md border-b border-border/40">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" data-testid="link-home-logo">
          <img
            src="/logo.jpg"
            alt={siteData.config.companyName}
            className="h-16 w-16 object-cover"
            data-testid="img-logo"
          />
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="font-serif text-2xl tracking-widest text-foreground uppercase font-semibold" data-testid="text-logo">
              V<span className="text-primary">&</span>E
            </span>
            <span className="text-xs tracking-[0.2em] text-primary uppercase font-light">
              Asesores
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {siteData.navigation.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === item.path ? 'text-primary' : 'text-muted-foreground'}`}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              {navLabels[item.path] ?? item.label}
            </Link>
          ))}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-none border border-border/40 text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
            aria-label="Toggle theme"
            data-testid="button-theme-toggle"
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Language Toggle */}
          <button
            onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
            className="p-2 rounded-none border border-border/40 hover:border-primary/50 transition-colors flex items-center gap-1.5"
            aria-label="Toggle language"
            data-testid="button-lang-toggle"
          >
            {language === 'es' ? <FlagCR /> : <FlagUS />}
            <span className="text-xs tracking-widest uppercase text-muted-foreground font-light hidden sm:inline">
              {language === 'es' ? 'ES' : 'EN'}
            </span>
          </button>

          {/* Mobile Toggle */}
          <button
            className="md:hidden text-primary p-2"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="button-mobile-menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-border/40 py-4 flex flex-col px-6 gap-4"
          >
            {siteData.navigation.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === item.path ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {navLabels[item.path] ?? item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
