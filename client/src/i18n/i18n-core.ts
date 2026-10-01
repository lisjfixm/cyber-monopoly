import zhTW from './dict/zh-TW';
import zhCN from './dict/zh-CN';
import en from './dict/en';
import ja from './dict/ja';

export type Language = 'zh-TW' | 'zh-CN' | 'en' | 'ja';

const STORAGE_KEY = 'cyber_monopoly_i18n_lang';
export const DEFAULT_LANG: Language = 'zh-TW';

// 所有語言的字典
const dictionaries: Record<Language, Record<string, string>> = {
  'zh-TW': zhTW,
  'zh-CN': zhCN,
  en,
  ja,
};

// 命名空間註冊表（供其他模組動態擴充）
interface NamespaceTranslations {
  [lang: string]: Record<string, string>;
}

const registeredNamespaces: Record<string, NamespaceTranslations> = {};

/**
 * 動態註冊某個命名空間的翻譯。
 * 其他批次/模組可以呼叫此函數註冊自己的翻譯，不與核心字典衝突。
 *
 * @param namespace 命名空間，例如 'battlepass'、'tournament'
 * @param translations 各語言的翻譯物件
 */
export function registerTranslations(
  namespace: string,
  translations: Partial<Record<Language, Record<string, string>>>,
): void {
  if (registeredNamespaces[namespace]) {
    Object.entries(translations).forEach(([lang, dict]) => {
      if (dict) {
        registeredNamespaces[namespace][lang] = {
          ...(registeredNamespaces[namespace][lang] ?? {}),
          ...dict,
        };
      }
    });
    return;
  }

  const ns: NamespaceTranslations = {};
  Object.entries(translations).forEach(([lang, dict]) => {
    if (dict) {
      ns[lang] = dict;
    }
  });
  registeredNamespaces[namespace] = ns;
}

function getFromNamespaces(lang: Language, key: string): string | undefined {
  const namespaces = Object.values(registeredNamespaces);
  for (const ns of namespaces) {
    const dict = ns[lang];
    if (dict && dict[key] !== undefined) return dict[key];
  }
  return undefined;
}

export function getStoredLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && (['zh-TW', 'zh-CN', 'en', 'ja'] as string[]).includes(stored)) {
      return stored as Language;
    }
  } catch {
    // ignore
  }
  return DEFAULT_LANG;
}

export function setStoredLanguage(lang: Language): void {
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // ignore
  }
}

export function translate(lang: Language, key: string): string {
  const dict = dictionaries[lang];
  const value = dict?.[key];
  if (value !== undefined) return value;

  const nsValue = getFromNamespaces(lang, key);
  if (nsValue !== undefined) return nsValue;

  if (lang !== DEFAULT_LANG) {
    const fallback = dictionaries[DEFAULT_LANG][key];
    if (fallback !== undefined) return fallback;
    const nsFallback = getFromNamespaces(DEFAULT_LANG, key);
    if (nsFallback !== undefined) return nsFallback;
  }

  return key;
}

/**
 * 獨立於 React 之外的 t 函數，用於非組件環境。
 * 會讀取 localStorage 中的語言設定。
 */
export function t(key: string): string {
  const lang = getStoredLanguage();
  return translate(lang, key);
}
