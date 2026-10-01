import { useState, useEffect, useCallback } from 'react';
import type { PetType } from '@shared/api.interface';
import { PETS } from '@shared/game-config';
import { safeGetJSON, safeSetJSON } from '@client/src/utils/safeStorage';

const STORAGE_KEY = 'cyber_monopoly_pets';

interface PetStorageData {
  unlockedPets: PetType[];
  equippedPet: PetType | null;
}

const DEFAULT_DATA: PetStorageData = {
  unlockedPets: [],
  equippedPet: null,
};

function readFromStorage(): PetStorageData {
  const data = safeGetJSON<Partial<PetStorageData>>(STORAGE_KEY, {});
  return {
    unlockedPets: data.unlockedPets ?? [],
    equippedPet: data.equippedPet ?? null,
  };
}

function writeToStorage(data: PetStorageData): void {
  safeSetJSON(STORAGE_KEY, data);
}

export function usePetStorage() {
  const [data, setData] = useState<PetStorageData>(() => readFromStorage());

  useEffect(() => {
    writeToStorage(data);
  }, [data]);

  const unlockPet = useCallback((pet: PetType) => {
    setData((prev: PetStorageData) => {
      if (prev.unlockedPets.includes(pet)) return prev;
      return { ...prev, unlockedPets: [...prev.unlockedPets, pet] };
    });
  }, []);

  const equipPet = useCallback((pet: PetType | null) => {
    setData((prev: PetStorageData) => {
      if (pet && !prev.unlockedPets.includes(pet)) return prev;
      return { ...prev, equippedPet: pet };
    });
  }, []);

  const getEquippedPetName = useCallback((): string => {
    if (!data.equippedPet) return '無';
    return PETS[data.equippedPet]?.name ?? data.equippedPet;
  }, [data.equippedPet]);

  return {
    unlockedPets: data.unlockedPets,
    equippedPet: data.equippedPet,
    unlockPet,
    equipPet,
    getEquippedPetName,
  };
}
