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
    const saved = localStorage.getItem('vye_site_data_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as SiteData;
        // Merge with initialSiteData so new fields always have defaults
        return { ...initialSiteData, ...parsed, contact: parsed.contact ?? initialSiteData.contact };
      } catch (e) {
        console.error("Failed to parse saved site data", e);
      }
    }
    return initialSiteData;
  });

  useEffect(() => {
    localStorage.setItem('vye_site_data_v2', JSON.stringify(siteData));
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
