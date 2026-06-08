import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MarbleBackground } from '@/components/MarbleBackground';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { language } = useLanguage();
  return (
    <div className="relative min-h-[100dvh] flex flex-col">
      <MarbleBackground />
      <Navbar />
      <motion.main
        className="flex-grow pt-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {/* Crossfade the page content when the language flips so the copy
            swaps smoothly instead of snapping. Keyed only by language, so
            route changes are unaffected (handled per-page). */}
        <AnimatePresence mode="wait">
          <motion.div
            key={language}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </motion.main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
