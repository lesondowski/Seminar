import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import vi from './locales/vi';
import en from './locales/en';
import zh from './locales/zh';

const translations = { vi, en, zh };

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('vi');

  // Load saved language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userLanguage') || 'vi';
      if (translations[saved]) {
        setLanguage(saved);
      }
    }
  }, []);

  const changeLanguage = useCallback((lang) => {
    if (!translations[lang]) return;
    setLanguage(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLanguage', lang);
    }
  }, []);

  // t() – translate a key, supports {placeholder} substitution
  // e.g. t('login_otp_wrong_attempts', { n: 2 })
  const t = useCallback((key, vars = {}) => {
    let str = translations[language]?.[key] || translations['vi']?.[key] || key;
    Object.entries(vars).forEach(([k, v]) => {
      str = str.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
    });
    return str;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
