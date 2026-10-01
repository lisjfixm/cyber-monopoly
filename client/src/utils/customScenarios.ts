// 自製劇本工具
import { getAuthorScore } from './reviewStorage';

const LOCAL_KEY = 'cyber_monopoly_custom_scenarios_local';
const COMMUNITY_KEY = 'cyber_monopoly_community_scenarios';

export type VictoryCondition = 'reach_money' | 'own_properties' | 'eliminate_all';

export interface CustomScenario {
  id: string;
  name: string;
  description: string;
  author: string;
  startingMoney: number;
  aiCount: number;
  aiDifficulty: 'easy' | 'normal' | 'hard' | 'extreme';
  victoryCondition: VictoryCondition;
  victoryParam: number;
  maxTurns: number;
  likes: number;
  downloads: number;
  rating: number;
  ratings: number;
  authorScore: number;
  isFeatured: boolean;
  createdAt: string;
}

function readScenarios(key: string): CustomScenario[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as CustomScenario[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore
  }
  return [];
}

function writeScenarios(key: string, scenarios: CustomScenario[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(scenarios));
  } catch {
    // ignore
  }
}

function defaultCommunityScenarios(): CustomScenario[] {
  return [
    {
      id: 'scenario_speed',
      name: '極速挑戰',
      description: '快速節奏的挑戰賽，15 回合內擊敗對手即勝利',
      author: '速度狂魔',
      startingMoney: 5000,
      aiCount: 1,
      aiDifficulty: 'normal',
      victoryCondition: 'eliminate_all',
      victoryParam: 0,
      maxTurns: 15,
      likes: 178,
      downloads: 356,
      rating: 4.5,
      ratings: 62,
      authorScore: 890,
      isFeatured: false,
      createdAt: '2025-03-20T00:00:00.000Z',
    },
    {
      id: 'scenario_billionaire',
      name: '億萬富翁之路',
      description: '從 10000 元開始，目標成為億萬富翁',
      author: '地產大亨',
      startingMoney: 10000,
      aiCount: 3,
      aiDifficulty: 'hard',
      victoryCondition: 'reach_money',
      victoryParam: 100000,
      maxTurns: 0,
      likes: 342,
      downloads: 684,
      rating: 4.8,
      ratings: 115,
      authorScore: 1710,
      isFeatured: true,
      createdAt: '2025-01-25T00:00:00.000Z',
    },
    {
      id: 'scenario_hell',
      name: '地獄難度',
      description: '極限難度挑戰，初始資金稀少，AI 兇狠',
      author: '地獄使者',
      startingMoney: 3000,
      aiCount: 2,
      aiDifficulty: 'extreme',
      victoryCondition: 'eliminate_all',
      victoryParam: 0,
      maxTurns: 0,
      likes: 95,
      downloads: 190,
      rating: 3.6,
      ratings: 27,
      authorScore: 475,
      isFeatured: false,
      createdAt: '2025-05-30T00:00:00.000Z',
    },
  ];
}

export function getLocalScenarios(): CustomScenario[] {
  return readScenarios(LOCAL_KEY);
}

export function saveLocalScenario(scenario: CustomScenario): void {
  const scenarios = readScenarios(LOCAL_KEY);
  const idx = scenarios.findIndex((s) => s.id === scenario.id);
  if (idx >= 0) {
    scenarios[idx] = scenario;
  } else {
    scenarios.unshift(scenario);
  }
  writeScenarios(LOCAL_KEY, scenarios);
}

export function deleteLocalScenario(id: string): void {
  const scenarios = readScenarios(LOCAL_KEY).filter((s) => s.id !== id);
  writeScenarios(LOCAL_KEY, scenarios);
}

export function getCommunityScenarios(): CustomScenario[] {
  const scenarios = readScenarios(COMMUNITY_KEY);
  if (scenarios.length === 0) {
    const defaults = defaultCommunityScenarios();
    writeScenarios(COMMUNITY_KEY, defaults);
    return defaults;
  }
  return scenarios;
}

export function getCommunityScenarioById(id: string): CustomScenario | undefined {
  return getCommunityScenarios().find((s) => s.id === id);
}

export function publishScenario(scenario: CustomScenario, author: string): string {
  const scenarios = getCommunityScenarios();
  const newId = `scenario_pub_${Date.now()}`;
  const score = getAuthorScore(author, scenarios);
  const newScenario: CustomScenario = {
    ...scenario,
    id: newId,
    author,
    authorScore: score,
    likes: 0,
    downloads: 0,
    rating: 0,
    ratings: 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  scenarios.unshift(newScenario);
  writeScenarios(COMMUNITY_KEY, scenarios);
  return newId;
}

export function installScenario(id: string): boolean {
  const communityScenarios = getCommunityScenarios();
  const scenario = communityScenarios.find((s) => s.id === id);
  if (!scenario) return false;

  const localScenarios = readScenarios(LOCAL_KEY);
  if (localScenarios.some((s) => s.id === scenario.id)) return false;

  localScenarios.unshift({ ...scenario });
  writeScenarios(LOCAL_KEY, localScenarios);

  const target = communityScenarios.find((s) => s.id === id);
  if (target) {
    target.downloads += 1;
    writeScenarios(COMMUNITY_KEY, communityScenarios);
  }
  return true;
}

export function likeScenario(id: string): void {
  const scenarios = getCommunityScenarios();
  const target = scenarios.find((s) => s.id === id);
  if (target) {
    target.likes += 1;
    writeScenarios(COMMUNITY_KEY, scenarios);
  }
}
