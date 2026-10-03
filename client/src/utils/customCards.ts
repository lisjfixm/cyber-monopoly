// 自製卡牌與社區卡牌工具
import type { CardEffect } from '@shared/api.interface';

const LOCAL_KEY = 'cyber_monopoly_custom_cards_local';
const COMMUNITY_KEY = 'cyber_monopoly_community_cards';

export interface CustomCard {
  id: string;
  name: string;
  description: string;
  cardType: 'fate' | 'chance';
  effect: CardEffect;
  author: string;
  likes: number;
  downloads: number;
  rating: number;
  ratings: number;
  isFeatured: boolean;
  createdAt: string;
}

function isCardLike(data: unknown): data is CustomCard {
  if (typeof data !== 'object' || data === null) return false;
  const c = data as Record<string, unknown>;
  return (
    typeof c.id === 'string' &&
    typeof c.name === 'string' &&
    typeof c.description === 'string'
  );
}

function readCards(key: string): CustomCard[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw) as unknown;
      if (Array.isArray(parsed)) return parsed.filter(isCardLike);
    }
  } catch {
    // ignore
  }
  return [];
}

function writeCards(key: string, cards: CustomCard[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(cards));
  } catch {
    // ignore
  }
}

function defaultCommunityCards(): CustomCard[] {
  return [
    {
      id: 'card_hack',
      name: '駭客入侵',
      description: '你的系統被駭客入侵，損失 2000 元',
      cardType: 'fate',
      effect: { type: 'money', amount: -2000 },
      author: '駭客王者',
      likes: 156,
      downloads: 312,
      rating: 4.3,
      ratings: 45,
      isFeatured: false,
      createdAt: '2025-04-10T00:00:00.000Z',
    },
    {
      id: 'card_luckystar',
      name: '幸運星降臨',
      description: '幸運之星降臨，獲得 3000 元獎金',
      cardType: 'fate',
      effect: { type: 'money', amount: 3000 },
      author: '命運女神',
      likes: 234,
      downloads: 480,
      rating: 4.7,
      ratings: 89,
      isFeatured: true,
      createdAt: '2025-02-15T00:00:00.000Z',
    },
    {
      id: 'card_blackmarket',
      name: '黑市交易',
      description: '從黑市交易中偷取其他玩家 1500 元',
      cardType: 'chance',
      effect: { type: 'steal_money', amount: 1500 },
      author: '商業大亨',
      likes: 89,
      downloads: 176,
      rating: 4.1,
      ratings: 28,
      isFeatured: false,
      createdAt: '2025-05-05T00:00:00.000Z',
    },
    {
      id: 'card_timerewind',
      name: '時光倒流',
      description: '時光逆流，後退 5 步',
      cardType: 'chance',
      effect: { type: 'backward', steps: 5 },
      author: '科學家',
      likes: 67,
      downloads: 134,
      rating: 3.9,
      ratings: 19,
      isFeatured: false,
      createdAt: '2025-06-12T00:00:00.000Z',
    },
  ];
}

export function getLocalCustomCards(cardType?: 'fate' | 'chance'): CustomCard[] {
  const cards = readCards(LOCAL_KEY);
  if (cardType) return cards.filter((c) => c.cardType === cardType);
  return cards;
}

export function saveLocalCard(card: CustomCard): void {
  const cards = readCards(LOCAL_KEY);
  const idx = cards.findIndex((c) => c.id === card.id);
  if (idx >= 0) {
    cards[idx] = card;
  } else {
    cards.unshift(card);
  }
  writeCards(LOCAL_KEY, cards);
}

export function deleteLocalCard(id: string): void {
  const cards = readCards(LOCAL_KEY).filter((c) => c.id !== id);
  writeCards(LOCAL_KEY, cards);
}

export function getCommunityCards(cardType?: 'fate' | 'chance'): CustomCard[] {
  let cards = readCards(COMMUNITY_KEY);
  if (cards.length === 0) {
    cards = defaultCommunityCards();
    writeCards(COMMUNITY_KEY, cards);
  }
  if (cardType) return cards.filter((c) => c.cardType === cardType);
  return cards;
}

export function getCommunityCardById(id: string): CustomCard | undefined {
  return getCommunityCards().find((c) => c.id === id);
}

export function publishCard(card: CustomCard, author: string): string {
  const cards = getCommunityCards();
  const newId = `card_pub_${Date.now()}`;
  const newCard: CustomCard = {
    ...card,
    id: newId,
    author,
    likes: 0,
    downloads: 0,
    rating: 0,
    ratings: 0,
    isFeatured: false,
    createdAt: new Date().toISOString(),
  };
  cards.unshift(newCard);
  writeCards(COMMUNITY_KEY, cards);
  return newId;
}

export function installCard(id: string): boolean {
  const communityCards = getCommunityCards();
  const card = communityCards.find((c) => c.id === id);
  if (!card) return false;

  const localCards = readCards(LOCAL_KEY);
  if (localCards.some((c) => c.id === card.id)) return false;

  localCards.unshift({ ...card });
  writeCards(LOCAL_KEY, localCards);

  // 更新下載數
  const target = communityCards.find((c) => c.id === id);
  if (target) {
    target.downloads += 1;
    writeCards(COMMUNITY_KEY, communityCards);
  }
  return true;
}

export function likeCard(id: string): void {
  const cards = getCommunityCards();
  const target = cards.find((c) => c.id === id);
  if (target) {
    target.likes += 1;
    writeCards(COMMUNITY_KEY, cards);
  }
}
