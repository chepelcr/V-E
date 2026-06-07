import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSiteData } from '@/contexts/SiteDataContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, Sun, Moon, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type NavLink = { path: string; label: string };

/** Desktop "Catálogo" dropdown grouping Casas (/catalog) and Lotes (/lots). */
const CatalogDropdown = ({
  label,
  items,
  active,
  currentPath,
}: {
  label: string;
  items: NavLink[];
  active: boolean;
  currentPath: string;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={`flex items-center gap-1 text-sm tracking-widest uppercase transition-colors hover:text-primary ${active ? 'text-primary' : 'text-muted-foreground'}`}
        onClick={() => setOpen((o) => !o)}
        data-testid="nav-catalog-dropdown"
      >
        {label}
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 top-full pt-3 min-w-[160px]"
          >
            <div className="bg-background/95 backdrop-blur-md border border-border/40 py-2 flex flex-col">
              {items.map((it) => (
                <Link
                  key={it.path}
                  href={it.path}
                  className={`px-4 py-2 text-sm tracking-widest uppercase transition-colors hover:text-primary hover:bg-primary/5 ${currentPath === it.path ? 'text-primary' : 'text-muted-foreground'}`}
                  data-testid={`nav-catalog-item-${it.path.slice(1)}`}
                >
                  {it.label}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

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
        <Link href="/" className="flex items-center" data-testid="link-home-logo">
          <img
            src={`${import.meta.env.BASE_URL}${theme === 'dark' ? 'nav-dark.png' : 'nav-light.png'}`}
            alt={siteData.config.companyName}
            className="h-11 sm:h-14 w-auto object-contain"
            data-testid="img-logo"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {siteData.navigation.map((item) => {
            // Lotes is grouped inside the Catálogo dropdown.
            if (item.path === '/lots') return null;
            if (item.path === '/catalog') {
              return (
                <CatalogDropdown
                  key="catalog-dropdown"
                  label={t.nav.catalog}
                  active={location === '/catalog' || location === '/lots'}
                  currentPath={location}
                  items={[
                    { path: '/catalog', label: t.nav.casas },
                    { path: '/lots', label: t.nav.lots },
                  ]}
                />
              );
            }
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === item.path ? 'text-primary' : 'text-muted-foreground'}`}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                {navLabels[item.path] ?? item.label}
              </Link>
            );
          })}
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
            {siteData.navigation.map((item) => {
              if (item.path === '/lots') return null;
              if (item.path === '/catalog') {
                return (
                  <div key="catalog-group" className="flex flex-col gap-3">
                    <span className="text-sm tracking-widest uppercase text-primary/80">
                      {t.nav.catalog}
                    </span>
                    {[
                      { path: '/catalog', label: t.nav.casas },
                      { path: '/lots', label: t.nav.lots },
                    ].map((it) => (
                      <Link
                        key={it.path}
                        href={it.path}
                        onClick={() => setIsOpen(false)}
                        className={`pl-4 text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === it.path ? 'text-primary' : 'text-muted-foreground'}`}
                      >
                        {it.label}
                      </Link>
                    ))}
                  </div>
                );
              }
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === item.path ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {navLabels[item.path] ?? item.label}
                </Link>
              );
            })}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
