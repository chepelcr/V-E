import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { motion } from 'framer-motion';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-[100dvh] flex flex-col marble-bg">
      <Navbar />
      <motion.main 
        className="flex-grow pt-20"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      <Footer />
    </div>
  );
};
