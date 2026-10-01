import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import {
  translate,
  getStoredLanguage,
  setStoredLanguage,
  DEFAULT_LANG,
} from './i18n-core';

export type { Language } from './i18n-core';
export { registerTranslations, t, DEFAULT_LANG } from './i18n-core';

import type { Language } from './i18n-core';

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  // 同步語言到 document（方便其他樣式/組件偵測）
  useEffect(() => {
    try {
      document.documentElement.setAttribute('lang', language);
    } catch {
      // ignore
    }
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  }, []);

  const tFn = useCallback(
    (key: string): string => translate(language, key),
    [language],
  );

  const value = useMemo<LanguageContextValue>(
    () => ({ language, setLanguage, t: tFn }),
    [language, setLanguage, tFn],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useTranslation(): {
  t: (key: string) => string;
  language: Language;
  setLanguage: (lang: Language) => void;
} {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      t: (key: string) => translate(DEFAULT_LANG, key),
      language: DEFAULT_LANG,
      setLanguage: () => {
        // no-op
      },
    };
  }
  return ctx;
}

export { LanguageContext };
export default LanguageContext;
