function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, testKey);
    window.localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const STORAGE_AVAILABLE = isLocalStorageAvailable();
const memoryStore: Record<string, string> = {};

export function safeGetItem(key: string): string | null {
  if (STORAGE_AVAILABLE) {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return memoryStore[key] ?? null;
    }
  }
  return memoryStore[key] ?? null;
}

export function safeSetItem(key: string, value: string): boolean {
  if (STORAGE_AVAILABLE) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch {
      memoryStore[key] = value;
      return false;
    }
  }
  memoryStore[key] = value;
  return false;
}

export function safeRemoveItem(key: string): void {
  if (STORAGE_AVAILABLE) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      delete memoryStore[key];
    }
  } else {
    delete memoryStore[key];
  }
}

export function safeGetJSON<T>(key: string, defaultValue: T): T {
  const raw = safeGetItem(key);
  if (!raw) return defaultValue;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return defaultValue;
  }
}

export function safeSetJSON(key: string, value: unknown): boolean {
  try {
    return safeSetItem(key, JSON.stringify(value));
  } catch {
    return false;
  }
}
