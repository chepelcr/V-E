import React from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { motion } from 'framer-motion';

export default function Home() {
  const { siteData } = useSiteData();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: "easeOut" as const }
    }
  };

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="min-h-[80vh] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-background/50 z-0"></div>
        <motion.div 
          className="container mx-auto px-6 relative z-10 text-center flex flex-col items-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.h1 
            className="font-serif text-5xl md:text-7xl lg:text-8xl tracking-widest text-primary uppercase mb-6"
            variants={itemVariants}
          >
            {siteData.config.companyName}
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-muted-foreground font-light tracking-widest uppercase max-w-2xl"
            variants={itemVariants}
          >
            {siteData.config.tagline}
          </motion.p>
          <motion.div variants={itemVariants} className="mt-12">
            <div className="w-px h-24 bg-gradient-to-b from-primary to-transparent mx-auto"></div>
          </motion.div>
        </motion.div>
      </section>

      {/* Corporate Section */}
      <section className="py-24 md:py-32">
        <div className="container mx-auto px-6 max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="grid md:grid-cols-2 gap-16 md:gap-24 items-center"
          >
            <div>
              <h2 className="font-serif text-3xl md:text-4xl text-foreground mb-8">About Us</h2>
              <p className="text-muted-foreground leading-relaxed font-light text-lg">
                {siteData.corporate.about}
              </p>
            </div>
            <div className="space-y-12">
              <div>
                <h3 className="text-primary tracking-widest uppercase text-sm mb-4">Our Mission</h3>
                <p className="text-foreground leading-relaxed font-light">
                  {siteData.corporate.mission}
                </p>
              </div>
              <div>
                <h3 className="text-primary tracking-widest uppercase text-sm mb-4">Our Vision</h3>
                <p className="text-foreground leading-relaxed font-light">
                  {siteData.corporate.vision}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
