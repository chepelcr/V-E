import React, { createContext, useContext, useState, useEffect } from 'react';
import { SiteData, initialSiteData } from '../data/siteData';

interface SiteDataContextType {
  siteData: SiteData;
  updateSiteData: (newData: SiteData) => void;
  exportJSON: () => void;
}

const SiteDataContext = createContext<SiteDataContextType | undefined>(undefined);

export const SiteDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [siteData, setSiteData] = useState<SiteData>(() => {
    const saved = localStorage.getItem('aurea_site_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved site data", e);
      }
    }
    return initialSiteData;
  });

  useEffect(() => {
    localStorage.setItem('aurea_site_data', JSON.stringify(siteData));
  }, [siteData]);

  const updateSiteData = (newData: SiteData) => {
    setSiteData(newData);
  };

  const exportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(siteData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "aurea_site_data.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <SiteDataContext.Provider value={{ siteData, updateSiteData, exportJSON }}>
      {children}
    </SiteDataContext.Provider>
  );
};

export const useSiteData = () => {
  const context = useContext(SiteDataContext);
  if (context === undefined) {
    throw new Error('useSiteData must be used within a SiteDataProvider');
  }
  return context;
};
