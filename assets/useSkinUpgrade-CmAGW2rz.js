import { d as createLucideIcon, r as reactExports, aF as safeGetJSON, aG as safeSetJSON } from "./index-Clt-7orM.js";
const __iconNode = [
  ["path", { d: "M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8", key: "1p45f6" }],
  ["path", { d: "M21 3v5h-5", key: "1q7to0" }]
];
const RotateCw = createLucideIcon("rotate-cw", __iconNode);
const STORAGE_KEY = "cyber_monopoly_skin_upgrade";
const UPGRADE_COSTS = {
  1: 10,
  2: 30,
  3: Infinity
};
function readFromStorage() {
  const data = safeGetJSON(STORAGE_KEY, {});
  return {
    fragments: data.fragments ?? 0,
    levels: data.levels ?? {}
  };
}
function writeToStorage(data) {
  safeSetJSON(STORAGE_KEY, data);
}
function useSkinUpgrade() {
  const [data, setData] = reactExports.useState(() => readFromStorage());
  reactExports.useEffect(() => {
    writeToStorage(data);
  }, [data]);
  const addFragments = reactExports.useCallback((amount) => {
    setData((prev) => ({
      ...prev,
      fragments: prev.fragments + amount
    }));
  }, []);
  const getSkinLevel = reactExports.useCallback((skinId) => {
    return data.levels[skinId] ?? 1;
  }, [data.levels]);
  const getUpgradeCost = reactExports.useCallback((skinId) => {
    const currentLevel = getSkinLevel(skinId);
    if (currentLevel >= 3) return Infinity;
    return UPGRADE_COSTS[currentLevel];
  }, [getSkinLevel]);
  const canUpgrade = reactExports.useCallback((skinId) => {
    const cost = getUpgradeCost(skinId);
    return data.fragments >= cost && cost !== Infinity;
  }, [data.fragments, getUpgradeCost]);
  const upgradeSkin = reactExports.useCallback((skinId) => {
    let success = false;
    setData((prev) => {
      const currentLevel = prev.levels?.[skinId] ?? 0;
      if (currentLevel >= 3) return prev;
      const cost = UPGRADE_COSTS[currentLevel];
      if (!cost || prev.fragments < cost) return prev;
      success = true;
      return {
        ...prev,
        fragments: prev.fragments - cost,
        levels: {
          ...prev.levels,
          [skinId]: currentLevel + 1
        }
      };
    });
    return success;
  }, []);
  const isLegendary = reactExports.useCallback((skinId) => {
    return getSkinLevel(skinId) >= 3;
  }, [getSkinLevel]);
  return {
    fragments: data.fragments,
    levels: data.levels,
    addFragments,
    getSkinLevel,
    getUpgradeCost,
    canUpgrade,
    upgradeSkin,
    isLegendary
  };
}
export {
  RotateCw as R,
  useSkinUpgrade as u
};
