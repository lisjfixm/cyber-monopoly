import React, { useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { OAuthProvider } from '@shared/api.interface';
import { startOAuthLogin } from '@client/src/api/oauth';

interface OAuthButtonConfig {
  provider: OAuthProvider;
  label: string;
  brandColor: string;
  glowColor: string;
  bgColor: string;
  textColor: string;
  icon: React.ReactElement;
}

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M5.26620003,9.76452941 C6.19878754,6.93863203 8.85444915,4.90909091 12,4.90909091 C13.6909091,4.90909091 15.2181818,5.50909091 16.4181818,6.49090909 L19.9090909,3 C17.7818182,1.14545455 15.0545455,0 12,0 C7.27006974,0 3.1977497,2.69829785 1.23999023,6.65002441 L5.26620003,9.76452941 Z"
    />
    <path
      fill="#34A853"
      d="M16.0407269,18.0125889 C14.9509167,18.7163016 13.5660892,19.0909091 12,19.0909091 C8.86648613,19.0909091 6.21911939,17.076871 5.27698177,14.2678769 L1.23746264,17.3349879 C3.19279051,21.2936293 7.26500293,24 12,24 C14.9328362,24 17.7353462,22.9573905 19.834192,20.9995801 L16.0407269,18.0125889 Z"
    />
    <path
      fill="#4A90E2"
      d="M19.834192,20.9995801 C22.0291676,18.9520994 23.4545455,15.903663 23.4545455,12 C23.4545455,11.2909091 23.3454545,10.5272727 23.1818182,9.81818182 L12,9.81818182 L12,14.4545455 L18.4363636,14.4545455 C18.1187732,16.013626 17.2662994,17.2212117 16.0407269,18.0125889 L19.834192,20.9995801 Z"
    />
    <path
      fill="#FBBC05"
      d="M5.27698177,14.2678769 C5.03832634,13.556323 4.90909091,12.7937589 4.90909091,12 C4.90909091,11.2182781 5.03443647,10.4668121 5.26620003,9.76452941 L1.23999023,6.65002441 C0.43658717,8.26043162 0,10.0753848 0,12 C0,13.9195484 0.444780743,15.7301709 1.23746264,17.3349879 L5.27698177,14.2678769 Z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);

const GitHubIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
  </svg>
);

const PROVIDER_CONFIGS: OAuthButtonConfig[] = [
  {
    provider: 'google',
    label: '使用 Google 繼續',
    brandColor: 'hsl(210, 100%, 60%)',
    glowColor: 'rgba(66, 133, 244, 0.5)',
    bgColor: 'rgba(255, 255, 255, 0.04)',
    textColor: 'hsl(210, 20%, 95%)',
    icon: <GoogleIcon />,
  },
  {
    provider: 'apple',
    label: '使用 Apple 繼續',
    brandColor: 'hsl(0, 0%, 85%)',
    glowColor: 'rgba(200, 200, 200, 0.4)',
    bgColor: 'rgba(0, 0, 0, 0.5)',
    textColor: 'hsl(0, 0%, 92%)',
    icon: <AppleIcon />,
  },
  {
    provider: 'github',
    label: '使用 GitHub 繼續',
    brandColor: 'hsl(220, 15%, 70%)',
    glowColor: 'rgba(140, 150, 180, 0.4)',
    bgColor: 'rgba(30, 30, 40, 0.6)',
    textColor: 'hsl(220, 20%, 92%)',
    icon: <GitHubIcon />,
  },
];

interface OAuthLoginButtonsProps {
  disabled?: boolean;
}

export default function OAuthLoginButtons({ disabled = false }: OAuthLoginButtonsProps) {
  const [loadingProvider, setLoadingProvider] = useState<OAuthProvider | null>(null);

  const handleOAuthClick = async (provider: OAuthProvider): Promise<void> => {
    if (disabled || loadingProvider) return;
    setLoadingProvider(provider);
    try {
      const url = await startOAuthLogin(provider);
      // eslint-disable-next-line no-restricted-syntax
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : '第三方登入啟動失敗';
      logger.error('OAuth login failed to start', { provider, error: err });
      setLoadingProvider(null);
      throw new Error(message);
    }
  };

  return (
    <div className="space-y-3">
      {PROVIDER_CONFIGS.map(config => (
        <button
          key={config.provider}
          type="button"
          disabled={disabled || loadingProvider !== null}
          onClick={() => { void handleOAuthClick(config.provider); }}
          className="w-full py-2.5 text-sm font-cyber tracking-wide transition-all flex items-center justify-center gap-3 rounded-sm"
          style={{
            border: `1px solid ${config.brandColor}`,
            color: config.textColor,
            background: config.bgColor,
            boxShadow: `0 0 10px ${config.glowColor}, inset 0 0 8px ${config.glowColor}`,
            textShadow: `0 0 6px ${config.glowColor}`,
            cursor: disabled || loadingProvider ? 'not-allowed' : 'pointer',
            opacity: disabled || loadingProvider ? 0.5 : 1,
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>{config.icon}</span>
          <span>{loadingProvider === config.provider ? '跳轉中...' : config.label}</span>
        </button>
      ))}
    </div>
  );
}
