import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { translations, TranslationKey } from './translations';

export type Lang = 'ko' | 'en';

const STORAGE_KEY = 'intra-lang';

const getBrowserLang = (): Lang => {
  if (typeof navigator === 'undefined') return 'en';
  const lang = navigator.language.toLowerCase();
  return lang.startsWith('ko') ? 'ko' : 'en';
};

const getInitialLang = (): Lang => {
  if (typeof window === 'undefined') return 'en';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'ko' || stored === 'en') {
    return stored;
  }
  return getBrowserLang();
};

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const interpolate = (template: string, params?: Record<string, string | number>) => {
  if (!params) return template;
  return Object.keys(params).reduce((acc, key) => {
    return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), String(params[key]));
  }, template);
};

export const I18nProvider = ({ children }: { children: React.ReactNode }) => {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const t = useCallback((key: TranslationKey, params?: Record<string, string | number>) => {
    const dict = translations[lang] || translations.en;
    const fallback = translations.en[key] || key;
    return interpolate(dict[key] || fallback, params);
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, setLang, t]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
};

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  return ctx;
};
