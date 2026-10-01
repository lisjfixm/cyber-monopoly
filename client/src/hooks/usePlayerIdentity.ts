import { useCallback, useEffect, useRef, useState } from 'react';
import type { PlayerProfile } from '@shared/api.interface';
import { ranking } from '@client/src/api';

const VISITOR_ID_KEY = 'monopoly_visitor_id';
const NICKNAME_KEY = 'monopoly_nickname';

function generateVisitorId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('');
}

interface PlayerIdentity {
  visitorId: string;
  nickname: string;
  playerProfile: PlayerProfile | null;
  loading: boolean;
  setNickname: (name: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

export function usePlayerIdentity(): PlayerIdentity {
  const [visitorId, setVisitorId] = useState<string>('');
  const [nickname, setNicknameState] = useState<string>('');
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  // 請求序號：避免快速連續呼叫 refreshProfile / setNickname 時，舊回應覆蓋新狀態
  const reqSeqRef = useRef(0);

  // Initialize from localStorage
  useEffect(() => {
    try {
      let storedId = localStorage.getItem(VISITOR_ID_KEY);
      if (!storedId) {
        storedId = generateVisitorId();
        localStorage.setItem(VISITOR_ID_KEY, storedId);
      }
      setVisitorId(storedId);

      const storedNickname = localStorage.getItem(NICKNAME_KEY);
      if (storedNickname) {
        setNicknameState(storedNickname);
      }
    } catch {
      // localStorage unavailable - generate temp id
      const tempId = generateVisitorId();
      setVisitorId(tempId);
    }
  }, []);

  // Get or create player profile when visitorId is available
  const refreshProfile = useCallback(async () => {
    if (!visitorId) return;
    const seq = ++reqSeqRef.current;
    setLoading(true);
    try {
      const profile = await ranking.rankingApi.getOrCreatePlayer(visitorId, nickname || undefined);
      // 若已有更新的請求發出，捨棄這次過期回應
      if (seq !== reqSeqRef.current) return;
      setPlayerProfile(profile);
      if (profile.nickname) {
        setNicknameState(profile.nickname);
        try {
          localStorage.setItem(NICKNAME_KEY, profile.nickname);
        } catch {
          // ignore
        }
      }
    } catch {
      // Silently fail - profile may not be available yet
    } finally {
      if (seq === reqSeqRef.current) setLoading(false);
    }
  }, [visitorId, nickname]);

  // Initial load
  useEffect(() => {
    if (visitorId) {
      void refreshProfile();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visitorId]);

  const setNickname = useCallback(async (name: string) => {
    if (!visitorId) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed.length > 20) return;

    const seq = ++reqSeqRef.current;
    setLoading(true);
    try {
      const profile = await ranking.rankingApi.updateNickname(visitorId, trimmed);
      if (seq !== reqSeqRef.current) return;
      setPlayerProfile(profile);
      setNicknameState(trimmed);
      try {
        localStorage.setItem(NICKNAME_KEY, trimmed);
      } catch {
        // ignore
      }
    } catch {
      // 暱稱更新失敗：靜默處理，由呼叫端決定是否提示
    } finally {
      if (seq === reqSeqRef.current) setLoading(false);
    }
  }, [visitorId]);

  return {
    visitorId,
    nickname,
    playerProfile,
    loading,
    setNickname,
    refreshProfile,
  };
}
