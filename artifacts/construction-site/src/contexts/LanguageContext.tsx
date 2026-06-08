import React, { createContext, useContext, useState } from 'react';
import { Language, Translations, translations } from '@/i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('aurea_lang') as Language) || 'es';
  });

  const handleSetLanguage = (lang: Language) => {
    if (lang === language) return;
    localStorage.setItem('aurea_lang', lang);

    const el =
      typeof document !== 'undefined'
        ? document.getElementById('page-content')
        : null;
    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // On the public site (where #page-content exists) fade the content OUT
    // first, swap the copy while it's invisible, then fade IN — so the text
    // never visibly snaps and the page never unmounts (no scroll jump). The
    // admin (no #page-content) and reduced-motion users switch instantly.
    if (!el || reduce) {
      setLanguage(lang);
      return;
    }

    const root = document.documentElement;
    root.classList.add('lang-switching'); // -> opacity 0 (see index.css)
    window.setTimeout(() => {
      setLanguage(lang); // swap copy while faded out
      requestAnimationFrame(() =>
        requestAnimationFrame(() => root.classList.remove('lang-switching')),
      );
    }, 220);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
};
