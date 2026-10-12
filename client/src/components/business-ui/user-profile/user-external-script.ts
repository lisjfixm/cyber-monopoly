import { useEffect, useState } from 'react';

export type ExternalScriptStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface UseExternalScriptOptions {
  removeOnUnmount?: boolean;
  attributes?: Record<string, string>;
  nonce?: string;
  onloadCallback?: () => void;
}

/**
 * 在元件生命週期內按需注入外鏈指令碼（追加到 <body> 末尾），並返回載入狀態。
 * - 避免重複注入：如果頁面已存在同 src 的指令碼，直接標記為 ready。
 * - 支援 CSP：可透過 nonce 傳入。
 * - 可選清理：removeOnUnmount=true 時解除安裝時移除指令碼。
 */
export function useExternalScript(
  src: string,
  options: UseExternalScriptOptions = {},
): ExternalScriptStatus {
  const [status, setStatus] = useState<ExternalScriptStatus>('idle');

  useEffect(() => {
    if (!src) return;

    // 如果已經存在同 src 的指令碼，直接認為已就緒
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );
    if (existing) {
      queueMicrotask(() => {
        setStatus('ready');
      });
      return;
    }
    // 在 effect 中避免同步 setState，使用微任務排程，防止級聯渲染警告
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setStatus('loading');
    });
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    if (options.nonce) script.nonce = options.nonce;
    Object.entries(options.attributes ?? {}).forEach(([k, v]) => {
      script.setAttribute(k, v);
    });

    script.onload = () => {
      if (!cancelled) setStatus('ready');
      if (options.onloadCallback) {
        options.onloadCallback();
      }
    };

    script.onerror = () => {
      if (!cancelled) setStatus('error');
    };

    document.body.append(script);
    return () => {
      cancelled = true;
      if (options.removeOnUnmount) {
        script.remove();
      }
    };
  }, [options, src]);

  return status;
}
