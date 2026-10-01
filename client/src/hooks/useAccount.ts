import { useCallback, useEffect, useState } from 'react';
import { logger } from '@lark-apaas/client-toolkit/logger';
import type { AccountProfile, UpdateProfileRequest } from '@shared/api.interface';
import { accountApi, getToken, setToken, clearToken } from '@client/src/api/account';

const NICKNAME_KEY = 'cyber_monopoly_nickname';

type Subscriber = (state: AccountState) => void;

interface AccountState {
  account: AccountProfile | null;
  isLoading: boolean;
  error: string | null;
}

let globalState: AccountState = {
  account: null,
  isLoading: false,
  error: null,
};

const subscribers = new Set<Subscriber>();

function notify(): void {
  for (const sub of subscribers) {
    sub(globalState);
  }
}

function setState(partial: Partial<AccountState>): void {
  globalState = { ...globalState, ...partial };
  notify();
}

let initialized = false;

async function initAccount(): Promise<void> {
  if (initialized) return;
  initialized = true;

  const token = getToken();
  if (!token) {
    setState({ isLoading: false });
    return;
  }

  setState({ isLoading: true, error: null });
  try {
    const account = await accountApi.getMe();
    setState({ account, isLoading: false, error: null });
  } catch (err) {
    logger.error('Failed to fetch account profile', { error: err });
    clearToken();
    setState({ account: null, isLoading: false, error: '登入驗證失敗，請重新登入' });
  }
}

export function useAccount() {
  const [state, setStateLocal] = useState<AccountState>(globalState);

  useEffect(() => {
    const sub: Subscriber = (s) => setStateLocal(s);
    subscribers.add(sub);

    if (!initialized) {
      void initAccount();
    }

    return () => {
      subscribers.delete(sub);
    };
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<AccountProfile> => {
    setState({ isLoading: true, error: null });
    try {
      const result = await accountApi.login(username, password);
      setToken(result.token);
      setState({ account: result.account, isLoading: false, error: null });
      return result.account;
    } catch (err) {
      const message = err instanceof Error ? err.message : '登入失敗';
      setState({ isLoading: false, error: message });
      throw err;
    }
  }, []);

  const register = useCallback(
    async (username: string, password: string, nickname: string): Promise<AccountProfile> => {
      setState({ isLoading: true, error: null });
      try {
        const result = await accountApi.register(username, password, nickname);
        setToken(result.token);
        setState({ account: result.account, isLoading: false, error: null });
        return result.account;
      } catch (err) {
        const message = err instanceof Error ? err.message : '註冊失敗';
        setState({ isLoading: false, error: message });
        throw err;
      }
    },
    [],
  );

  const logout = useCallback((): void => {
    clearToken();
    setState({ account: null, isLoading: false, error: null });
  }, []);

  const refreshProfile = useCallback(async (): Promise<void> => {
    const token = getToken();
    if (!token) return;
    setState({ isLoading: true, error: null });
    try {
      const account = await accountApi.getMe();
      setState({ account, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : '刷新失敗';
      setState({ isLoading: false, error: message });
    }
  }, []);

  const updateProfile = useCallback(async (patch: UpdateProfileRequest): Promise<void> => {
    setState({ isLoading: true, error: null });
    try {
      const account = await accountApi.updateProfile(patch);
      setState({ account, isLoading: false, error: null });
    } catch (err) {
      const message = err instanceof Error ? err.message : '更新失敗';
      setState({ isLoading: false, error: message });
      throw err;
    }
  }, []);

  const oauthLogin = useCallback(
    async (token: string): Promise<AccountProfile> => {
      setState({ isLoading: true, error: null });
      try {
        setToken(token);
        const account = await accountApi.getMe();
        setState({ account, isLoading: false, error: null });
        return account;
      } catch (err) {
        clearToken();
        const message = err instanceof Error ? err.message : '第三方登入失敗';
        setState({ account: null, isLoading: false, error: message });
        throw err;
      }
    },
    [],
  );

  return {
    account: state.account,
    isLoading: state.isLoading,
    error: state.error,
    isLoggedIn: !!state.account,
    login,
    register,
    logout,
    refreshProfile,
    updateProfile,
    oauthLogin,
  };
}

// 遊客暱稱工具
export function getGuestNickname(): string | null {
  try {
    return localStorage.getItem(NICKNAME_KEY);
  } catch {
    return null;
  }
}

export function setGuestNickname(name: string): void {
  try {
    localStorage.setItem(NICKNAME_KEY, name);
  } catch {
    // ignore
  }
}

export function hasGuestNickname(): boolean {
  return !!getGuestNickname();
}
