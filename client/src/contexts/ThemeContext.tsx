import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeId =
  | 'cyberpunk'
  | 'starry'
  | 'ancient'
  | 'magic'
  | 'ocean'
  | 'steampunk'
  | 'wasteland'
  | 'japanese'
  | 'christmas'
  | 'halloween'
  | 'neon-tokyo'
  | 'wasteland-wild'
  | 'space-station'
  | 'virtual-reality';

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  description: string;
  previewColors: string[];
}

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
  colorblindMode: boolean;
  setColorblindMode: (enabled: boolean) => void;
  fontSize: 'small' | 'normal' | 'large' | 'xlarge';
  setFontSize: (size: 'small' | 'normal' | 'large' | 'xlarge') => void;
  animationEnabled: boolean;
  setAnimationEnabled: (enabled: boolean) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = 'monopoly_theme';
const COLORBLIND_KEY = 'monopoly_colorblind';
const FONT_SIZE_KEY = 'monopoly_font_size';
const ANIMATION_KEY = 'monopoly_animation_enabled';

const FONT_SCALE_MAP: Record<'small' | 'normal' | 'large' | 'xlarge', number> = {
  small: 0.85,
  normal: 1,
  large: 1.15,
  xlarge: 1.3,
};

export const THEMES: ThemeInfo[] = [
  {
    id: 'cyberpunk',
    name: '賽博朋克',
    description: '深紫黑底，青色+粉色霓虹，電子風格',
    previewColors: ['hsl(240, 25%, 5%)', 'hsl(180, 100%, 55%)', 'hsl(320, 100%, 60%)'],
  },
  {
    id: 'starry',
    name: '星空宇宙',
    description: '深藍黑底，藍白+金色星光，宇宙風格',
    previewColors: ['hsl(220, 40%, 8%)', 'hsl(210, 80%, 60%)', 'hsl(45, 100%, 65%)'],
  },
  {
    id: 'ancient',
    name: '古風武俠',
    description: '米黃宣紙底，朱紅+墨黑，水墨風格',
    previewColors: ['hsl(40, 30%, 92%)', 'hsl(0, 70%, 45%)', 'hsl(0, 0%, 15%)'],
  },
  {
    id: 'magic',
    name: '奇幻魔法',
    description: '深紫底，紫色+金色魔法光，奇幻風格',
    previewColors: ['hsl(260, 30%, 12%)', 'hsl(270, 80%, 65%)', 'hsl(45, 100%, 60%)'],
  },
  {
    id: 'ocean',
    name: '海洋深藍',
    description: '深藍底，青色+白色浪花，海洋風格',
    previewColors: ['hsl(210, 60%, 10%)', 'hsl(190, 80%, 55%)', 'hsl(200, 30%, 90%)'],
  },
  {
    id: 'steampunk',
    name: '蒸汽朋克',
    description: '古銅黃底，銹紅+黃銅色，工業齒輪風格',
    previewColors: ['#b87333', '#d4a574', '#3d2817'],
  },
  {
    id: 'wasteland',
    name: '末日廢土',
    description: '荒漠灰底，土黃+鐵鏽色，廢墟求生風格',
    previewColors: ['#6b5b4f', '#8b7355', '#c9a86c'],
  },
  {
    id: 'japanese',
    name: '日式和風',
    description: '米白紙底，櫻花粉+墨黑色，和風優雅風格',
    previewColors: ['#ffb7c5', '#2c2c2c', '#fef0f0'],
  },
  {
    id: 'christmas',
    name: '聖誕節',
    description: '深綠底，聖誕紅+金色，歡樂節日風格',
    previewColors: ['#c41e3a', '#165b33', '#ffd700'],
  },
  {
    id: 'halloween',
    name: '萬聖節',
    description: '深紫黑底，南瓜橙+幽靈紫，詭異歡樂風格',
    previewColors: ['#ff7518', '#1a1a2e', '#8b5cf6'],
  },
  {
    id: 'neon-tokyo',
    name: '霓虹東京',
    description: '深紫黑底，粉紫+青藍，日式賽博霓虹招牌風格',
    previewColors: ['#ff2d95', '#00e5ff', '#0d0221', '#9d4edd'],
  },
  {
    id: 'wasteland-wild',
    name: '廢土荒野',
    description: '髒褐底，橙紅+暗黃，後啟示錄廢土風格',
    previewColors: ['#ff5722', '#ffb300', '#1a0f0a', '#e65100'],
  },
  {
    id: 'space-station',
    name: '太空站',
    description: '深黑藍底，銀白+冰藍，宇宙空間站冷感風格',
    previewColors: ['#e0e6ed', '#1a2a6c', '#050a14', '#4fc3f7'],
  },
  {
    id: 'virtual-reality',
    name: '虛擬實境',
    description: '純黑底，螢光綠+暗綠，矩陣代碼雨風格',
    previewColors: ['#00ff41', '#000000', '#1b5e20', '#76ff03'],
  },
];

