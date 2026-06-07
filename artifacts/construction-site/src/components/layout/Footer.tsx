import React from 'react';
import { useSiteData } from '@/contexts/SiteDataContext';

export const Footer = () => {
  const { siteData } = useSiteData();
  
  return (
    <footer className="border-t border-white/5 py-12 mt-20">
      <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h3 className="font-serif text-xl tracking-widest text-primary uppercase mb-2">
            {siteData.config.companyName}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm">
            {siteData.config.tagline}
          </p>
        </div>
        <div className="text-sm text-muted-foreground flex gap-6">
          <a href="/admin" className="hover:text-primary transition-colors" data-testid="link-admin">Admin Access</a>
        </div>
      </div>
      <div className="container mx-auto px-6 mt-12 text-xs text-muted-foreground/50 text-center">
        &copy; {new Date().getFullYear()} {siteData.config.companyName}. All rights reserved.
      </div>
    </footer>
  );
};
