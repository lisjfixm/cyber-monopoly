import { useCallback, useEffect, useRef, useState } from 'react';
import { monopolyApi } from '@client/src/api/monopoly';
import type { UserSaveData, UserSettings, MatchHistoryItem } from '@shared/api.interface';

const ENABLED_KEY = 'cyber_cloud_save_enabled';
const LAST_SYNCED_KEY = 'cyber_cloud_save_last_synced';

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'conflict' | 'error';

export interface UseCloudSaveReturn {
  syncStatus: SyncStatus;
  lastSyncedAt: string | null;
  enabled: boolean;
  enableCloudSave: () => void;
  disableCloudSave: () => void;
  syncNow: () => Promise<void>;
  resolveConflict: (choose: 'local' | 'cloud') => Promise<void>;
  errorMessage: string;
}

// ---- Local storage helpers ----

function readEnabled(): boolean {
  try {
    return localStorage.getItem(ENABLED_KEY) === '1';
  } catch {
    return false;
  }
}

function writeEnabled(value: boolean): void {
  try {
    localStorage.setItem(ENABLED_KEY, value ? '1' : '0');
  } catch {
    // ignore
  }
}

function readLastSynced(): string | null {
  try {
    return localStorage.getItem(LAST_SYNCED_KEY);
  } catch {
    return null;
  }
}

function writeLastSynced(iso: string): void {
  try {
    localStorage.setItem(LAST_SYNCED_KEY, iso);
  } catch {
    // ignore
  }
}

// ---- Collect local save data from various modules ----

function collectLocalSaveData(): UserSaveData {
  const achievements: string[] = (() => {
    try {
      const raw = localStorage.getItem('monopoly_achievements');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as string[];
      }
    } catch {
      // ignore
    }
    return [];
  })();

  const settings: UserSettings = (() => {
    try {
      const raw = localStorage.getItem('monopoly_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) return parsed as UserSettings;
      }
    } catch {
      // ignore
    }
    return {};
  })();

  const skins = (() => {
    try {
      const raw = localStorage.getItem('monopoly_skins');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) return parsed as { pawn?: string; dice?: string };
      }
    } catch {
      // ignore
    }
    return {};
  })();

  const battlePass = (() => {
    try {
      const raw = localStorage.getItem('monopoly_battlepass');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return {
      level: 1,
      exp: 0,
      totalExp: 0,
      premium: false,
      claimedFree: [] as number[],
      claimedPremium: [] as number[],
      season: 's1',
    };
  })();

  const dailyChallenge = (() => {
    try {
      const raw = localStorage.getItem('monopoly_daily_challenge');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object' && parsed !== null) return parsed;
      }
    } catch {
      // ignore
    }
    return {
      id: '',
      type: 'fate_only' as const,
      name: '',
      description: '',
      rules: [] as string[],
      reward: { exp: 0, coins: 0 },
    };
  })();

  const matchHistory: MatchHistoryItem[] = (() => {
    try {
      const raw = localStorage.getItem('monopoly_match_history');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as MatchHistoryItem[];
      }
    } catch {
      // ignore
    }
    return [];
  })();

  const localUpdated = readLastSynced() ?? new Date(0).toISOString();

  return {
    achievements,
    settings,
    skins,
    battlePass,
    dailyChallenge,
    matchHistory,
    updatedAt: localUpdated,
  };
}

function applySaveDataToLocal(save: UserSaveData): void {
  try {
    localStorage.setItem('monopoly_achievements', JSON.stringify(save.achievements));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem('monopoly_settings', JSON.stringify(save.settings));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem('monopoly_skins', JSON.stringify(save.skins));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem('monopoly_battlepass', JSON.stringify(save.battlePass));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem('monopoly_daily_challenge', JSON.stringify(save.dailyChallenge));
  } catch {
    // ignore
  }
  try {
    localStorage.setItem('monopoly_match_history', JSON.stringify(save.matchHistory));
  } catch {
    // ignore
  }
}

// ---- Hook ----

