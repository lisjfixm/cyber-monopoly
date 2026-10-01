import { useState, useEffect, useCallback } from 'react';
import type { CustomGameRules } from '@shared/api.interface';

export interface CustomPreset {
  name: string;
  rules: CustomGameRules;
}

const PRESETS_KEY = 'monopoly_custom_presets';
const MAX_PRESETS = 3;

function loadPresetsFromStorage(): CustomPreset[] {
  try {
    const raw = localStorage.getItem(PRESETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_PRESETS);
    return [];
  } catch {
    return [];
  }
}

function savePresetsToStorage(presets: CustomPreset[]): void {
  try {
    localStorage.setItem(PRESETS_KEY, JSON.stringify(presets));
  } catch {
    // ignore
  }
}

export function useCustomPresets() {
  const [presets, setPresets] = useState<CustomPreset[]>([]);

  useEffect(() => {
    setPresets(loadPresetsFromStorage());
  }, []);

  const savePreset = useCallback((name: string, rules: CustomGameRules): boolean => {
    const trimmed = name.trim();
    if (!trimmed) return false;

    const current = loadPresetsFromStorage();
    // 同名覆盖
    const existingIdx = current.findIndex((p: CustomPreset) => p.name === trimmed);
    if (existingIdx >= 0) {
      current[existingIdx] = { name: trimmed, rules: { ...rules } };
      savePresetsToStorage(current);
      setPresets(current);
      return true;
    }
    // 超过3个返回false
    if (current.length >= MAX_PRESETS) return false;

    const updated = [...current, { name: trimmed, rules: { ...rules } }];
    savePresetsToStorage(updated);
    setPresets(updated);
    return true;
  }, []);

  const deletePreset = useCallback((index: number): void => {
    const current = loadPresetsFromStorage();
    if (index < 0 || index >= current.length) return;
    const updated = current.filter((_: CustomPreset, i: number) => i !== index);
    savePresetsToStorage(updated);
    setPresets(updated);
  }, []);

  return { presets, savePreset, deletePreset };
}