function getInitialColorblind(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(COLORBLIND_KEY);
    return saved === 'true';
  }
  return false;
}

function getInitialFontSize(): 'small' | 'normal' | 'large' | 'xlarge' {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(FONT_SIZE_KEY);
    if (saved === 'small' || saved === 'normal' || saved === 'large' || saved === 'xlarge') {
      return saved;
    }
  }
  return 'normal';
}

function getInitialAnimationEnabled(): boolean {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(ANIMATION_KEY);
    if (saved !== null) {
      return saved === 'true';
    }
  }
  return true;
}

function getInitialTheme(): ThemeId {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (
      saved === 'cyberpunk' ||
      saved === 'starry' ||
      saved === 'ancient' ||
      saved === 'magic' ||
      saved === 'ocean' ||
      saved === 'steampunk' ||
      saved === 'wasteland' ||
      saved === 'japanese' ||
      saved === 'christmas' ||
      saved === 'halloween' ||
      saved === 'neon-tokyo' ||
      saved === 'wasteland-wild' ||
      saved === 'space-station' ||
      saved === 'virtual-reality'
    ) {
      return saved as ThemeId;
    }
  }
  return 'cyberpunk';
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeId>(getInitialTheme);
  const [colorblindMode, setColorblindModeState] = useState<boolean>(getInitialColorblind);
  const [fontSize, setFontSizeState] = useState<'small' | 'normal' | 'large' | 'xlarge'>(getInitialFontSize);
  const [animationEnabled, setAnimationEnabledState] = useState<boolean>(getInitialAnimationEnabled);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    if (colorblindMode) {
      document.documentElement.setAttribute('data-colorblind', 'true');
    } else {
      document.documentElement.removeAttribute('data-colorblind');
    }
    localStorage.setItem(COLORBLIND_KEY, String(colorblindMode));
  }, [colorblindMode]);

  useEffect(() => {
    const scale = FONT_SCALE_MAP[fontSize];
    document.documentElement.style.setProperty('--font-scale', String(scale));
    localStorage.setItem(FONT_SIZE_KEY, fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.setAttribute('data-animation', animationEnabled ? 'on' : 'off');
    localStorage.setItem(ANIMATION_KEY, String(animationEnabled));
  }, [animationEnabled]);

  const setTheme = (newTheme: ThemeId) => {
    setThemeState(newTheme);
  };

  const setColorblindMode = (enabled: boolean) => {
    setColorblindModeState(enabled);
  };

  const setFontSize = (size: 'small' | 'normal' | 'large' | 'xlarge') => {
    setFontSizeState(size);
  };

  const setAnimationEnabled = (enabled: boolean) => {
    setAnimationEnabledState(enabled);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colorblindMode, setColorblindMode, fontSize, setFontSize, animationEnabled, setAnimationEnabled }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
