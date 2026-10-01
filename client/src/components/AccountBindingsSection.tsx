import React, { useState, useEffect } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import { AlertTriangle, Check, Loader2, Link2, XCircle } from 'lucide-react';
import type {
  OAuthProvider,
  OAuthBinding,
  OAuthBindingsResponse,
} from '@shared/api.interface';
import {
  getOAuthBindings,
  getOAuthLinkUrl,
  unbindOAuthProvider,
  getOAuthLinkError,
  getOAuthLinkSuccess,
} from '@client/src/api/oauth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@client/src/components/ui/dialog';

interface ProviderRowConfig {
  provider: OAuthProvider;
  label: string;
  brandColor: string;
  glowColor: string;
  bgColor: string;
  textColor: string;
}

const PROVIDER_CONFIGS: ProviderRowConfig[] = [
  {
    provider: 'google',
    label: 'Google',
    brandColor: 'hsl(210, 100%, 60%)',
    glowColor: 'rgba(66, 133, 244, 0.5)',
    bgColor: 'rgba(255, 255, 255, 0.04)',
    textColor: 'hsl(210, 20%, 95%)',
  },
  {
    provider: 'apple',
    label: 'Apple',
    brandColor: 'hsl(0, 0%, 85%)',
    glowColor: 'rgba(200, 200, 200, 0.4)',
    bgColor: 'rgba(0, 0, 0, 0.5)',
    textColor: 'hsl(0, 0%, 92%)',
  },
  {
    provider: 'github',
    label: 'GitHub',
    brandColor: 'hsl(220, 15%, 70%)',
    glowColor: 'rgba(140, 150, 180, 0.4)',
    bgColor: 'rgba(30, 30, 40, 0.6)',
    textColor: 'hsl(220, 20%, 92%)',
  },
];

interface AccountBindingsSectionProps {
  isLoggedIn: boolean;
}

