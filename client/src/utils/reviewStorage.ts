// 評分與評論統一儲存工具
// localStorage key: cyber_monopoly_reviews_{contentType}_{contentId}

export interface ReviewItem {
  id: string;
  author: string;
  authorScore?: number;
  content: string;
  score: number;
  likes: number;
  createdAt: string;
}

export interface ReviewData {
  ratings: Record<string, number>;
  reviews: ReviewItem[];
}

export type ReviewContentType = 'map' | 'card' | 'mod' | 'scenario';

function getKey(contentType: ReviewContentType, contentId: string): string {
  return `cyber_monopoly_reviews_${contentType}_${contentId}`;
}

export function getReviews(
  contentType: ReviewContentType,
  contentId: string,
): ReviewData {
  try {
    const raw = localStorage.getItem(getKey(contentType, contentId));
    if (raw) {
      const parsed = JSON.parse(raw) as ReviewData;
      if (parsed && typeof parsed === 'object') {
        return {
          ratings: parsed.ratings ?? {},
          reviews: Array.isArray(parsed.reviews) ? parsed.reviews : [],
        };
      }
    }
  } catch {
    // ignore
  }
  return { ratings: {}, reviews: [] };
}

export function submitRating(
  contentType: ReviewContentType,
  contentId: string,
  userId: string,
  score: number,
): void {
  const data = getReviews(contentType, contentId);
  data.ratings[userId] = Math.max(1, Math.min(5, score));
  try {
    localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function addReview(
  contentType: ReviewContentType,
  contentId: string,
  review: ReviewItem,
): void {
  const data = getReviews(contentType, contentId);
  data.reviews.unshift(review);
  try {
    localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
  } catch {
    // ignore
  }
}

export function likeReview(
  contentType: ReviewContentType,
  contentId: string,
  reviewId: string,
): void {
  const data = getReviews(contentType, contentId);
  const review = data.reviews.find((r: ReviewItem) => r.id === reviewId);
  if (review) {
    review.likes += 1;
    try {
      localStorage.setItem(getKey(contentType, contentId), JSON.stringify(data));
    } catch {
      // ignore
    }
  }
}

export function getAverageRating(
  contentType: ReviewContentType,
  contentId: string,
): number {
  const data = getReviews(contentType, contentId);
  const scores = Object.values(data.ratings);
  if (scores.length === 0) return 0;
  const sum = scores.reduce((acc: number, s: number) => acc + s, 0);
  return Math.round((sum / scores.length) * 10) / 10;
}

export function getTotalReviews(
  contentType: ReviewContentType,
  contentId: string,
): number {
  const data = getReviews(contentType, contentId);
  return data.reviews.length;
}

export function isFeatured(avgRating: number, reviewCount: number): boolean {
  return avgRating >= 4.5 && reviewCount >= 3;
}

export interface FeaturedItem {
  id: string;
  [key: string]: unknown;
}

function sortByFeatured<T extends { id: string }>(
  items: T[],
  contentType: ReviewContentType,
): (T & { isFeatured: boolean })[] {
  const withFeatured = items.map((item: T) => {
    const avg = getAverageRating(contentType, item.id);
    const count = getTotalReviews(contentType, item.id);
    return { ...item, isFeatured: isFeatured(avg, count) };
  });
  const featured = withFeatured.filter((item) => item.isFeatured);
  const rest = withFeatured.filter((item) => !item.isFeatured);
  return [...featured, ...rest];
}

export { sortByFeatured };

// 作者積分：從各社區列表統計總點讚數 + 總下載數 × 2
// 傳入 contentItems 格式：{ author: string; likes: number; downloads: number }[]
export function calcAuthorScoreFromItems(
  items: Array<{ author: string; likes: number; downloads: number }>,
): Record<string, number> {
  const scores: Record<string, number> = {};
  for (const item of items) {
    if (!scores[item.author]) scores[item.author] = 0;
    scores[item.author] += item.likes + item.downloads * 2;
  }
  return scores;
}

// 取得作者積分，若無資料給予隨機初始積分 100-500
const authorScoreCache: Record<string, number> = {};

export function getAuthorScore(
  author: string,
  baseItems?: Array<{ author: string; likes: number; downloads: number }>,
): number {
  if (authorScoreCache[author] !== undefined) return authorScoreCache[author];
  let score = 0;
  if (baseItems) {
    for (const item of baseItems) {
      if (item.author === author) {
        score += item.likes + item.downloads * 2;
      }
    }
  }
  if (score === 0) {
    // 基於作者名稱的穩定 hash，給予 100-500 初始積分
    let hash = 0;
    for (let i = 0; i < author.length; i++) {
      hash = (hash * 31 + author.charCodeAt(i)) >>> 0;
    }
    score = 100 + (hash % 401);
  }
  authorScoreCache[author] = score;
  return score;
}
