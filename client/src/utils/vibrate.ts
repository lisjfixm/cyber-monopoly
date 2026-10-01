/**
 * 震動回饋工具函式
 * 基於 navigator.vibrate API，在不支援的裝置上静默失效。
 */

export function vibrate(pattern: number | number[] = 50): void {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try {
      navigator.vibrate(pattern);
    } catch {
      /* noop */
    }
  }
}

export const vibrationPatterns = {
  light: 20,
  medium: 50,
  heavy: [50, 30, 50],
  win: [50, 50, 100, 50, 150],
  lose: [100, 50, 100, 50, 200],
};
