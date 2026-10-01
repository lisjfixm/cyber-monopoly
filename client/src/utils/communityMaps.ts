// 社區地圖分享工具
import type { CellConfig, CustomMapData } from '@shared/api.interface';
import { CELL_COUNT } from '@shared/game-config';
import { getAuthorScore } from './reviewStorage';

const STORAGE_KEY = 'cyber_monopoly_community_maps';
const LOCAL_KEY = 'cyber_monopoly_custom_maps';
const FAVORITES_KEY = 'cyber_monopoly_favorite_maps';

export const MAP_TAGS = ['經典', '創意', '小型', '大型', '賽博朋克', '廢土風', '奇幻', '科幻', '簡單', '困難'] as const;
export type MapTag = typeof MAP_TAGS[number];

export interface CommunityMap {
  id: string;
  name: string;
  author: string;
  authorScore: number;
  mapData: CellConfig[];
  likes: number;
  downloads: number;
  createdAt: string;
  rating: number;
  ratings: number;
  isFeatured: boolean;
  description: string;
  tags: MapTag[];
}

function defaultMockMaps(): CommunityMap[] {
  const baseCells = (): CellConfig[] => {
    const cells: CellConfig[] = [];
    for (let i = 0; i < CELL_COUNT; i++) {
      cells.push({
        id: i,
        name: `格子${i}`,
        type: 'property',
        basePrice: 1000 + i * 100,
        color: '#00e5ff',
        setId: 'set1',
      });
    }
    cells[0] = { id: 0, name: '起點', type: 'start', basePrice: 0, color: '#00ff88' };
    cells[10] = { id: 10, name: '禁閉區', type: 'detention', basePrice: 0, color: '#a855f7' };
    cells[20] = { id: 20, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
    cells[33] = { id: 33, name: '命運區', type: 'fate', basePrice: 0, color: '#ff4dff' };
    cells[27] = { id: 27, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };
    cells[35] = { id: 35, name: '機會區', type: 'chance', basePrice: 0, color: '#6366f1' };
    return cells;
  };

  return [
    {
       id: 'community_map_neon',
       name: '霓虹迷城',
       author: '地圖大師',
       authorScore: 2450,
       mapData: baseCells(),
       likes: 128,
       downloads: 342,
       createdAt: '2025-03-15T00:00:00.000Z',
       rating: 4.8,
       ratings: 56,
       isFeatured: false,
       description: '經典賽博朋克風格地圖，霓虹燈光瀰漫全城。適合新手入門，地價梯度合理。',
       tags: ['經典', '賽博朋克', '小型'],
    },
    {
       id: 'community_map_wasteland',
       name: '廢土倖存者',
       author: '末日旅人',
       authorScore: 1200,
       mapData: baseCells().map((c) => ({ ...c, color: '#9ca3af' })),
       likes: 89,
       downloads: 198,
       createdAt: '2025-05-20T00:00:00.000Z',
       rating: 4.2,
       ratings: 34,
       isFeatured: false,
       description: '末日廢土風格，物資匱乏，生存優先。地產收益降低，考驗經營能力。',
       tags: ['創意', '廢土風', '困難'],
    },
    {
       id: 'community_map_skycity',
       name: '天空之城',
       author: '建築師',
       authorScore: 3200,
       mapData: baseCells().map((c) => ({ ...c, color: '#60a5fa' })),
       likes: 256,
       downloads: 512,
       createdAt: '2025-01-10T00:00:00.000Z',
       rating: 4.9,
       ratings: 128,
       isFeatured: true,
       description: '漂浮在雲端的夢幻城市，奇幻風格滿滿。地產價值高，適合高手對決。',
       tags: ['奇幻', '大型', '困難'],
    },
    {
       id: 'community_map_hell',
       name: '地獄挑戰',
       author: '地獄使者',
       authorScore: 890,
       mapData: baseCells().map((c) => ({ ...c, color: '#ef4444' })),
       likes: 67,
       downloads: 120,
       createdAt: '2025-06-01T00:00:00.000Z',
       rating: 3.8,
       ratings: 22,
       isFeatured: false,
       description: '超高難度地獄級地圖，命運卡惡意滿滿。挑戰你的運氣和心理素質！',
       tags: ['科幻', '困難', '創意'],
    },
  ];
}

export function getCommunityMaps(): CommunityMap[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as CommunityMap[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  // 初始化 mock 數據
  const mocks = defaultMockMaps();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mocks));
  } catch {
    // ignore
  }
  return mocks;
}

function saveAll(maps: CommunityMap[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(maps));
  } catch {
    // ignore
  }
}

export function getCommunityMapById(id: string): CommunityMap | undefined {
  return getCommunityMaps().find((m) => m.id === id);
}

export function publishMap(map: CustomMapData, author: string, description?: string, tags?: MapTag[]): string {
  const maps = getCommunityMaps();
  const newId = `pub_${Date.now()}`;
  const score = getAuthorScore(author, maps);
  const newMap: CommunityMap = {
    id: newId,
    name: map.name,
    author,
    authorScore: score,
    mapData: map.cells,
    likes: 0,
    downloads: 0,
    createdAt: new Date().toISOString(),
     rating: 0,
     ratings: 0,
     isFeatured: false,
     description: description ?? '',
     tags: tags ?? [],
   };
  maps.unshift(newMap);
  saveAll(maps);
  return newId;
}

export function likeMap(id: string): void {
  const maps = getCommunityMaps();
  const target = maps.find((m) => m.id === id);
  if (target) {
    target.likes += 1;
    saveAll(maps);
  }
}

export function getFavoriteMaps(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (raw) {
      const arr = JSON.parse(raw) as string[];
      if (Array.isArray(arr)) return arr;
    }
  } catch {
    // ignore
  }
  return [];
}

export function toggleFavorite(mapId: string): boolean {
  const favs = getFavoriteMaps();
  const idx = favs.indexOf(mapId);
  let isFav: boolean;
  if (idx >= 0) {
    favs.splice(idx, 1);
    isFav = false;
  } else {
    favs.push(mapId);
    isFav = true;
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch {
    // ignore
  }
  return isFav;
}

export function isFavorite(mapId: string): boolean {
  return getFavoriteMaps().includes(mapId);
}

export function filterMapsByTag(maps: CommunityMap[], tag: string | null): CommunityMap[] {
  if (!tag) return maps;
  return maps.filter((m) => m.tags.includes(tag as MapTag));
}

export function installMap(id: string): boolean {
  const map = getCommunityMapById(id);
  if (!map) return false;

  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    let localMaps: CustomMapData[] = [];
    if (raw) {
      const parsed = JSON.parse(raw) as CustomMapData[];
      if (Array.isArray(parsed)) localMaps = parsed;
    }
    // 避免重複安裝
    if (localMaps.some((m) => m.id === map.id)) return false;
    const newMap: CustomMapData = {
      id: map.id,
      name: map.name,
      cells: map.mapData,
      createdAt: new Date().toISOString(),
    };
    localMaps.unshift(newMap);
    localStorage.setItem(LOCAL_KEY, JSON.stringify(localMaps));

    // 更新下載數
    const maps = getCommunityMaps();
    const target = maps.find((m) => m.id === id);
    if (target) {
      target.downloads += 1;
      saveAll(maps);
    }
    return true;
  } catch {
    return false;
  }
}