export default function AccountBindingsSection({
  isLoggedIn,
}: AccountBindingsSectionProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [bindings, setBindings] = useState<OAuthBinding[]>([]);
  const [hasPassword, setHasPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [linkProvider, setLinkProvider] = useState<OAuthProvider | null>(null);
  const [unbindDialog, setUnbindDialog] = useState<OAuthProvider | null>(null);
  const [unbinding, setUnbinding] = useState<boolean>(false);
  const [unbindError, setUnbindError] = useState<string>('');
  const [linkSuccess, setLinkSuccess] = useState<string>('');

  const loadBindings = async (): Promise<void> => {
    if (!isLoggedIn) return;
    setLoading(true);
    setError('');
    try {
      const result: OAuthBindingsResponse = await getOAuthBindings();
      setBindings(result.bindings);
      setHasPassword(result.hasPassword);
    } catch (err) {
      const message = err instanceof Error ? err.message : '載入失敗';
      setError(message);
      logger.error('Failed to load OAuth bindings', { error: err });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      void loadBindings();
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!isLoggedIn) return;
    const linkError = getOAuthLinkError();
    if (linkError) {
      setError(linkError);
    }
    if (getOAuthLinkSuccess()) {
      setLinkSuccess('第三方帳號綁定成功');
      setTimeout(() => setLinkSuccess(''), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleLink = async (provider: OAuthProvider): Promise<void> => {
    if (linkProvider) return;
    setLinkProvider(provider);
    setError('');
    try {
      const url = await getOAuthLinkUrl(provider);
      // eslint-disable-next-line no-restricted-syntax
      window.location.href = url;
    } catch (err) {
      const message = err instanceof Error ? err.message : '取得授權網址失敗';
      setError(message);
      logger.error('Failed to get OAuth link URL', { provider, error: err });
      setLinkProvider(null);
    }
  };

  const handleUnbindConfirm = async (): Promise<void> => {
    if (!unbindDialog) return;
    setUnbinding(true);
    setUnbindError('');
    try {
      await unbindOAuthProvider(unbindDialog);
      setUnbindDialog(null);
      await loadBindings();
    } catch (err) {
      const message = err instanceof Error ? err.message : '解除綁定失敗';
      setUnbindError(message);
      logger.error('Failed to unbind OAuth provider', { provider: unbindDialog, error: err });
    } finally {
      setUnbinding(false);
    }
  };

  const isProviderBound = (provider: OAuthProvider): OAuthBinding | undefined =>
    bindings.find((b: OAuthBinding) => b.provider === provider);

  if (!isLoggedIn) {
    return (
      <div
        className="cyber-card p-4"
        style={{ opacity: 0.6 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Link2 size={18} style={{ color: 'var(--text-secondary)' }} />
          <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--text-secondary)' }}>
            第三方帳號綁定
          </h3>
        </div>
        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
          請先登入後再進行第三方帳號綁定
        </p>
      </div>
    );
  }

  return (
    <div className="cyber-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link2 size={18} style={{ color: 'var(--purple)' }} />
          <h3 className="font-cyber text-sm tracking-wider" style={{ color: 'var(--purple)' }}>
            第三方帳號綁定
          </h3>
        </div>
        {hasPassword && (
          <span className="text-xs font-cyber flex items-center gap-1" style={{ color: 'var(--green)' }}>
            <Check size={12} />
            密碼登入已啟用
          </span>
        )}
      </div>

      {error && (
        <div
          className="mb-3 p-2 text-xs font-cyber flex items-center gap-2"
          style={{
            border: '1px solid var(--red)',
            color: 'var(--red)',
            background: 'rgba(255, 0, 0, 0.08)',
          }}
        >
          <AlertTriangle size={14} />
          {error}
        </div>
      )}

      {linkSuccess && (
        <div
          className="mb-3 p-2 text-xs font-cyber flex items-center gap-2"
          style={{
            border: '1px solid var(--green)',
            color: 'var(--green)',
            background: 'rgba(0, 255, 128, 0.08)',
          }}
        >
          <Check size={14} />
          {linkSuccess}
        </div>
      )}

      {loading && (
        <div className="text-center py-4 font-cyber text-xs" style={{ color: 'var(--text-secondary)' }}>
          <Loader2 size={16} className="animate-spin inline mr-2" />
          載入中...
        </div>
      )}

      {!loading && (
        <div className="space-y-2">
          {PROVIDER_CONFIGS.map(config => {
            const bound = isProviderBound(config.provider);
            const isLinking = linkProvider === config.provider;
            return (
              <div
                key={config.provider}
                className="flex items-center justify-between p-3"
                style={{
                  border: `1px solid ${config.brandColor}`,
                  backgroundColor: config.bgColor,
                  boxShadow: `0 0 8px ${config.glowColor}`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm font-cyber tracking-wide"
                    style={{ color: config.textColor, textShadow: `0 0 6px ${config.glowColor}` }}
                  >
                    {config.label}
                  </span>
                  {bound && (
                    <span className="text-xs font-cyber flex items-center gap-1" style={{ color: 'var(--green)' }}>
                      <Check size={12} />
                      {bound.displayName || bound.email || '已綁定'}
                    </span>
                  )}
                </div>
                {bound ? (
                  <button
                    type="button"
                    onClick={() => {
                      setUnbindDialog(config.provider);
                      setUnbindError('');
                    }}
                    className="px-3 py-1 text-xs font-cyber tracking-wider transition-all rounded-sm"
                    style={{
                      border: '1px solid var(--red)',
                      color: 'var(--red)',
                      background: 'rgba(255, 0, 0, 0.08)',
                      cursor: 'pointer',
                    }}
                  >
                    解除綁定
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void handleLink(config.provider)}
                    disabled={isLinking}
                    className="px-3 py-1 text-xs font-cyber tracking-wider transition-all rounded-sm"
                    style={{
                      border: `1px solid ${config.brandColor}`,
                      color: config.textColor,
                      background: 'transparent',
                      cursor: isLinking ? 'not-allowed' : 'pointer',
                      opacity: isLinking ? 0.6 : 1,
                    }}
                  >
                    {isLinking ? '跳轉中...' : '關聯'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="mt-3 text-xs font-cyber text-center" style={{ color: 'var(--text-secondary)' }}>
        綁定後可用第三方帳號快速登入
      </p>

      {/* 解除綁定確認彈窗 */}
      <Dialog open={!!unbindDialog} onOpenChange={(open: boolean) => { if (!open) setUnbindDialog(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>解除第三方綁定</DialogTitle>
            <DialogDescription>
              確定要解除 {unbindDialog ? PROVIDER_CONFIGS.find(c => c.provider === unbindDialog)?.label : ''} 帳號的綁定嗎？
              解除後將無法再使用該第三方帳號登入。
            </DialogDescription>
          </DialogHeader>
          {unbindError && (
            <div
              className="p-2 text-xs font-cyber flex items-center gap-2"
              style={{
                border: '1px solid var(--red)',
                color: 'var(--red)',
                background: 'rgba(255, 0, 0, 0.08)',
              }}
            >
              <XCircle size={14} />
              {unbindError}
            </div>
          )}
          <DialogFooter>
            <button
              type="button"
              onClick={() => setUnbindDialog(null)}
              className="px-4 py-2 text-sm font-cyber tracking-wider"
              style={{
                border: '1px solid var(--text-secondary)',
                color: 'var(--text-secondary)',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              取消
            </button>
            <button
              type="button"
              onClick={handleUnbindConfirm}
              disabled={unbinding}
              className="px-4 py-2 text-sm font-cyber tracking-wider"
              style={{
                border: '1px solid var(--red)',
                color: 'var(--red)',
                background: 'rgba(255, 0, 0, 0.1)',
                cursor: unbinding ? 'not-allowed' : 'pointer',
                opacity: unbinding ? 0.6 : 1,
                boxShadow: '0 0 10px rgba(255, 0, 0, 0.3)',
              }}
            >
              {unbinding ? '處理中...' : '確定解除'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
