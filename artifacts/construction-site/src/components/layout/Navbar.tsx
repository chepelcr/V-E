import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { useSiteData } from '@/contexts/SiteDataContext';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
  const { siteData } = useSiteData();
  const [location] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-white/5">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-serif text-2xl tracking-widest text-primary uppercase" data-testid="text-logo">
            {siteData.config.companyName}
          </span>
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
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Mobile Toggle */}
        <button 
          className="md:hidden text-primary p-2" 
          onClick={() => setIsOpen(!isOpen)}
          data-testid="button-mobile-menu"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {isOpen && (
          <motion.nav 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-20 left-0 right-0 bg-background border-b border-white/5 py-4 flex flex-col px-6 gap-4"
          >
            {siteData.navigation.map((item) => (
              <Link 
                key={item.path} 
                href={item.path}
                onClick={() => setIsOpen(false)}
                className={`text-sm tracking-widest uppercase transition-colors hover:text-primary ${location === item.path ? 'text-primary' : 'text-muted-foreground'}`}
              >
                {item.label}
              </Link>
            ))}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
};