export function useCloudSave(visitorId: string): UseCloudSaveReturn {
  const [enabled, setEnabled] = useState<boolean>(() => readEnabled());
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => readLastSynced());
  const [errorMessage, setErrorMessage] = useState<string>('');
  const conflictSaveRef = useRef<UserSaveData | null>(null);
  // 同步進行中旗標：避免自動同步與手動觸發併發造成重複上傳/競態覆寫
  const syncingRef = useRef<boolean>(false);

  const enableCloudSave = useCallback(() => {
    writeEnabled(true);
    setEnabled(true);
    setErrorMessage('');
  }, []);

  const disableCloudSave = useCallback(() => {
    writeEnabled(false);
    setEnabled(false);
    setSyncStatus('idle');
    setErrorMessage('');
    conflictSaveRef.current = null;
  }, []);

  const syncNow = useCallback(async () => {
    if (!visitorId) return;
    // 已有同步進行中，直接跳過，避免併發請求互相覆寫
    if (syncingRef.current) return;
    syncingRef.current = true;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      const localSave = collectLocalSaveData();
      const cloudSave = await monopolyApi.getSaveData(visitorId);

      if (!cloudSave) {
        // No cloud data — upload local
        const response = await monopolyApi.uploadSaveData(
          visitorId,
          { ...localSave, updatedAt: new Date().toISOString() },
          localSave.updatedAt,
        );
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
        setSyncStatus('synced');
        return;
      }

      // Compare timestamps
      const localTime = new Date(localSave.updatedAt).getTime();
      const cloudTime = new Date(cloudSave.updatedAt).getTime();

      if (localTime > cloudTime) {
        // Local is newer — upload
        const response = await monopolyApi.uploadSaveData(
          visitorId,
          { ...localSave, updatedAt: new Date().toISOString() },
          cloudSave.updatedAt,
        );
        if (response.conflict) {
          conflictSaveRef.current = response.saveData;
          setSyncStatus('conflict');
          return;
        }
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
        setSyncStatus('synced');
      } else if (cloudTime > localTime) {
        // Cloud is newer — detect conflict
        conflictSaveRef.current = cloudSave;
        setSyncStatus('conflict');
      } else {
        // Same — already synced
        writeLastSynced(cloudSave.updatedAt);
        setLastSyncedAt(cloudSave.updatedAt);
        setSyncStatus('synced');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : '同步失敗';
      setErrorMessage(message);
      setSyncStatus('error');
    } finally {
      syncingRef.current = false;
    }
  }, [visitorId]);

  const resolveConflict = useCallback(async (choose: 'local' | 'cloud') => {
    if (!visitorId) return;
    const conflictSave = conflictSaveRef.current;
    setSyncStatus('syncing');
    setErrorMessage('');
    try {
      if (choose === 'local') {
        const localSave = collectLocalSaveData();
        const response = await monopolyApi.uploadSaveData(
          visitorId,
          { ...localSave, updatedAt: new Date().toISOString() },
          conflictSave?.updatedAt ?? new Date(0).toISOString(),
        );
        writeLastSynced(response.updatedAt);
        setLastSyncedAt(response.updatedAt);
      } else {
        // Choose cloud — apply to local
        if (conflictSave) {
          applySaveDataToLocal(conflictSave);
          writeLastSynced(conflictSave.updatedAt);
          setLastSyncedAt(conflictSave.updatedAt);
        }
      }
      conflictSaveRef.current = null;
      setSyncStatus('synced');
    } catch (err) {
      const message = err instanceof Error ? err.message : '同步失敗';
      setErrorMessage(message);
      setSyncStatus('error');
    }
  }, [visitorId]);

  // Auto-sync when enabled and visitorId is available
  useEffect(() => {
    if (enabled && visitorId) {
      void syncNow();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, visitorId]);

  return {
    syncStatus,
    lastSyncedAt,
    enabled,
    enableCloudSave,
    disableCloudSave,
    syncNow,
    resolveConflict,
    errorMessage,
  };
}
