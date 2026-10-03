import { r as reactExports } from "./index-Clt-7orM.js";
const STORAGE_KEY = "cyber_monopoly_skins";
const DEFAULT_DATA = {
  pawn: "default",
  dice: "default",
  unlockedPawn: ["default"],
  unlockedDice: ["default"]
};
function readFromStorage() {
  if (typeof window === "undefined") return DEFAULT_DATA;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      pawn: parsed.pawn ?? "default",
      dice: parsed.dice ?? "default",
      unlockedPawn: parsed.unlockedPawn ?? ["default"],
      unlockedDice: parsed.unlockedDice ?? ["default"]
    };
  } catch {
    return DEFAULT_DATA;
  }
}
function writeToStorage(data) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
  }
}
function useSkinStorage() {
  const [data, setData] = reactExports.useState(() => readFromStorage());
  reactExports.useEffect(() => {
    writeToStorage(data);
  }, [data]);
  const setPawnSkin = reactExports.useCallback((skin) => {
    setData((prev) => ({
      ...prev,
      pawn: skin
    }));
  }, []);
  const setDiceSkin = reactExports.useCallback((skin) => {
    setData((prev) => ({
      ...prev,
      dice: skin
    }));
  }, []);
  const unlockPawnSkin = reactExports.useCallback((skin) => {
    setData((prev) => {
      if (prev.unlockedPawn.includes(skin)) return prev;
      return {
        ...prev,
        unlockedPawn: [...prev.unlockedPawn, skin]
      };
    });
  }, []);
  const unlockDiceSkin = reactExports.useCallback((skin) => {
    setData((prev) => {
      if (prev.unlockedDice.includes(skin)) return prev;
      return {
        ...prev,
        unlockedDice: [...prev.unlockedDice, skin]
      };
    });
  }, []);
  return {
    pawnSkin: data.pawn,
    diceSkin: data.dice,
    unlockedPawnSkins: data.unlockedPawn,
    unlockedDiceSkins: data.unlockedDice,
    setPawnSkin,
    setDiceSkin,
    unlockPawnSkin,
    unlockDiceSkin
  };
}
export {
  useSkinStorage as u
};
