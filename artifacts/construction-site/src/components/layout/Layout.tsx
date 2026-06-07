import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { MarbleBackground } from '@/components/MarbleBackground';
import { ScrollToTopButton } from '@/components/ScrollToTopButton';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
        {children}
      </motion.main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
};
