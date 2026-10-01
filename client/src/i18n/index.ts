export type { Language } from './i18n-core';
export {
  registerTranslations,
  t,
  DEFAULT_LANG,
  translate,
  getStoredLanguage,
  setStoredLanguage,
} from './i18n-core';
export { LanguageProvider, useTranslation, LanguageContext } from './index.tsx';
