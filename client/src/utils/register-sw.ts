import { logger } from '@lark-apaas/client-toolkit/logger';

export function registerServiceWorker(): void {
  if (typeof window === 'undefined') return;
  if (!('serviceWorker' in navigator)) return;

  // 只有在支持的环境中注册
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration: ServiceWorkerRegistration) => {
        logger.info({ message: `ServiceWorker registered: ${registration.scope}` });

        // 监听更新
        registration.addEventListener('updatefound', () => {
          logger.info({ message: 'New version downloading...' });
        });
      })
      .catch((error: Error) => {
        logger.warn({ message: `ServiceWorker registration failed: ${String(error)}` });
      });
  });
}

export function checkOnlineStatus(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}
