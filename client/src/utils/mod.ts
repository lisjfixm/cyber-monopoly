import type { Mod } from '@shared/api.interface';

const MODS_STORAGE_KEY = 'cyber_monopoly_mods';
const ENABLED_MODS_STORAGE_KEY = 'cyber_monopoly_mods_enabled';

export function encodeModToCode(mod: Mod): string {
  try {
    return btoa(encodeURIComponent(JSON.stringify(mod)));
  } catch {
    return '';
  }
}

export function decodeModFromCode(code: string): Mod | null {
  try {
    const decoded = decodeURIComponent(atob(code.trim()));
    const parsed = JSON.parse(decoded);
    if (isValidMod(parsed)) {
      return parsed as Mod;
    }
    return null;
  } catch {
    return null;
  }
}

export function isValidMod(data: unknown): data is Mod {
  if (typeof data !== 'object' || data === null) return false;
  const mod = data as Record<string, unknown>;
  if (typeof mod.id !== 'string' || mod.id.length === 0) return false;
  if (typeof mod.name !== 'string' || mod.name.length === 0) return false;
  if (typeof mod.description !== 'string') return false;
  if (typeof mod.version !== 'string') return false;
  if (typeof mod.author !== 'string') return false;
  if (mod.cards !== undefined) {
    if (!Array.isArray(mod.cards)) return false;
    for (const card of mod.cards) {
      if (typeof card !== 'object' || card === null) return false;
      const c = card as Record<string, unknown>;
      if (typeof c.id !== 'string' || typeof c.name !== 'string' || typeof c.type !== 'string') return false;
    }
  }
  if (mod.properties !== undefined) {
    if (!Array.isArray(mod.properties)) return false;
    for (const prop of mod.properties) {
      if (typeof prop !== 'object' || prop === null) return false;
      const p = prop as Record<string, unknown>;
      if (typeof p.id !== 'string' || typeof p.name !== 'string' || typeof p.type !== 'string') return false;
    }
  }
  if (mod.rules !== undefined) {
    if (mod.rules === null || typeof mod.rules !== 'object') return false;
  }
  return true;
}

// ---- Storage helpers ----

export function loadInstalledMods(): Mod[] {
  try {
    const raw = localStorage.getItem(MODS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((m: unknown) => isValidMod(m)) as Mod[];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveInstalledMods(mods: Mod[]): void {
  try {
    const seen = new Set<string>();
    const dedup = mods.filter((m: Mod) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
    localStorage.setItem(MODS_STORAGE_KEY, JSON.stringify(dedup));
  } catch {
    // ignore storage errors
  }
}

export function loadEnabledModIds(): string[] {
  try {
    const raw = localStorage.getItem(ENABLED_MODS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((id: unknown) => typeof id === 'string') as string[];
    }
    return [];
  } catch {
    return [];
  }
}

export function saveEnabledModIds(ids: string[]): void {
  try {
    localStorage.setItem(ENABLED_MODS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // ignore storage errors
  }
}

export function loadEnabledMods(): Mod[] {
  const installed = loadInstalledMods();
  const enabledIds = loadEnabledModIds();
  const idSet = new Set(enabledIds);
  return installed.filter((m: Mod) => idSet.has(m.id));
}
