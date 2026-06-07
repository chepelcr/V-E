import React from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';
import { motion } from 'framer-motion';

export default function Providers() {
  const { siteData } = useSiteData();

  return (
    <div className="container mx-auto px-6 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-serif text-4xl md:text-5xl text-primary mb-4">Our Partners</h1>
        <p className="text-muted-foreground font-light mb-12 max-w-2xl">
          Excellence requires exceptional materials. We partner exclusively with industry-leading providers to ensure lasting quality.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {siteData.providers.map((provider, index) => (
            <motion.div 
              key={provider.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-8 bg-card border border-white/5 flex flex-col h-full"
            >
              <h3 className="font-serif text-2xl text-foreground mb-4">{provider.name}</h3>
              <p className="font-light text-muted-foreground mb-8 flex-grow">
                {provider.description}
              </p>
              
              <div className="mb-6">
                <h4 className="text-xs uppercase tracking-widest text-primary mb-3">Materials</h4>
                <div className="flex flex-wrap gap-2">
                  {provider.materials.map(mat => (
                    <span key={mat} className="text-xs border border-white/10 px-3 py-1 text-muted-foreground">
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {(provider.contact || provider.website) && (
                <div className="text-sm font-light text-muted-foreground border-t border-white/5 pt-4 mt-auto">
                  {provider.website && <div className="mb-1">{provider.website}</div>}
                  {provider.contact && <div>{provider.contact}</div>}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
