import { logger } from '@lark-apaas/client-toolkit/logger';
import type { ReplayData } from '@shared/api.interface';

const STORAGE_KEY = 'cyber_monopoly_shared_replays';

interface SharedReplayEntry {
  shareId: string;
  replay: ReplayData;
  createdAt: number;
}

/**
 * 生成短隨機分享 ID（6 位英數）
 */
function generateShareId(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i += 1) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function loadAllEntries(): SharedReplayEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is SharedReplayEntry =>
        typeof e === 'object' &&
        e !== null &&
        typeof (e as SharedReplayEntry).shareId === 'string' &&
        typeof (e as SharedReplayEntry).replay === 'object' &&
        (e as SharedReplayEntry).replay !== null,
    );
  } catch (err) {
    logger.error('Failed to load shared replays:', err instanceof Error ? err.message : String(err));
    return [];
  }
}

function saveAllEntries(entries: SharedReplayEntry[]): void {
  try {
    // 最多保留 20 筆
    const trimmed = entries.slice(0, 20);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch (err) {
    logger.error('Failed to save shared replays:', err instanceof Error ? err.message : String(err));
  }
}

/**
 * 將回放存入 localStorage，生成分享 ID
 * @returns 分享 ID
 */
export function uploadReplay(replayData: ReplayData): string {
  const entries = loadAllEntries();

  // 避免重複：如果已有相同 id 的回放，直接回傳既有 shareId
  const existing = entries.find((e) => e.replay.id === replayData.id);
  if (existing) {
    return existing.shareId;
  }

  const shareId = generateShareId();
  const newEntry: SharedReplayEntry = {
    shareId,
    replay: replayData,
    createdAt: Date.now(),
  };

  saveAllEntries([newEntry, ...entries]);
  return shareId;
}

/**
 * 根據分享 ID 取出回放
 */
export function getReplayByShareId(shareId: string): ReplayData | null {
  const entries = loadAllEntries();
  const found = entries.find((e) => e.shareId === shareId);
  return found ? found.replay : null;
}

/**
 * 產生帶 ?share=xxx 的 URL
 */
export function generateShareUrl(shareId: string): string {
  const url = new URL(window.location.href);
  const basePath = url.pathname.split('/').slice(0, -1).join('/');
  url.pathname = `${basePath}/replay`.replace(/\/+/g, '/');
  url.search = '';
  url.hash = '';
  url.searchParams.set('share', shareId);
  return url.toString();
}

/**
 * 從 URL 查詢參數讀取分享 ID
 */
export function getReplayFromUrl(): string | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('share');
  } catch {
    return null;
  }
}
