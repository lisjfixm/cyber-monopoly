import { useTranslation, type Language } from '@client/src/i18n';

interface LanguageSwitchProps {
  variant?: 'buttons' | 'compact';
}

const LANGUAGES: { id: Language; labelKey: string; flag: string }[] = [
  { id: 'zh-TW', labelKey: 'lang.zhTW', flag: '🇹🇼' },
  { id: 'zh-CN', labelKey: 'lang.zhCN', flag: '🇨🇳' },
  { id: 'en', labelKey: 'lang.en', flag: '🇺🇸' },
  { id: 'ja', labelKey: 'lang.ja', flag: '🇯🇵' },
];

const LanguageSwitch = ({ variant = 'buttons' }: LanguageSwitchProps) => {
  const { language, setLanguage, t } = useTranslation();

  if (variant === 'compact') {
    return (
      <div className="flex gap-1">
        {LANGUAGES.map((lang) => {
          const isActive = language === lang.id;
          return (
            <button
              key={lang.id}
              type="button"
              onClick={() => setLanguage(lang.id)}
              className="cyber-btn px-2 py-1 text-xs font-cyber transition-all"
              style={{
                borderColor: isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.15)',
                color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
                background: isActive
                  ? 'color-mix(in srgb, var(--cyan) 12%, transparent)'
                  : 'transparent',
                boxShadow: isActive ? '0 0 6px rgba(0,255,255,0.2)' : 'none',
              }}
              title={t(lang.labelKey)}
            >
              <span>{lang.flag}</span>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-2">
      {LANGUAGES.map((lang) => {
        const isActive = language === lang.id;
        return (
          <button
            key={lang.id}
            type="button"
            onClick={() => setLanguage(lang.id)}
            className="cyber-btn py-2 px-1 text-xs font-cyber tracking-wide transition-all flex flex-col items-center gap-1"
            style={{
              borderColor: isActive ? 'var(--cyan)' : 'rgba(255,255,255,0.15)',
              color: isActive ? 'var(--cyan)' : 'var(--text-secondary)',
              background: isActive
                ? 'color-mix(in srgb, var(--cyan) 10%, transparent)'
                : 'transparent',
              boxShadow: isActive
                ? '0 0 8px rgba(0, 255, 255, 0.25), inset 0 0 6px rgba(0, 255, 255, 0.1)'
                : 'none',
            }}
          >
            <span className="text-base">{lang.flag}</span>
            <span className="text-[10px] md:text-xs">{t(lang.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
};

export default LanguageSwitch;
